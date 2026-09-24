# Vendored JavaScript

Two files, copied from the npm package, self-hosted so the site has no CDN dependency:

- `gsap.min.js` — the core tween engine
- `ScrollTrigger.min.js` — the only plugin used, for scroll-triggered reveals

Refresh them after `npm i` with `npm run vendor:js` (see `package.json`, which lists the
same two files).

**Licence.** These are not MIT. They are distributed under the [GreenSock Standard
"no-charge" licence](https://gsap.com/community/standard-license/), which permits commercial
use on a website like this one without payment. SplitText, ScrambleText and the other Club
GreenSock plugins are **not** covered by that licence and are deliberately not used here.

`public/js/animations.js` works without these files: if `window.gsap` is missing it stands
down and `public/js/site.js` reveals content with its own IntersectionObserver instead.
