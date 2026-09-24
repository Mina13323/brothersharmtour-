/**
 * Motion smoke test.
 *
 * There is no browser in this sandbox, so this is how the animation code gets
 * executed rather than only read: it fetches a rendered page, keeps the JSON-LD,
 * throws away the markup, loads the real scripts in the real order and runs them
 * in jsdom. It catches the two failures that matter — a script that throws at
 * boot, and content left invisible by an animation that never ran. It asserts no
 * pixels, and it also asserts that the furniture which was taken out stays out.
 *
 *   node tools/motion-test.mjs [http://127.0.0.1:8000/]
 *
 *   REDUCE=1   same, with prefers-reduced-motion on: the page must resolve
 *   NOGSAP=1   same, with public/js/vendor missing: site.js must carry the reveals
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:8000/';
const reduce = !!process.env.REDUCE;
const noGsap = !!process.env.NOGSAP;
const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(repo, 'public');

/* The layout's own list, so this file can never drift from what pages load. */
const layout = readFileSync(join(repo, 'resources/views/layouts/app.blade.php'), 'utf8');
const declared = [...layout.matchAll(/'(js\/[^']+\.js)'/g)].map((m) => m[1]);

const missing = noGsap
  ? declared.filter((p) => !p.includes('/vendor/'))
  : declared;

const read = (p) => {
  try {
    return readFileSync(join(pub, p), 'utf8');
  } catch (e) {
    return null;
  }
};

const res = await fetch(base);
const html = await res.text();
const stripped = html.replace(/<script[\s\S]*?<\/script>/g, (m) =>
  /application\/ld\+json/.test(m) ? m : ''
);

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.detail?.message || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(stripped, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: base,
});
const { window } = dom;

/* jsdom gaps that would otherwise be reported as our bugs. */
window.matchMedia = (q) => {
  const key = String(q).replace(/\s+/g, ' ');
  let matches = false;
  if (/prefers-reduced-motion/.test(key)) matches = reduce;
  else if (/hover: hover/.test(key) && /pointer: fine/.test(key)) matches = !reduce;
  else if (/scripting/.test(key)) matches = true;
  return { matches, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
};
window.scrollTo = () => {};
window.scroll = () => {};
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
if (!window.Element.prototype.animate) window.Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel() {} });

for (const p of missing) {
  const src = read(p);
  if (src === null) {
    errors.push(`missing file listed by the layout: public/${p}`);
    continue;
  }
  try {
    window.eval(src);
  } catch (e) {
    errors.push(`throw in ${p}: ${e.message}`);
  }
}

/* Let rAF-driven code tick, then seek the root timeline so onComplete handlers
   (which hand the transform back to CSS) actually run before we look. */
await new Promise((r) => setTimeout(r, 380));
window.dispatchEvent(new window.Event('DOMContentLoaded'));
window.dispatchEvent(new window.Event('load'));
await new Promise((r) => setTimeout(r, 380));
if (window.gsap) {
  try {
    window.eval("gsap.globalTimeline.totalTime(gsap.globalTimeline.duration() + 2, false); gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { if (t && t.totalTime) { t.totalTime(t.totalDuration(), false); } });");
  } catch (e) { /* the fast-forward is a convenience, not the subject */ }
}
await new Promise((r) => setTimeout(r, 260));

const d = window.document;
const q = (s) => d.querySelectorAll(s).length;
const check = [];
const yes = (label, cond, extra = '') => check.push([cond ? 'ok  ' : 'FAIL', label, extra]);

const hidden = [...d.querySelectorAll('[data-reveal]')].filter(
  (el) => el.style.opacity === '0' && el.getBoundingClientRect().top < (window.innerHeight || 800)
);

/* ---------------------------------------------------------------- content */
yes('the layout lists the files that exist', missing.length > 0, `${missing.length} scripts`);
yes('json-ld parses', (() => {
  const n = d.querySelector('script[type="application/ld+json"]');
  if (!n) return false;
  try { JSON.parse(n.textContent); return true; } catch { return false; }
})());
yes('nothing on screen left invisible', hidden.length === 0, hidden.map((e) => e.className).slice(0, 2).join(' | '));
yes('curtain gone', !d.querySelector('#fader') || d.body.classList.contains('loaded') || d.querySelector('#fader').style.display === 'none');
yes('no element holds a transform that would beat a CSS :hover',
  [...d.querySelectorAll('.step, .daylist__item a, .next__link')].every((el) => !el.style.transform));

/* ------------------------------------------------------------ what is NOT */
yes('no cursor badge', q('.cursor-badge') === 0);
yes('no scroll-progress rule', q('.progress-rule') === 0);
yes('no marquee band', q('.marquee') === 0);
yes('no tilt scaffolding', q('.tilt') === 0);
const heavy = /SplitText|ScrambleText|ScrollToPlugin|CustomEase|Observer\.min/.exec(html);
yes('no page loads a plugin we removed', !heavy, heavy ? heavy[0] : '');

/* --------------------------------------------------------------- the mode */
if (noGsap) {
  yes('GSAP absent', typeof window.gsap !== 'object');
  yes('motion layer did not claim the page', d.documentElement.getAttribute('data-motion') !== 'ok');
  yes('site.js revealed what is on screen', [...d.querySelectorAll('[data-reveal]')].every((el) => el.classList.contains('is-in')));
} else {
  yes('page marked data-motion=ok', d.documentElement.getAttribute('data-motion') === 'ok');
  yes('gsap + ScrollTrigger only', typeof window.gsap === 'object' && !!window.ScrollTrigger && !window.SplitText);
  yes('reveals resolve', q('[data-reveal]') === 0 || q('[data-reveal].is-in') > 0, `${q('[data-reveal].is-in')}/${q('[data-reveal]')}`);
}

console.log(`\n${base}  (${res.status})${reduce ? '  reduced-motion' : ''}${noGsap ? '  no GSAP' : ''}\n`);
for (const [state, label, extra] of check) console.log(` ${state} ${label}${extra ? '  — ' + extra : ''}`);
if (errors.length) {
  console.log('\nRUNTIME ERRORS:');
  for (const e of errors.slice(0, 10)) console.log('  ! ' + e.slice(0, 200));
} else {
  console.log('\nno runtime errors');
}

const failed = check.filter((c) => c[0] === 'FAIL').length + errors.length;
console.log(`\n${failed ? failed + ' problem(s)' : 'all clean'}\n`);
process.exit(failed ? 1 : 0);
