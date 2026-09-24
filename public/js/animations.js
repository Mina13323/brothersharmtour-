/**
 * Motion — deliberately quiet.
 *
 * One file, two behaviours: the first screen fades in and the photograph
 * settles, and every block marked `data-reveal` lifts into place once as you
 * reach it. That is all of it. No pointer effects, no scrubbed parallax, no
 * text assembly — this is a catalogue of photographs and plain information about
 * them, and the animation should read as good manners rather than as a feature.
 * The curtain, the header, the menus and the sliders belong to
 * public/js/site.js; this file does not touch them.
 *
 * Progressive enhancement, in the ways that matter:
 *
 *   - nothing is hidden by CSS waiting for a tween, so a dead script leaves the
 *     page exactly where it would have ended up anyway;
 *   - if GSAP is absent this file returns immediately and site.js keeps its own
 *     IntersectionObserver reveals;
 *   - if GSAP is present but ScrollTrigger is not, or motion is reduced, every
 *     element resolves to its final state here instead of waiting for a trigger
 *     that will never arrive;
 *   - when a reveal finishes, the inline transform goes back to the stylesheet,
 *     because a leftover translate() outlives the animation and quietly
 *     overrides the :hover rules the cards define.
 *
 * Two vendored files, both self-hosted: gsap.min.js and ScrollTrigger.min.js.
 */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;

    if (!window.gsap) { return; }

    if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); }
    var hasScrollTrigger = !!window.ScrollTrigger;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var EASE = 'power2.out';   /* the only ease used */
    var RISE = 14;             /* px — small on purpose */
    var DUR = 0.65;            /* s  — also small on purpose */
    var STEP = 0.05;           /* s  between elements that arrive together */

    function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
    function one(sel, ctx) { return (ctx || doc).querySelector(sel); }
    function each(items, fn) { for (var i = 0; i < items.length; i++) { fn(items[i], i); } }

    /* Clear only the properties this file writes, and nothing else. */
    function release(el) {
        var props = ['transform', 'translate', 'rotate', 'scale', 'opacity'];
        for (var i = 0; i < props.length; i++) { el.style.removeProperty(props[i]); }
    }

    function finish(targets) {
        each(targets, function (el) {
            el.classList.add('is-in');
            gsap.killTweensOf(el);
            release(el);
        });
    }

    root.setAttribute('data-motion', 'ok');
    root.classList.add('motion');

    /* ------------------------------------------------------------------ *
     * Reduced motion, or no scroll engine: resolve the page and stop.
     * No inline styles are written on this path, so the stylesheet stays
     * the only owner of how anything looks at rest.
     * ------------------------------------------------------------------ */
    if (reduced || !hasScrollTrigger) {
        each(all('[data-reveal]'), function (el) { el.classList.add('is-in'); });
        return;
    }

    /* ------------------------------------------------------------------ *
     * 1 · The first screen. The photograph is already there and slows to a
     *     standstill; the words fade up behind it, under the curtain.
     * ------------------------------------------------------------------ */
    var hero = one('.hero, .page-hero');

    if (hero) {
        var tl = gsap.timeline({ defaults: { ease: EASE, immediateRender: false } });
        var media = one('[data-media]', hero) || one('.hero__media, .page-hero__media', hero);

        if (media) {
            tl.fromTo(media,
                { opacity: 0, scale: 1.03 },
                { opacity: 1, scale: 1, duration: 1.3, onComplete: function () { finish(this.targets()); } },
                0);
        }

        tl.fromTo(
            all('.eyebrow, .display, .hero__lede, .page-hero__lede, .hero__actions > *, .page-hero__actions > *', hero),
            { opacity: 0, y: 12 },
            {
                opacity: 1, y: 0, duration: DUR, stagger: STEP,
                onComplete: function () { finish(this.targets()); }
            },
            0.1
        );

        /* Anything in the hero marked for reveal is done when the line above
           lands — CSS never holds it back waiting for a scroll. */
        each(all('[data-reveal]', hero), function (el) { el.classList.add('is-in'); });
    }

    /* ------------------------------------------------------------------ *
     * 2 · Scroll reveals. One rule: as an element's top passes 92% of the
     *     viewport it fades up, once, and is never animated again.
     * ------------------------------------------------------------------ */
    var pending = all('[data-reveal]').filter(function (el) {
        return !el.closest('.hero, .page-hero');
    });

    each(pending, function (el) {
        gsap.set(el, { opacity: 0, y: RISE });

        ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            once: true,
            onEnter: function () {
                gsap.to(el, {
                    opacity: 1, y: 0, duration: DUR, ease: EASE,
                    onComplete: function () { finish([el]); }
                });
            }
        });
    });

    /* Nothing already on screen may stay hidden because a trigger did not
       compute — webfonts, Drive thumbnails and lazy images all move the page
       while it loads. Below the fold, the triggers keep their timing, so this
       never spoils a scroll. */
    window.addEventListener('load', function () {
        requestAnimationFrame(function () {
            var h = window.innerHeight || root.clientHeight || 800;
            var visible = pending.filter(function (el) {
                return !el.classList.contains('is-in') && el.getBoundingClientRect().top < h;
            });

            each(visible, function (el) {
                gsap.to(el, {
                    opacity: 1, y: 0, duration: DUR, delay: STEP * visible.indexOf(el), ease: EASE,
                    onComplete: function () { finish([el]); }
                });
            });

            ScrollTrigger.refresh();
        });
    });
}());
