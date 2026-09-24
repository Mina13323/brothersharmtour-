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
    var header = doc.getElementById('site-header');
    var toggle = doc.getElementById('menu-toggle');
    var panel  = doc.getElementById('primary-nav');
    var wide   = window.matchMedia('(min-width: 1080px)');

    function every(list, fn) { Array.prototype.forEach.call(list, fn); }

    /* The panel collapses each dropdown only once a script is here to open it
       again: body.js-menu is what the rules below hang on, so with JS switched
       off every list stays visible and nothing in the menu is unreachable. */
    body.classList.add('js-menu');

    function isOpen() { return body.classList.contains('menu-open'); }

    function setSub(item, open) {
        item.classList.toggle('sub-open', open);

        var button = item.querySelector('.nav__expander');
        if (button) {
            /* aria-expanded plus display:none in the stylesheet is all a submenu
               needs — an explicit hidden attribute would survive a resize onto a
               desktop and silence the hover dropdown. */
            button.setAttribute('aria-expanded', open ? 'true' : 'false');

            // Same word the label starts with, so the two can never drift apart.
            var label = button.getAttribute('data-label') || 'section';
            button.setAttribute('aria-label', (open ? 'Hide the ' : 'Show the ') + label.toLowerCase() + ' list');
        }
    }

    function closeMenu(refocus) {
        if (!isOpen()) { return; }

        body.classList.remove('menu-open');
        if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
        every(doc.querySelectorAll('.nav__item.sub-open'), function (item) { setSub(item, false); });

        if (refocus && toggle) { toggle.focus(); }
    }

    function openMenu() {
        if (isOpen()) { return; }

        body.classList.add('menu-open');
        if (toggle) { toggle.setAttribute('aria-expanded', 'true'); }

        /* Start the reader on the first link rather than at the top of the page.
           preventScroll keeps the viewport where it was: focusing a fixed panel
           must not shove the page behind it. */
        var first = panel && panel.querySelector('.nav__link');
        if (first && first.focus) {
            try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
        }
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            if (isOpen()) { closeMenu(true); } else { openMenu(); }
        });
    }

    doc.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') { closeMenu(true); }
    });

    /* Any link inside the panel closes it before the browser does anything else.
       Not only for tidiness: tel: and mailto: links often leave the page where
       it is, and a menu that stays open over a locked page is a dead end. */
    if (panel) {
        on(panel, 'click', 'a', function () { closeMenu(false); });

        on(panel, 'click', '.nav__expander', function (event, button) {
            var item = button.closest('.nav__item');
            if (!item) { return; }

            var open = !item.classList.contains('sub-open');

            /* One list at a time. Day trips has seven rows, Places six and the
               guides five, and a panel that lets all three open is longer than
               the screen it is on — which is the same problem as no accordion at
               all, only further down the page. */
            every(panel.querySelectorAll('.nav__item.sub-open'), function (other) {
                if (other !== item) { setSub(other, false); }
            });

            event.preventDefault();
            setSub(item, open);

            /* An opened list can start below the fold — Day trips has seven rows,
               and the panel is a scroll container, not a page — so the list, not
               the row, is what has to be in view afterwards. Instantly, and only
               as far as the nearest edge: a smooth scroll would move the trip out
               from under a finger that is already on its way to it, which is the
               exact gesture this panel exists to support. */
            var sub = open ? item.querySelector('.nav__sub') : null;
            if (sub && sub.scrollIntoView) {
                try {
                    sub.scrollIntoView({ block: 'nearest', behavior: 'auto' });
                } catch (e) {
                    sub.scrollIntoView();
                }
            }
        });

        // An action in the bar closes the panel too, so the two never compete.
        on(doc, 'click', '.site-header__actions a', function () { closeMenu(false); });

        // A full-screen menu should not let Tab walk out into the page behind it.
        panel.addEventListener('keydown', function (event) {
            if (event.key !== 'Tab' || !isOpen() || wide.matches) { return; }

            var items = panel.querySelectorAll('a[href], button:not([disabled])');
            if (!items.length) { return; }

            var first = items[0];
            var last = items[items.length - 1];

            if (event.shiftKey && doc.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && doc.activeElement === last) {
                event.preventDefault();
                (toggle || first).focus();
            }
        });
    }

    // Rotating a tablet, or dragging a window wider, must not leave the panel's
    // state — or its scroll lock — sitting on a desktop layout.
    function onWidthChange(event) { if (event.matches) { closeMenu(false); } }

    if (wide.addEventListener) { wide.addEventListener('change', onWidthChange); }
    else if (wide.addListener) { wide.addListener(onWidthChange); }

    window.addEventListener('resize', function () { if (wide.matches) { closeMenu(false); } });

    /* Everything above is inside the header; the header hides itself on the way
       down and comes back on the way up, and that is the only scroll behaviour it
       has. Nothing here rewrites the scrolled state. */
    if (header) {
        function onScroll() {
            body.classList.toggle('scrolled', (window.scrollY || doc.documentElement.scrollTop) > 40);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
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
