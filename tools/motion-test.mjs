/**
 * Motion-layer smoke test.
 *
 * Loads a rendered page from the dev server into jsdom, inlines the same script
 * tags the layout emits (GSAP core + plugins, site.js, animations.js), runs it,
 * and reports what the motion layer built. There is no browser in this
 * sandbox, so this is how the animation code gets executed rather than only
 * read: it catches typos, missing globals and anything that would throw at
 * boot — the failure mode that used to leave the page covered by the curtain.
 *
 *   node tools/motion-test.mjs [http://127.0.0.1:8000/]
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:8000/';
/* Mode flags first: the matchMedia stub below reads them. */
const reduce = !!process.env.REDUCE;
const noGsap = !!process.env.NOGSAP;
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const ORDER = [
  'js/vendor/gsap.min.js',
  'js/vendor/ScrollTrigger.min.js',
  'js/vendor/SplitText.min.js',
  'js/vendor/ScrambleTextPlugin.min.js',
  'js/vendor/ScrollToPlugin.min.js',
  'js/vendor/Observer.min.js',
  'js/vendor/CustomEase.min.js',
  'js/site.js',
  'js/animations.js',
];

// NOGSAP=1 simulates the vendor files failing to load, which is the case the
// whole design has to survive: site.js keeps its own reveals and nothing hides.
const list = noGsap ? ORDER.filter((p) => !p.includes('/vendor/')) : ORDER;
const files = list.map((p) => [p, readFileSync(join(pub, p), 'utf8')]);

const res = await fetch(base);
const html = await res.text();

// Strip external/deferred script tags, keep everything else.
const stripped = html.replace(/<script[\s\S]*?<\/script>/g, (m) =>
  /application\/ld\+json/.test(m) ? m : ''
);

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.detail?.message || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', (...a) => { /* layout warnings from jsdom are noise */ });

const dom = new JSDOM(stripped, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: base,
});

const { window } = dom;

// A few things jsdom does not provide and GSAP touches. Tell it this is a
// desktop pointer, otherwise the pointer-driven effects are correctly skipped
// and the test proves nothing about them. REDUCE=1 flips the motion queries off
// to exercise the prefers-reduced-motion path instead.
window.matchMedia = (q) => {
  const key = String(q).replace(/\s+/g, ' ');
  let matches = false;
  if (/prefers-reduced-motion/.test(key)) matches = reduce;
  else if (/hover: hover/.test(key) && /pointer: fine/.test(key)) matches = !reduce;
  else if (/prefers-contrast|scripting/.test(key)) matches = true;
  return { matches, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
};
window.scrollTo = () => {};
window.scroll = () => {};
if (window.Element.prototype.scrollIntoView) window.Element.prototype.scrollIntoView = () => {};
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
if (!window.Element.prototype.animate) window.Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel() {} });
Object.defineProperty(window, 'getComputedStyle', { value: window.getComputedStyle });

for (const [path, src] of files) {
  try {
    window.eval(src);
  } catch (e) {
    errors.push(`throw in ${path}: ${e.message}`);
  }
}

// Let rAF-driven code (timelines, ScrollTrigger refresh) tick, then fast-forward
// anything still mid-flight so the assertions look at settled state.
await new Promise((r) => setTimeout(r, 400));
window.dispatchEvent(new window.Event('DOMContentLoaded'));
await new Promise((r) => setTimeout(r, 400));
try {
  // Seek the root timeline itself (callbacks fire, so onComplete handlers that
  // hand transforms back to CSS are exercised), then every child tween.
  window.eval("gsap.globalTimeline.totalTime(gsap.globalTimeline.duration() + 3, false); gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { if (t && t.totalTime) { t.totalTime(t.totalDuration(), false); } });");
} catch (e) { /* the fast-forward is a convenience, not the subject */ }
await new Promise((r) => setTimeout(r, 220));

const d = window.document;
const q = (s) => d.querySelectorAll(s).length;
const check = [];
const yes = (label, cond, extra = '') => check.push([cond ? 'ok  ' : 'FAIL', label, extra]);

/* Always true, motion layer or not. */
yes('json-ld still parseable', (() => {
  const n = d.querySelector('script[type="application/ld+json"]');
  if (!n) return false;
  try { JSON.parse(n.textContent); return true; } catch { return false; }
})());
yes('nothing on screen left hidden', [...d.querySelectorAll('[data-reveal]')].every((el) => el.style.opacity !== '0' || el.getBoundingClientRect().top >= (window.innerHeight || 800)));
yes('fader cleared or hidden', !d.querySelector('#fader') || d.body.classList.contains('loaded'));
/* Elements whose stylesheet :hover sets a transform must not be left holding an
   inline one from JS, or the hover state stops working for ever. */
const HOVERED = '.step, .daylist__item a, .next__link, .dest-row a';
const midTransform = [...d.querySelectorAll(HOVERED)].filter((el) => el.style.transform);
yes('CSS :hover transforms stay reachable', midTransform.length === 0,
  midTransform.map((el) => el.className + ' {' + el.getAttribute('style') + '}').slice(0, 3).join(' | '));

/* A pointer passing over a card must leave no trace behind. */
const tiltCard = d.querySelector('.tour-card');
if (tiltCard && !reduce) {
  const rect = { clientX: 120, clientY: 90 };
  tiltCard.dispatchEvent(new window.Event('pointerenter', { bubbles: true }));
  tiltCard.dispatchEvent(new window.Event('pointermove', { bubbles: true }));
  Object.assign(tiltCard, {});
  // jsdom gives zero-size boxes, so feed the coordinates GSAP reads directly
  const mv = new window.Event('pointermove', { bubbles: true });
  mv.clientX = rect.clientX; mv.clientY = rect.clientY;
  tiltCard.dispatchEvent(mv);
  tiltCard.dispatchEvent(new window.Event('pointerleave', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 1300));
  yes('tilt applied then released cleanly', !tiltCard.classList.contains('tilt') && !tiltCard.style.transform,
    `style="${tiltCard.getAttribute('style') || 'none'}"`);
}

if (noGsap) {
  /* The degradation path: vendor files missing means site.js owns the reveals. */
  yes('GSAP absent', typeof window.gsap !== 'object');
  yes('motion layer did not claim the page', d.documentElement.getAttribute('data-motion') !== 'ok');
  yes('site.js revealed what is on screen', [...d.querySelectorAll('[data-reveal]')].every((el) => el.classList.contains('is-in')));
  yes('no injected motion furniture', q('.cursor-badge') === 0 && q('.progress-rule') === 0);
} else {
  yes('html gets data-motion=ok', d.documentElement.getAttribute('data-motion') === 'ok');
  yes('html gets .motion (curtain handed to GSAP)', d.documentElement.classList.contains('motion'));
  yes('window.gsap', typeof window.gsap === 'object');
  yes('ScrollTrigger registered', !!window.ScrollTrigger);
  yes('SplitText registered', !!window.SplitText);
  yes('ScrambleTextPlugin registered', !!window.ScrambleTextPlugin);
  yes('progress rule injected', q('.progress-rule') === 1);
  yes('marquee rows duplicated for a seamless loop', q('.marquee__row') >= 2 || q('.marquee') === 0, `rows=${q('.marquee__row')}`);
  yes('reveals resolved', q('[data-reveal]') === 0 || q('[data-reveal].is-in') === q('[data-reveal]'), `${q('[data-reveal].is-in')}/${q('[data-reveal]')}`);

  /* Pointer-driven furniture is deliberately absent when motion is reduced. */
  const pointerEffects = !reduce;
  yes('cursor badge over the grids', q('.cursor-badge') === 1 || (q('.itn__grid') === 0 && q('.packages__grid') === 0) || !pointerEffects, `badge=${q('.cursor-badge')}`);
  yes('tilt listeners on cards', q('.tour-card') === 0 || pointerEffects, `cards=${q('.tour-card')}`);
  yes('process progress bar', q('.process__progress') === 1 || !d.querySelector('.steps__list') || !pointerEffects);
  yes('no inline transform on the steps (CSS hover survives)', !reduce ? [...d.querySelectorAll('.step')].every((el) => !el.style.transform) : true);
}

console.log(`\n${base}  (${res.status})\n`);
for (const [state, label, extra] of check) console.log(` ${state} ${label}${extra ? '  — ' + extra : ''}`);
if (errors.length) {
  console.log('\nRUNTIME ERRORS:');
  for (const e of errors.slice(0, 12)) console.log('  ! ' + e.slice(0, 220));
} else {
  console.log('\nno runtime errors');
}
const failed = check.filter((c) => c[0] === 'FAIL').length + errors.length;
console.log(`\n${failed ? failed + ' problem(s)' : 'all clean'}\n`);
process.exit(failed ? 1 : 0);
