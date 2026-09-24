/*!
 * Brothers Sharm Tour — motion layer
 * ---------------------------------------------------------------------------
 * Everything here is an enhancement on top of the CSS. It runs only when the
 * vendored GSAP files are present (`window.gsap`); without them public/js/site.js
 * keeps its own IntersectionObserver reveals and the page still reads correctly.
 *
 * Rules this file sticks to:
 *   • Nothing is hidden by CSS waiting for a tween. Initial states are applied
 *     here with gsap.set(), so a failed script load can never leave a blank page.
 *   • Every effect is individually guarded — a missing plugin degrades one
 *     effect, not the file.
 *   • Motion reads as weight and calm, not bounce: power4/expo eases, short
 *     staggers, no elastic overshoot on type. It is a travel desk, not a toy.
 *   • prefers-reduced-motion is honoured per effect via gsap.matchMedia().
 */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;

    if (!window.gsap || !doc.body) { return; }

    var gsap = window.gsap;
    var hasScrollTrigger = !!window.ScrollTrigger;
    var hasSplitText = !!window.SplitText;
    var hasScramble = !!window.ScrambleTextPlugin;
    var hasScrollTo = !!window.ScrollToPlugin;
    var hasObserver = !!window.Observer;
    var hasCustomEase = !!window.CustomEase;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasScrollTrigger) { gsap.registerPlugin(ScrollTrigger); }
    if (hasSplitText) { gsap.registerPlugin(SplitText); }
    if (hasScramble) { gsap.registerPlugin(ScrambleTextPlugin); }
    if (hasScrollTo) { gsap.registerPlugin(ScrollToPlugin); }
    if (hasCustomEase) {
        gsap.registerPlugin(CustomEase);
        /* The house curve: leaves fast, lands soft. Used for every reveal. */
        try {
            CustomEase.create('bst-out', 'M0,0 C0.05,0.6 0.132,0.924 0.24,0.995 0.42,1.09 0.62,1 1,1');
            CustomEase.create('bst-inout', 'M0,0 C0.4,0 0.2,1 0.5,1 0.8,1 0.6,1 1,1');
        } catch (e) { /* falls back to power4 below */ }
    }

    var EASE_OUT = gsap.parseEase ? (gsap.parseEase('bst-out') || 'power4.out') : 'power4.out';
    var EASE_IN_OUT = 'bst-inout';

    root.setAttribute('data-motion', 'ok');

    /* ------------------------------------------------------------------ utils */
    function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
    function one(sel, ctx) { return (ctx || doc).querySelector(sel); }

    /* Once a tween is finished, hand the animated properties back to the
       stylesheet. GSAP's own clearProps leaves its transform cache behind on
       some builds, which would keep an inline translate() forever and quietly
       kill the :hover transforms the cards define — so remove them by name.
       Only the properties this file writes are touched. */
    function release(el) {
        var props = ['transform', 'translate', 'rotate', 'scale', 'opacity', 'transform-style'];
        for (var i = 0; i < props.length; i++) { el.style.removeProperty(props[i]); }
    }
    function on(el, type, fn, opts) { if (el) { el.addEventListener(type, fn, opts || false); } }
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function each(list, fn) {
        list.forEach(function (el, i) {
            try { fn(el, i); } catch (e) { /* one bad node must not stop the rest */ }
        });
    }

    /* Small helper: run `setup` for scroll-linked work, or do nothing when the
       user has asked for calm. `finalize` puts elements straight in their end
       state so the page is never half-drawn. */
    function whenMoved(setup, finalize) {
        if (reduced) {
            if (finalize) { try { finalize(); } catch (e) {} }
            return;
        }
        try {
            setup();
        } catch (e) {
            if (finalize) { try { finalize(); } catch (e2) { /* stay silent */ } }
        }
    }

    function trigger(config) {
        if (!hasScrollTrigger) { return null; }
        return ScrollTrigger.create(config);
    }

    /* ==========================================================================
       1 · Curtain and masthead
       ========================================================================== */
    function intro() {
        var fader = one('#fader');
        var hero = one('.hero, .page-hero');

        root.classList.add('motion');

        if (!fader) {
            if (hero) { heroIn(hero); }
            return;
        }

        var word = one('.fader__word', fader);
        var splitWord = null;

        var tl = gsap.timeline({
            defaults: { ease: EASE_OUT },
            onComplete: function () {
                doc.body.classList.add('loaded');
                if (splitWord) { splitWord.revert(); }
                gsap.set(fader, { clearProps: 'all' });
            }
        });

        tl.set(fader, { yPercent: 0, autoAlpha: 1 });

        if (word && hasSplitText) {
            try {
                splitWord = SplitText.create(word, { type: 'chars', aria: 'hidden' });
                tl.from(splitWord.chars, { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.028 }, 0);
            } catch (e) {
                tl.from(word, { opacity: 0, duration: 0.4 }, 0);
            }
        }

        tl.to(fader, { yPercent: -100, duration: 1.05, ease: EASE_IN_OUT }, '>-0.15');

        if (hero) { tl.add(function () { heroIn(hero); }, '-=0.62'); }

        /* The masthead and header actions arrive as the curtain lifts. */
        tl.fromTo('.site-header .logo, .site-header .nav__link, .site-header__actions > *',
            { yPercent: -140, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.035, ease: EASE_OUT, clearProps: 'transform', immediateRender: false },
            0.25);
    }

    /* Hero: the photograph is wiped open rather than faded, so the first thing
       you see is a movement of light across the reef. */
    function heroIn(hero) {
        var media = one('[data-media] img, .page-hero__media img', hero);
        var scrim = one('.page-hero__scrim', hero);
        var title = one('h1', hero);
        var lede = one('.page-hero__lede, .hero__lede', hero);
        var actions = one('.hero__actions, .page-hero__actions', hero);
        var tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

        if (media) {
            tl.fromTo(media,
                { clipPath: 'inset(0 0 100% 0)', scale: 1.16, yPercent: 4 },
                { clipPath: 'inset(0 0 0% 0)', scale: 1, yPercent: 0, duration: 1.6, immediateRender: false }, 0);
        }
        if (scrim) { tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, immediateRender: false }, 0.15); }

        if (title && hasSplitText) {
            try {
                var split = SplitText.create(title, { type: 'lines', aria: 'hidden' });
                tl.fromTo(split.lines, { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.09, immediateRender: false }, 0.3);
            } catch (e) {
                tl.fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, immediateRender: false }, 0.3);
            }
        } else if (title) {
            tl.fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, immediateRender: false }, 0.3);
        }

        each(all('[data-reveal]', hero), function (el) { el.classList.add('is-in'); });

        var show = { opacity: 1, immediateRender: false, clearProps: 'transform' };
        tl.fromTo(one('.eyebrow', hero), { opacity: 0, x: -18 }, Object.assign({ x: 0, duration: 0.7 }, show), 0.25)
          .fromTo(lede, { opacity: 0, y: 22 }, Object.assign({ y: 0, duration: 0.8 }, show), '-=0.55')
          .fromTo(one('.hero__foot, .page-hero__foot', hero), { opacity: 0, y: 18 }, Object.assign({ y: 0, duration: 0.7 }, show), '-=0.5')
          .fromTo(actions ? actions.children : [], { opacity: 0, y: 16 }, Object.assign({ y: 0, duration: 0.6, stagger: 0.07 }, show), '-=0.5');
    }

    /* ==========================================================================
       2 · Scroll reveals — takes over from site.js and adds masks + stagger
       ========================================================================== */
    function reveals() {
        whenMoved(function () {
            if (!hasScrollTrigger) {
                /* No scroll engine: site.js already skipped its own observer
                   because GSAP is present, so put everything in its end state
                   here rather than leaving it waiting for a trigger. */
                /* No inline styles here on purpose: html.motion already resolves
                   [data-reveal] to its visible state, and writing a transform
                   would shadow the :hover transforms the cards define in CSS. */
                each(all('[data-reveal]'), function (el) { el.classList.add('is-in'); });
                return;
            }

            var pending = all('[data-reveal]').filter(function (el) {
                /* The hero belongs to the intro timeline. */
                return !el.closest('.hero, .page-hero');
            });

            each(pending, function (el) {
                var deep = el.hasAttribute('data-reveal-deep');
                gsap.set(el, { opacity: 0, y: deep ? 54 : 26 });

                el._bstReveal = function () {
                    if (el._bstShown) { return; }
                    el._bstShown = true;
                    gsap.to(el, {
                        opacity: 1,
                        y: 0,
                        duration: deep ? 1.15 : 0.9,
                        ease: EASE_OUT,
                        onComplete: function () {
                            el.classList.add('is-in');
                            /* Kill first: a live tween would write its cached
                               transform back on the next render. */
                            gsap.killTweensOf(el);
                            /* Hand the transform back to CSS. Several revealed
                               elements (.step, .tile, .area) have their own
                               :hover transform in the stylesheet, and an inline
                               transform from GSAP would beat it forever. */
                            release(el);
                        }
                    });
                    /* Ken Burns on the media inside, once. */
                    var img = one('[data-media] img, img', el);
                    if (img && el.querySelector('.tile__media, .area__media, .story-card__media')) {
                        gsap.fromTo(img, { scale: 1.16 }, { scale: 1, duration: 1.8, ease: EASE_OUT }, 0);
                    }
                };

                ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: el._bstReveal });
            });

            /* Nothing that is already on screen may stay hidden because a trigger
               did not compute — fonts, images and Drive photographs all move the
               page around while it loads. Below the fold, the triggers keep their
               timing, so this never spoils a scroll. */
            window.addEventListener('load', function () {
                requestAnimationFrame(function () {
                    var h = window.innerHeight || doc.documentElement.clientHeight;
                    each(pending, function (el) {
                        if (!el._bstShown && el.getBoundingClientRect().top < h) { el._bstReveal(); }
                    });
                });
            });
        }, function () {
            /* Reduced motion: no tweens, just the finished state. */
            each(all('[data-reveal]'), function (el) { el.classList.add('is-in'); });
        });
    }

    /* Section headings: lines rising out of their own mask. */
    function headlineMasks() {
        if (!hasSplitText) { return; }
        whenMoved(function () {
            each(all('.section-head .display, .split__text .display, .prose-block .display, .packages__head .display'), function (el) {
                if (el.closest('.hero, .page-hero')) { return; }
                var split = SplitText.create(el, { type: 'lines', aria: 'hidden', linesOnly: true });
                gsap.set(split.lines, { yPercent: 112, opacity: 0 });
                gsap.set(el, { overflow: 'hidden', paddingBottom: '0.08em' });

                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                    onEnter: function () {
                        gsap.to(split.lines, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.085, ease: EASE_OUT });
                    }
                });
            });
        });
    }

    /* Eyebrows decode into place. Only the ones near the top of a section, so
       the effect reads as a signature rather than fuss. */
    function eyebrowScramble() {
        if (!hasScramble) { return; }
        whenMoved(function () {
            each(all('.section-head .eyebrow, .packages__head .eyebrow, .essay__head .eyebrow'), function (el) {
                var text = (el.textContent || '').trim();
                if (!text) { return; }
                el.setAttribute('data-bst-text', text);

                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 92%',
                    once: true,
                    onEnter: function () {
                        gsap.to(el, {
                            duration: 1.05,
                            scrambleText: { text: text, chars: 'upperCase', speed: 0.4 },
                            ease: 'none',
                            onComplete: function () { el.textContent = text; }
                        });
                    }
                });
            });
        }, function () {
            each(all('[data-bst-text]'), function (el) { el.textContent = el.getAttribute('data-bst-text'); });
        });
    }

    /* ==========================================================================
       3 · Depth: parallax, skew, and the sea line at the bottom of a section
       ========================================================================== */
    function parallax() {
        whenMoved(function () {
            if (!hasScrollTrigger) { return; }
            each(all('.tile__media, .area__media, .story-card__media, .approach__media, .article__hero, .why__media, .steps__bg, .trip-meta__media'), function (box) {
                var img = one('img', box);
                if (!img || img.closest('.hero, .page-hero')) { return; }
                gsap.set(img, { height: '118%', yPercent: -8 });
                gsap.fromTo(img,
                    { yPercent: -7 },
                    {
                        yPercent: 7,
                        ease: 'none',
                        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true }
                    });
            });
        }, function () {
            each(all('.tile__media img, .area__media img, .story-card__media img, .approach__media img, .article__hero img, .why__media img, .steps__bg img'), function (img) {
                gsap.set(img, { clearProps: 'all' });
            });
        });
    }

    /* Fast scrolling leans the horizontal strips; they settle as you stop. */
    function velocitySkew() {
        whenMoved(function () {
            if (!hasScrollTrigger) { return; }
            each(all('.gallery__strip, .spot__strip, .where__track, .stories__grid, .packages__grid'), function (track) {
                var proxy = { skew: 0 };
                var set = gsap.quickSetter(track, 'skewY', 'deg');
                ScrollTrigger.create({
                    trigger: track,
                    start: 'top bottom',
                    end: 'bottom top',
                    onUpdate: function (self) {
                        var v = clamp(self.getVelocity() / -300, -4, 4);
                        if (Math.abs(v) > Math.abs(proxy.skew)) {
                            proxy.skew = v;
                            gsap.to(proxy, { skew: 0, duration: 0.75, ease: EASE_OUT, overwrite: true, onUpdate: function () { set(proxy.skew); } });
                        }
                    }
                });
            });
        });
    }

    /* ==========================================================================
       4 · Cards: rise, tilt, and a cursor badge on the trip tiles
       ========================================================================== */
    function cardGrids() {
        whenMoved(function () {
            each(all('.itn__grid, .stories__grid, .packages__grid, .areas__grid, .split__cards, .stats__grid, .filters__list'), function (grid) {
                var kids = Array.prototype.filter.call(grid.children, function (c) { return c.nodeType === 1; });
                if (kids.length < 2) { return; }
                gsap.set(kids, { opacity: 0, y: 46 });
                ScrollTrigger.create({
                    trigger: grid,
                    start: 'top 90%',
                    once: true,
                    onEnter: function () {
                        gsap.to(kids, { opacity: 1, y: 0, duration: 1, stagger: 0.075, ease: EASE_OUT, overwrite: true });
                    }
                });
            });
        });
    }

    function cardTilt() {
        if (!finePointer || !window.matchMedia || reduced) { return; }
        whenMoved(function () {
            each(all('.tour-card, .package-card, .story-card'), function (card) {
                var media = one('[data-media], .tour-card__media, .package-card__media', card);
                var img = one('img', media || card);
                /* Nothing is written to the card until a pointer actually moves
                   over it: an inline transform at page load would shadow the
                   stylesheet's own hover states, and `will-change` on twenty cards
                   at once costs more than it buys. The 3D properties travel with
                   the tweens instead. */
                var TILT = { duration: 0.6, ease: 'power3.out', transformPerspective: 1000, transformStyle: 'preserve-3d' };
                var rotX = gsap.quickTo(card, 'rotationX', TILT);
                var rotY = gsap.quickTo(card, 'rotationY', TILT);
                var lift = gsap.quickTo(card, 'y', { duration: 0.55, ease: 'power3.out', transformPerspective: 1000, transformStyle: 'preserve-3d' });
                var shift = img ? gsap.quickTo(img, 'xPercent', { duration: 0.7, ease: 'power3.out' }) : null;
                var shiftY = img ? gsap.quickTo(img, 'yPercent', { duration: 0.7, ease: 'power3.out' }) : null;

                on(card, 'pointermove', function (e) {
                    card.classList.add('tilt');
                    var r = card.getBoundingClientRect();
                    var px = (e.clientX - r.left) / r.width - 0.5;
                    var py = (e.clientY - r.top) / r.height - 0.5;
                    rotY(px * 5.5);
                    rotX(-py * 4.5);
                    lift(-8);
                    if (shift) { shift(px * 6); shiftY(py * 6); }
                });
                on(card, 'pointerleave', function () {
                    rotX(0); rotY(0); lift(0);
                    if (shift) { shift(0); shiftY(0); }
                    /* When the reset has landed, drop the 3D scaffolding so the
                       card returns exactly to its CSS state — the stylesheet's
                       own :hover transforms on the media live underneath it. */
                    gsap.delayedCall(0.8, function () {
                        gsap.killTweensOf(card);
                        release(card);
                        if (img) { gsap.killTweensOf(img); release(img); }
                        card.classList.remove('tilt');
                    });
                });
            });
        });
    }

    /* The "view trip" disc that follows the pointer across the trip grid —
       the one flourish that makes a catalogue feel like it is offering
       something rather than sitting there. */
    function cursorBadge() {
        if (!finePointer || reduced) { return; }
        var grid = one('.itn__grid, .packages__grid');
        if (!grid) { return; }

        var badge = doc.createElement('span');
        badge.className = 'cursor-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = '<span class="cursor-badge__ring"></span><span class="cursor-badge__text">view</span>';
        doc.body.appendChild(badge);

        var xTo = gsap.quickTo(badge, 'x', { duration: 0.42, ease: 'power3.out' });
        var yTo = gsap.quickTo(badge, 'y', { duration: 0.42, ease: 'power3.out' });
        var label = one('.cursor-badge__text', badge);

        on(grid, 'pointermove', function (e) {
            var card = e.target.closest ? e.target.closest('.tour-card, .package-card') : null;
            if (!card) {
                gsap.to(badge, { autoAlpha: 0, scale: 0.5, duration: 0.3 });
                return;
            }
            var link = one('a', card);
            var txt = (link && link.getAttribute('data-badge')) || (one('.tour-card__title, .package-card__title', card) || {}).textContent || 'view';
            if (label.textContent !== txt) { label.textContent = txt; }
            xTo(e.clientX);
            yTo(e.clientY);
            gsap.to(badge, { autoAlpha: 1, scale: 1, duration: 0.35, ease: EASE_OUT });
        });
        on(grid, 'pointerleave', function () { gsap.to(badge, { autoAlpha: 0, duration: 0.25 }); });
    }

    /* Buttons lean toward the pointer while it is on them. */
    function magneticButtons() {
        if (!finePointer || reduced) { return; }
        each(all('.btn, .link-more'), function (btn) {
            var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'elastic.out(1 0.55)' });
            var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'elastic.out(1 0.55)' });
            on(btn, 'pointermove', function (e) {
                var r = btn.getBoundingClientRect();
                xTo(clamp((e.clientX - r.left - r.width / 2) * 0.22, -9, 9));
                yTo(clamp((e.clientY - r.top - r.height / 2) * 0.3, -7, 7));
            });
            on(btn, 'pointerleave', function () { xTo(0); yTo(0); });
        });
    }

    /* ==========================================================================
       5 · Numbers, process, marquee
       ========================================================================== */
    function counters() {
        whenMoved(function () {
            each(all('.stat__value'), function (el) {
                var final = (el.textContent || '').trim();
                var num = parseFloat(final.replace(/[^0-9.]/g, ''));
                if (!isFinite(num) || num === 0) { return; }
                var suffix = final.replace(/^[^0-9.]*/, '').replace(/[0-9.,]+/, '');
                var decimals = (final.split('.')[1] || '').replace(/[^0-9]/g, '').length;
                var obj = { v: 0 };

                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 94%',
                    once: true,
                    onEnter: function () {
                        gsap.to(obj, {
                            v: num,
                            duration: 1.9,
                            ease: 'power2.out',
                            onUpdate: function () {
                                el.textContent = (decimals ? obj.v.toFixed(decimals) : Math.round(obj.v).toLocaleString('en-GB')) + suffix;
                            },
                            onComplete: function () { el.textContent = final; }
                        });
                    }
                });
            });
        });
    }

    /* The four booking steps draw a line as you read them. */
    function processLine() {
        whenMoved(function () {
            var list = one('.steps__list');
            if (!list) { return; }
            var bar = doc.createElement('span');
            bar.className = 'process__progress';
            bar.setAttribute('aria-hidden', 'true');
            list.appendChild(bar);

            gsap.fromTo(bar,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
                });

            /* The steps themselves already reveal through [data-reveal], so this
               only marks which one you are reading: a class, never an inline
               transform, because .step:hover owns the transform in CSS and an
               inline one would kill it. */
            each(all('.step', list), function (li) {
                ScrollTrigger.create({
                    trigger: li,
                    start: 'top 72%',
                    end: 'bottom 40%',
                    onToggle: function (self) { li.classList.toggle('is-current', self.isActive); }
                });
            });
        }, function () {
            each(all('.steps__list .step'), function (li) { li.classList.remove('is-current'); });
        });
    }

    /* A ticker of what we actually run, driven by scroll velocity: reading it
       while the page moves is the whole point of putting it there. */
    function marquee() {
        var band = one('[data-marquee]');
        if (!band) { return; }

        var names = all('.tour-card__title').map(function (el) { return el.textContent.trim(); });
        var extra = (band.getAttribute('data-marquee') || '').split('|').filter(Boolean);
        var items = extra.length ? extra : names.slice(0, 12);
        if (!items.length) { return; }

        var track = one('.marquee__track', band) || (function () {
            var t = doc.createElement('div');
            t.className = 'marquee__track';
            band.appendChild(t);
            return t;
        })();

        var row = items.map(function (n) {
            return '<span class="marquee__item">' + n.replace(/[<>&]/g, '') + '<i aria-hidden="true">◆</i></span>';
        }).join('');
        track.innerHTML = '<span class="marquee__row">' + row + '</span><span class="marquee__row" aria-hidden="true">' + row + '</span>';

        var rows = all('.marquee__row', track);
        var tween = gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
        var speed = 1;

        if (hasObserver && window.ScrollTrigger) {
            ScrollTrigger.create({
                onUpdate: function (self) {
                    var v = clamp(1 + Math.abs(self.getVelocity()) / 900, 1, 6);
                    if (v !== speed) {
                        speed = v;
                        gsap.to(tween, { timeScale: v, duration: 0.4, overwrite: true });
                        gsap.to(tween, { timeScale: 1, duration: 1.1, delay: 0.35, overwrite: true });
                    }
                }
            });
        }

        /* Two stacked rows moving opposite ways, the top one fading at the
           edges so it never looks cut off. */
        if (rows.length === 2) { gsap.set(rows[1], { opacity: 0.32 }); }

        on(band, 'pointerenter', function () { tween.pause(); });
        on(band, 'pointerleave', function () { tween.resume(); });
    }

    /* ==========================================================================
       6 · Films, gallery, share
       ========================================================================== */
    function mediaIn() {
        whenMoved(function () {
            each(all('.film__frame, .gallery__frame, .spot__frame'), function (box) {
                var inner = one('iframe, img', box);
                if (!inner) { return; }
                gsap.set(box, { clipPath: 'inset(0 0 100% 0)' });
                ScrollTrigger.create({
                    trigger: box,
                    start: 'top 90%',
                    once: true,
                    onEnter: function () {
                        gsap.to(box, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: EASE_OUT });
                        gsap.fromTo(inner, { scale: 1.12 }, { scale: 1, duration: 1.4, ease: EASE_OUT }, 0);
                    }
                });
            });
        }, function () {
            each(all('.film__frame, .gallery__frame, .spot__frame'), function (box) { gsap.set(box, { clearProps: 'clipPath' }); });
        });
    }

    /* ==========================================================================
       7 · Filters: let the grid leave before the page reloads
       ========================================================================== */
    function filterTransitions() {
        var grid = one('.itn__grid');
        var chips = one('.filters__list');
        if (!grid || !chips || reduced) { return; }

        on(chips, 'click', function (e) {
            var a = e.target.closest ? e.target.closest('a') : null;
            var href = a && a.getAttribute('href');
            if (!href || a.target === '_blank') { return; }
            e.preventDefault();
            gsap.to(grid.children, {
                opacity: 0,
                y: -18,
                duration: 0.22,
                stagger: 0.012,
                ease: 'power2.in',
                onComplete: function () { window.location.href = href; }
            });
        });
    }

    /* ==========================================================================
       8 · Reading aids: progress rule and smooth anchors
       ========================================================================== */
    function progressRule() {
        var bar = doc.createElement('div');
        bar.className = 'progress-rule';
        bar.setAttribute('aria-hidden', 'true');
        bar.innerHTML = '<span class="progress-rule__fill"></span><span class="progress-rule__label"></span>';
        doc.body.appendChild(bar);

        var fill = one('.progress-rule__fill', bar);
        var label = one('.progress-rule__label', bar);

        if (hasScrollTrigger) {
            gsap.to(fill, {
                scaleX: 1,
                ease: 'none',
                transformOrigin: 'left center',
                scrollTrigger: { start: 0, end: 'max', scrub: 0.35 }
            });
        }

        var heads = all('main h2.display, main h1.display, .section-head .display');
        var current = '';
        each(heads, function (h) {
            trigger({
                trigger: h,
                start: 'top 40%',
                end: 'bottom 40%',
                onToggle: function (self) {
                    if (!self.isActive) { return; }
                    var t = (h.textContent || '').trim().slice(0, 34);
                    if (t === current) { return; }
                    current = t;
                    gsap.timeline()
                        .to(label, { y: -8, opacity: 0, duration: 0.18, ease: 'power2.in' })
                        .add(function () { label.textContent = t; })
                        .to(label, { y: 0, opacity: 1, duration: 0.3, ease: EASE_OUT });
                }
            });
        });
    }

    function smoothAnchors() {
        if (!hasScrollTo) { return; }
        on(doc, 'click', function (e) {
            var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!a || reduced) { return; }
            var id = a.getAttribute('href').slice(1);
            var target = id && doc.getElementById(id);
            if (!target) { return; }
            e.preventDefault();
            gsap.to(window, {
                duration: 0.9,
                ease: 'power3.inOut',
                scrollTo: { y: target, offsetY: parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 90 }
            });
        });
    }

    /* ==========================================================================
       9 · Packages — same language as the rest, staged like a price list
       ========================================================================== */
    function packagesMotion() {
        whenMoved(function () {
            each(all('.package-card'), function (card) {
                var feat = card.classList.contains('is-featured');
                gsap.fromTo(card,
                    { opacity: 0, y: feat ? 70 : 46, scale: feat ? 0.96 : 1 },
                    { opacity: 1, y: 0, scale: 1, duration: feat ? 1.2 : 1, ease: EASE_OUT,
                      onComplete: function () { each(this.targets(), release); },
                      scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
            });

            each(all('.package-card__price'), function (price) {
                gsap.fromTo(price,
                    { opacity: 0, y: 16 },
                    {
                        opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: EASE_OUT,
                        onComplete: function () { each(this.targets(), release); },
                        scrollTrigger: { trigger: price, start: 'top 92%', once: true }
                    });
            });
        });
    }

    /* ==========================================================================
       Boot
       ========================================================================== */
    function boot() {
        intro();
        reveals();
        headlineMasks();
        eyebrowScramble();
        parallax();
        velocitySkew();
        cardGrids();
        cardTilt();
        cursorBadge();
        magneticButtons();
        counters();
        processLine();
        marquee();
        mediaIn();
        filterTransitions();
        progressRule();
        smoothAnchors();
        packagesMotion();

        if (hasScrollTrigger) {
            /* Webfonts and Drive photographs both change box heights, so refresh
               once after load and again when the fonts settle. */
            window.addEventListener('load', function () { ScrollTrigger.refresh(); });
            if (doc.fonts && doc.fonts.ready) {
                doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
            }
            if (hasObserver) {
                Observer.create({ target: window, type: 'wheel,touch', onEnable: function () { ScrollTrigger.refresh(); } });
            }
        }
    }

    if (doc.readyState === 'loading') {
        on(doc, 'DOMContentLoaded', boot);
    } else {
        boot();
    }
}());
