/**
 * Navbar and burger-menu behaviour test.
 *
 * The mobile panel is the kind of thing that looks fine in a screenshot and is
 * broken in a hand: a menu that swallows the tap that should have navigated, a
 * scroll lock nobody releases, a list that hides itself on a rotated tablet. All
 * of that is DOM and ARIA behaviour, so all of it can be tested without a
 * browser — this file boots a rendered page with the real site.js and drives it
 * with clicks and keys.
 *
 *   node tools/nav-test.mjs [http://127.0.0.1:8000/]
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:8000/';
const repo = join(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
// jsdom has no browsing context, so following a link reports a stub instead:
// "Not implemented: navigation (except hash changes)" or the "another Document"
// phrasing, depending on where the link points. That IS the test passing — the
// link was followed as far as a headless document can follow one. Every other
// "Not implemented" stub is ignored on the same grounds, and only those: a real
// fault in site.js arrives as an uncaught error, and that is reported.
const ignored = /^Not implemented:|Could not parse CSS/;
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => {
  const message = e.detail?.message || e.message || '';
  if (!ignored.test(message)) { errors.push('jsdomError: ' + message); }
});
vc.on('error', (...a) => {
  const message = a.join(' ');
  if (!ignored.test(message)) { errors.push('console.error: ' + message); }
});

const res = await fetch(base);
const html = await res.text();

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: base,
  resources: undefined,
  // Only the behaviour layer runs: no Drive, no fonts, no GSAP needed here.
});
const { window } = dom;
const d = window.document;

// jsdom has no layout, and this site's script reads nothing from layout, but the
// media query still has to answer like a phone.
let wide = false;
const listeners = [];
window.matchMedia = (q) => {
  const mql = {
    media: q,
    matches: /min-width: 1080px/.test(q) ? wide : false,
    addEventListener: (_t, fn) => listeners.push(fn),
    removeEventListener() {},
    addListener: (fn) => listeners.push(fn),
    removeListener() {},
  };
  return mql;
};

const site = readFileSync(join(repo, 'public/js/site.js'), 'utf8');
try {
  window.eval(site);
} catch (e) {
  errors.push('throw in site.js: ' + e.message);
}
d.dispatchEvent(new window.Event('DOMContentLoaded'));
await new Promise((r) => setTimeout(r, 60));

const check = [];
const yes = (label, cond, extra = '') => check.push([cond ? 'ok  ' : 'FAIL', label, extra]);
const click = (el) => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
const key = (k, target, opts = {}) => (target || d).dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));

const body = d.body;
const toggle = d.getElementById('menu-toggle');
const panel = d.getElementById('primary-nav');
const open = () => body.classList.contains('menu-open');

/* ------------------------------------------------------------- the markup */
yes('one nav, bar and panel together', d.querySelectorAll('nav.nav').length === 1);
yes('burger controls it', toggle && toggle.getAttribute('aria-controls') === 'primary-nav');
yes('burger starts collapsed', toggle && toggle.getAttribute('aria-expanded') === 'false');
yes('panel is labelled', panel && panel.getAttribute('aria-label') === 'Primary');
yes('the panel has contact content', !!(panel && panel.querySelector('.nav__foot a')));
yes('no contact link is empty', [...(panel?.querySelectorAll('.nav__foot a') ?? [])].every((a) => (a.getAttribute('href') || '').length > 1));

const expanders = [...d.querySelectorAll('.nav__expander')];
yes('every dropdown has a control of its own', expanders.length > 0, `${expanders.length} items`);
yes('each control points at a real list', expanders.every((b) => {
  const id = b.getAttribute('aria-controls');
  return id && d.getElementById(id) && d.getElementById(id).classList.contains('nav__sub');
}));
yes('parents stay navigable', [...d.querySelectorAll('.nav__item--has-children > .nav__link')].every((a) => {
  const href = a.getAttribute('href') || '';
  return href.startsWith('/') && !a.getAttribute('onclick');
}));
yes('js-menu is what collapses lists', body.classList.contains('js-menu'));

/* --------------------------------------------------------------- opening */
click(toggle);
yes('click opens the panel', open());
yes('aria-expanded follows', toggle.getAttribute('aria-expanded') === 'true');
yes('focus moves into the panel', panel.contains(d.activeElement), d.activeElement?.className || d.activeElement?.tagName);

/* ------------------------------------------------------------- dropdowns */
const item = panel.querySelector('.nav__item--has-children');
const button = item.querySelector('.nav__expander');
click(button);
yes('the list opens', item.classList.contains('sub-open'));
yes('and says so', button.getAttribute('aria-expanded') === 'true');

/* The tap that used to be stolen: the parent link must still navigate. */
const parentLink = item.querySelector('.nav__link');
const nav = new window.Event('click', { bubbles: true, cancelable: true });
parentLink.dispatchEvent(nav);
yes('the parent link is not intercepted', !nav.defaultPrevented, parentLink.getAttribute('href'));
yes('and its click closes the panel', !open());

click(toggle);
const others = [...panel.querySelectorAll('.nav__expander')].filter((b) => b !== button);
if (others.length) {
  click(button);
  click(others[0]);
  yes('one list at a time', item.classList.contains('sub-open') === false || others[0].closest('.nav__item').classList.contains('sub-open'));
  yes('closing one opens exactly one', panel.querySelectorAll('.nav__item.sub-open').length === 1);
}

/* --------------------------------------------------------- closing paths */
click(toggle);
key('Escape');
yes('escape closes it', !open());

click(toggle);
const telLink = panel.querySelector('.nav__contact a[href^="tel"], .nav__foot a[href^="tel"]');
if (telLink) {
  click(telLink);
  yes('a tel: link releases the scroll lock', !open(), telLink.getAttribute('href'));
} else {
  yes('a tel: link releases the scroll lock', true, 'no phone configured — nothing to trap');
}

click(toggle);
const subLink = panel.querySelector('.nav__sub a');
click(subLink);
yes('choosing from a list closes the panel', !open());

/* --------------------------------------------------------- keyboard walk */
click(toggle);
const focusables = [...panel.querySelectorAll('a[href], button:not([disabled])')];
focusables[focusables.length - 1].focus();
const tab = new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
panel.dispatchEvent(tab);
yes('tab from the last row reaches the burger', tab.defaultPrevented && d.activeElement === toggle);

const shiftTab = new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
focusables[0].focus();
panel.dispatchEvent(shiftTab);
yes('shift-tab from the first wraps to the end', shiftTab.defaultPrevented && d.activeElement === focusables[focusables.length - 1]);

/* ------------------------------------------------------------ widen up */
click(toggle);
wide = true;
window.dispatchEvent(new window.Event('resize'));
listeners.forEach((fn) => fn({ matches: true, media: '(min-width: 1080px)' }));
await new Promise((r) => setTimeout(r, 20));
yes('a wider viewport drops the panel state', !open());
yes('and leaves nothing expanded', panel.querySelectorAll('.nav__item.sub-open').length === 0);
yes('the desktop bar keeps its own links', panel.querySelectorAll('.nav__link').length > 4);


/* ---------------------------------------------------------------- the stylesheet
   jsdom has no layout engine, which is exactly how the panel ended up a flex row
   of five clipped items on a phone: every assertion above passed while the page
   was unusable. So the rules the menu depends on are read out of the file and
   checked here, with the same brace matching a browser would do. */
const css = readFileSync(join(repo, 'public/css/site.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function blockOf(at) {
  const start = css.indexOf(at);
  if (start === -1) { return ''; }

  let depth = 0;
  let i = css.indexOf('{', start);

  for (; i < css.length; i++) {
    if (css[i] === '{') { depth++; }
    else if (css[i] === '}' && --depth === 0) { break; }
  }

  return css.slice(css.indexOf('{', start) + 1, i);
}

const phone = blockOf('@media (max-width: 1079px)');
const bar = blockOf('@media (min-width: 1080px)');
const decl = (block, sel) => {
  const re = new RegExp('(?:^|[},])\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm');
  const m = block.match(re);
  return m ? m[1] : '';
};

yes('the panel is scoped to phones', phone.length > 200 && !/\.nav\s*\{[^}]*display:\s*none/.test(bar));
yes('the burger is scoped to phones', /display:\s*none/.test(decl(bar, '.menu-toggle')));
yes('one open panel rule per stack', /\.nav\s*\{[^}]*position:\s*fixed/.test(phone));
yes('the panel starts under the bar', /inset:\s*var\(--header-h\)/.test(phone) && /top:\s*var\(--header-h\)/.test(phone), 'longhands before inset, for old engines');
yes('the list is stacked, not a row', /flex-direction:\s*column/.test(decl(phone, '.nav__list')), decl(phone, '.nav__list').trim().slice(0, 40));
yes('the rows fill the width', /width:\s*100%/.test(decl(phone, '.nav__item')));
yes('the rows are fingertip height', parseFloat(decl(phone, '.nav__link').match(/min-height:\s*([\d.]+)rem/)?.[1] || 0) >= 3);
yes('the caret is replaced by the button', /display:\s*none/.test(decl(phone, '.nav__caret')) && !/display:\s*none/.test(decl(phone, '.nav__expander')));
yes('the dropdown control is a target', parseFloat(decl(phone, '.nav__expander').match(/width:\s*([\d.]+)rem/)?.[1] || 0) >= 2.5);
yes('the dropdown opens in flow', /position:\s*static/.test(decl(phone, '.nav__sub')));
yes('a trip row is a target, not a text line', parseFloat(decl(phone, '.nav__sub a').match(/min-height:\s*([\d.]+)rem/)?.[1] || 0) >= 3);
yes('so is a contact row', parseFloat(decl(phone, '.nav__contact li').match(/min-height:\s*([\d.]+)rem/)?.[1] || 0) >= 2.75);
yes('and the panel opts out of tap delay', /touch-action:\s*manipulation/.test(phone));
yes('no script still reaches every link', /display:\s*block/.test(decl(phone, 'body:not(.js-menu) .nav')));
yes('the phone-only actions leave the bar', /display:\s*none/.test(decl(phone, '.nav__phone,\n    .nav__whatsapp')) || /display:\s*none/.test(decl(phone, '.nav__phone')));
yes('the contact block is hidden at base', /^\.nav__foot \{ display: none; \}$/m.test(css), 'outside every media query, so no desktop width can show it');
yes('the bar keeps its height while open', /body\.menu-open\.scrolled \.site-header/.test(phone));
yes('the bar does not animate against the panel', /transition:\s*none/.test(phone));
yes('the page behind is locked', /body\.menu-open \{[^}]*overflow:\s*hidden/.test(phone));
yes('and locked on iOS too', /html:has\(body\.menu-open\)[^{]*\{[^}]*overflow:\s*hidden/.test(phone));
yes('the panel stops scroll chaining', /overscroll-behavior:\s*contain/.test(phone));
yes('the foot clears the home indicator', /env\(safe-area-inset-bottom/.test(phone));

console.log(`\n${base}  (${res.status})\n`);
for (const [state, label, extra] of check) console.log(` ${state} ${label}${extra ? '  — ' + extra : ''}`);
if (errors.length) {
  console.log('\nRUNTIME ERRORS:');
  for (const e of errors.slice(0, 8)) console.log('  ! ' + e.slice(0, 200));
}
const failed = check.filter((c) => c[0] === 'FAIL').length + errors.length;
console.log(`\n${failed ? failed + ' problem(s)' : 'all clean'}\n`);
process.exit(failed ? 1 : 0);
