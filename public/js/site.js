/* ==========================================================================
   Brothers Sharm Tour — behaviour layer
   No dependencies: preloader, header state, menu, sliders, reveals,
   season chart, share, dial-code picker and the enquiry form.
   ========================================================================== */

(function () {
    'use strict';

    var doc = document;
    var body = doc.body;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function on(el, type, selector, fn) {
        el.addEventListener(type, function (event) {
            var target = event.target.closest(selector);
            if (target && el.contains(target)) {
                fn(event, target);
            }
        });
    }

    /* ---------------------------------------------------------------- preloader */
    window.addEventListener('load', function () {
        body.classList.add('loaded');
    });

    // Safety net: never leave the curtain up if a slow asset hangs.
    setTimeout(function () { body.classList.add('loaded'); }, 3500);

    /* ---------------------------------------------------------------- header */
    var lastY = 0;

    function onScroll() {
        var y = window.scrollY || doc.documentElement.scrollTop;
        body.classList.toggle('scrolled', y > 40);
        lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = doc.getElementById('menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var open = body.classList.toggle('menu-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        on(doc.getElementById('primary-nav') || doc, 'click', '.nav__sub a', function () {
            body.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    // Mobile: tap the parent label to reveal its submenu instead of navigating.
    if (window.matchMedia('(max-width: 1079px)').matches) {
        on(doc, 'click', '.nav__item--has-children > .nav__link', function (event, link) {
            if (!body.classList.contains('menu-open')) { return; }
            var item = link.parentElement;
            var isOpen = item.classList.contains('sub-open');

            doc.querySelectorAll('.nav__item--has-children').forEach(function (el) {
                el.classList.remove('sub-open');
                var sub = el.querySelector('.nav__sub');
                if (sub) { sub.style.display = ''; }
            });

            if (!isOpen) {
                item.classList.add('sub-open');
                var sub = item.querySelector('.nav__sub');
                if (sub) { sub.style.display = 'block'; }
            }

            event.preventDefault();
        });
    }

    /* ---------------------------------------------------------------- reveals */
    /* When GSAP is present, public/js/animations.js owns entrance motion for
       these same elements (it adds .is-in itself once each tween lands), and it
       can do so with masks, staggers and scrubbed parallax. This block is the
       no-GSAP path, so it must not double-animate what that file already set. */
    if (!window.gsap && 'IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                entry.target.classList.add('is-in');
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

        doc.querySelectorAll('[data-reveal]').forEach(function (el) {
            revealObserver.observe(el);
        });

        var chart = doc.querySelector('[data-months]');
        if (chart) {
            var chartObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            chartObserver.observe(chart);
        }
    } else {
        doc.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------------------------------------------------------------- sliders */
    doc.querySelectorAll('[data-slider]').forEach(function (root) {
        var track = root.querySelector('[data-slider-track]');
        var index = root.querySelector('[data-slider-index]');
        if (!track) { return; }

        var slides = Array.prototype.slice.call(track.children);
        var current = 0;

        function pad(n) { return (n < 10 ? '0' : '') + n; }

        function scrollTo(i) {
            current = Math.max(0, Math.min(i, slides.length - 1));
            var slide = slides[current];
            var offset = slide.offsetLeft - track.offsetLeft - readPad(track);

            track.scrollTo({ left: offset, behavior: reduce ? 'auto' : 'smooth' });
            if (index) { index.textContent = pad(current + 1); }
        }

        function readPad(el) {
            return parseFloat(window.getComputedStyle(el).paddingLeft) || 0;
        }

        on(root, 'click', '[data-slider-next]', function () { scrollTo(current + 1); });
        on(root, 'click', '[data-slider-prev]', function () { scrollTo(current - 1); });

        // Keep the counter synced while the visitor drags or scrolls.
        var ticking = false;
        track.addEventListener('scroll', function () {
            if (ticking) { return; }
            ticking = true;
            window.requestAnimationFrame(function () {
                ticking = false;
                var nearest = 0;
                var best = Infinity;
                slides.forEach(function (slide, i) {
                    var d = Math.abs(slide.offsetLeft - track.scrollLeft - readPad(track));
                    if (d < best) { best = d; nearest = i; }
                });
                current = nearest;
                if (index) { index.textContent = pad(nearest + 1); }
            });
        }, { passive: true });

        // Drag to pan.
        var down = false;
        var startX = 0;
        var startScroll = 0;

        track.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'touch') { return; }
            down = true;
            startX = event.clientX;
            startScroll = track.scrollLeft;
            track.classList.add('is-dragging');
            track.setPointerCapture(event.pointerId);
        });

        track.addEventListener('pointermove', function (event) {
            if (!down) { return; }
            track.scrollLeft = startScroll - (event.clientX - startX);
        });

        ['pointerup', 'pointercancel'].forEach(function (type) {
            track.addEventListener(type, function () {
                down = false;
                track.classList.remove('is-dragging');
            });
        });

        // Keyboard: focus a slide link and use the arrows on the controls.
        root.setAttribute('tabindex', '-1');
        root.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowRight') { scrollTo(current + 1); }
            if (event.key === 'ArrowLeft') { scrollTo(current - 1); }
        });

        // Clicking a card should not fight the drag gesture.
        var moved = 0;
        track.addEventListener('pointerdown', function (event) { moved = event.clientX; });
        on(track, 'click', 'a', function (event, link) {
            if (Math.abs(link.getBoundingClientRect().left - track.getBoundingClientRect().left) > 4) {
                // still allow navigation — but scroll the picked slide into view first
                var slide = link.closest('[data-slide]');
                if (slide) {
                    scrollTo(slides.indexOf(slide));
                }
            }
        });
    });

    /* ---------------------------------------------------------------- galleries */
    doc.querySelectorAll('[data-gallery]').forEach(function (root) {
        var strip = root.querySelector('[data-gallery-strip]');
        var out = root.querySelector('[data-gallery-index]');
        if (!strip || !out) { return; }

        var frames = Array.prototype.slice.call(strip.querySelectorAll('.spot__frame, .gallery__frame'));

        strip.addEventListener('scroll', function () {
            var center = strip.scrollLeft + strip.clientWidth / 2;
            var nearest = 0;
            var best = Infinity;

            frames.forEach(function (frame, i) {
                var mid = frame.offsetLeft + frame.offsetWidth / 2 - strip.offsetLeft;
                var d = Math.abs(mid - center);
                if (d < best) { best = d; nearest = i; }
            });

            var n = nearest + 1;
            out.textContent = (n < 10 ? '0' : '') + n;
        }, { passive: true });

        // Lazy swap for off-screen frames keeps the first paint cheap.
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var img = entry.target.querySelector('img[data-src], img');
                    var defer = entry.target.getAttribute('data-defer-src');
                    if (defer && img) {
                        img.src = defer;
                        entry.target.removeAttribute('data-defer-src');
                        io.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '200px' });

            frames.forEach(function (frame) { io.observe(frame); });
        }
    });

    /* ---------------------------------------------------------------- share */
    on(doc, 'click', '[data-share]', function (event, button) {
        event.preventDefault();
        var label = button.getAttribute('data-share') || doc.title;
        var url = window.location.href;

        if (navigator.share) {
            navigator.share({ title: label, url: url }).catch(function () { /* dismissed */ });
            return;
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
                var original = button.innerHTML;
                button.innerHTML = 'link copied';
                setTimeout(function () { button.innerHTML = original; }, 2000);
            });
        }
    });

    /* ---------------------------------------------------------------- drive media */
    /* Photography is hot-linked from Google Drive. If the folder is not shared
       as "anyone with the link", every image fails — hide it so the typographic
       placeholder shows, and surface one clear notice instead of 120 broken
       thumbnails. */
    var driveFailures = 0;

    window.addEventListener('error', function (event) {
        var el = event.target;

        if (!el || el.tagName !== 'IMG' || !el.classList.contains('drive-img')) {
            return;
        }

        driveFailures++;
        el.style.display = 'none';

        var wrap = el.closest ? el.closest('[data-media]') : null;
        if (wrap) { wrap.classList.add('is-missing'); }

        if (driveFailures === 3) { body.classList.add('drive-off'); }
    }, true);

    /* ---------------------------------------------------------------- dial codes */
    doc.querySelectorAll('[data-dial]').forEach(function (root) {
        var button = root.querySelector('.dial__button');
        var panel = root.querySelector('.dial__panel');
        var search = root.querySelector('[data-dial-search]');
        var list = root.querySelector('[data-dial-options]');
        var empty = root.querySelector('.dial__empty');
        var input = root.querySelector('[data-dial-input]');
        var codeOut = root.querySelector('[data-dial-code]');

        if (!button || !panel) { return; }

        function setOpen(open) {
            panel.hidden = !open;
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open && search) { search.focus(); }
        }

        button.addEventListener('click', function () { setOpen(panel.hidden); });

        doc.addEventListener('click', function (event) {
            if (!root.contains(event.target)) { setOpen(false); }
        });

        doc.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { setOpen(false); }
        });

        if (search) {
            search.addEventListener('input', function () {
                var q = search.value.trim().toLowerCase();
                var visible = 0;

                list.querySelectorAll('li').forEach(function (li) {
                    var match = li.textContent.toLowerCase().indexOf(q) !== -1;
                    li.hidden = !match;
                    if (match) { visible++; }
                });

                if (empty) { empty.hidden = visible !== 0; }
            });
        }

        on(root, 'click', '[data-code]', function (event, option) {
            var code = option.getAttribute('data-code');
            if (input) { input.value = code; }
            if (codeOut) { codeOut.textContent = code; }
            setOpen(false);
        });
    });

    /* ---------------------------------------------------------------- enquiry form */
    var form = doc.querySelector('[data-enquiry-form]');

    if (form) {
        var status = doc.querySelector('[data-form-status]');
        var endpoint = window.__formEndpoint || form.getAttribute('action');

        function setError(field, message) {
            var wrap = field.closest('.field');
            if (!wrap) { return; }
            wrap.classList.toggle('has-error', !!message);
            var out = wrap.querySelector('.field__error');
            if (out && message) { out.textContent = message; }
        }

        form.addEventListener('submit', function (event) {
            var bad = false;

            ['name', 'email', 'message'].forEach(function (key) {
                var field = form.elements[key];
                if (!field) { return; }

                var value = String(field.value || '').trim();
                var message = '';

                if (!value) {
                    message = field.getAttribute('data-error') || 'This field is required.';
                } else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    message = 'That email address does not look right.';
                } else if (key === 'message' && value.length < 12) {
                    message = 'A sentence or two about the trip, please.';
                }

                setError(field, message);
                if (message && !bad) {
                    bad = true;
                    field.focus();
                }
            });

            if (bad) {
                event.preventDefault();
                return;
            }

            // Progressive enhancement: post in the background when fetch exists.
            if (!window.fetch) { return; }

            event.preventDefault();

            var submit = form.querySelector('[type="submit"]');
            if (submit) { submit.disabled = true; }

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(new FormData(form)).toString()
            })
                .then(function (response) {
                    return response.json().catch(function () { return {}; });
                })
                .then(function (data) {
                    if (status) {
                        status.textContent = data.ok === false
                            ? 'Something went wrong — please email or call us directly.'
                            : 'Thank you — your enquiry is with the team. We will be in touch shortly.';
                    }

                    if (data.ok !== false) {
                        form.reset();
                    }
                })
                .catch(function () {
                    if (status) {
                        status.textContent = 'Could not send just now. Please email us directly — the address is above.';
                    }
                })
                .finally(function () {
                    if (submit) { submit.disabled = false; }
                });
        });

        form.querySelectorAll('input, textarea, select').forEach(function (field) {
            field.addEventListener('input', function () { setError(field, ''); });
        });
    }

    /* ---------------------------------------------------------------- anchors */
    on(doc, 'click', 'a[href^="#"]', function (event, link) {
        var id = link.getAttribute('href').slice(1);
        var target = id && doc.getElementById(id);

        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
    });
})();
