# Vendored GSAP files

Self-hosted so the site has no third-party request on first paint and still
animates offline / behind a strict CSP.

- Source: the `gsap` npm package (`npm run vendor:js` re-copies these files).
- Version: GSAP 3.15.0 — `gsap.min.js`, `ScrollTrigger`, `SplitText`,
  `ScrollToPlugin`, `Observer`, `CustomEase`, `ScrambleTextPlugin`.
- Licence: GreenSock's [Standard "no charge" licence](https://gsap.com/standard-license) —
  free for commercial and client work, including bundling inside a website like
  this one. It is **not** MIT: you may not re-publish these files as a library,
  or ship them inside a product/theme whose value is GSAP itself.

If you would rather not keep the files in the repo, swap the `<script>` tags in
`resources/views/layouts/app.blade.php` for the CDN equivalents
(`https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/…`) and delete this folder —
`public/js/animations.js` degrades to the CSS/IntersectionObserver reveals in
`site.js` when `window.gsap` is missing, so nothing breaks either way.
