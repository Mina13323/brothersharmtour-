{{--
    The header, in two parts that share one <nav>:

      · the bar   — logo, the desktop list, and the actions that always fit
      · the panel — the same list, restyled full-screen under 1080px by
        body.menu-open, plus the contact block the bar has no room for

    One <nav> rather than two copies, so there is a single set of links to keep
    in sync, one place for screen-reader users to find, and no chance of the
    panel drifting away from the bar. Every panel rule sits inside
    @media (max-width: 1079px), which is what makes that true: body.menu-open on
    a wide screen simply has nothing to say. The panel's extras are display:none
    on a desktop, and the bar's extras are display:none on a phone — the same
    links either way, just arranged for the width that has them.

    Dropdowns: the parent stays a link (Day trips goes to /tours) and a separate
    button opens the list, so nothing on a touchscreen has to choose between
    visiting a page and seeing what is under it.

    If site.js never runs — a script blocker, a fatal at the top of the file —
    body.js-menu is never added, so the lists stay open and, because
    body:not(.js-menu) restyles the header as a static block, the whole menu is
    printed under the logo instead of hiding behind a burger that does nothing.
--}}
@php
    $mark  = \App\Support\Site::brand('mark');
    $phone = $contact['phone'] ?? [];
    $wasap = ! empty($contact['whatsapp']) ? preg_replace('/\D/', '', $contact['whatsapp']) : '';
@endphp
<header class="site-header" id="site-header">
    <div class="site-header__inner">
        <a class="logo{{ $mark ? ' logo--mark' : '' }}" href="{{ url('/') }}" aria-label="{{ config('site.name') }} — home">
            @if ($mark)
                <picture class="logo__mark">
                    @if ($mark['webp'])<source type="image/webp" srcset="{{ $mark['webp'] }}">@endif
                    <img src="{{ $mark['png'] }}" width="{{ $mark['w'] }}" height="{{ $mark['h'] }}" alt="" loading="eager" fetchpriority="high" decoding="async">
                </picture>
            @endif
            <span class="logo__type">{{ config('site.logo_word') }}</span>
            <span class="logo__sub">{{ config('site.logo_sub') }}</span>
        </a>

        <nav class="nav" id="primary-nav" aria-label="Primary">
            <ul class="nav__list">
                @foreach (($nav ?? []) as $item)
                    @php
                        $subId    = 'nav-' . \App\Support\Nav::slug($item['url']);
                        $own      = \App\Support\Nav::path($item['url']);
                        $children = isset($item['children']) ? $item['children'] : [];
                        $active   = \App\Support\Nav::isCurrent($own, $currentPath ?? '/');
                        $sub      = \App\Support\Nav::hasCurrent($children, $currentPath ?? '/', $currentQuery ?? '');
                    @endphp
                    <li class="nav__item{{ count($children) ? ' nav__item--has-children' : '' }}{{ $active || $sub ? ' is-current' : '' }}">
                        <a class="nav__link" href="{{ url($item['url']) }}"{!! $active ? ' aria-current="page"' : '' !!}>
                            <span>{{ $item['label'] }}</span>
                            @if (count($children))
                                <span class="nav__caret" aria-hidden="true">
                                    <svg viewBox="0 0 12 8" width="12" height="8"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                                </span>
                            @endif
                        </a>

                        @if (count($children))
                            <button class="nav__expander" type="button" aria-expanded="false"
                                    aria-controls="{{ $subId }}"
                                    data-label="{{ $item['label'] }}"
                                    aria-label="Show the {{ strtolower($item['label']) }} list"></button>

                            <ul class="nav__sub" id="{{ $subId }}">
                                @foreach ($children as $child)
                                    <li><a href="{{ url($child['url']) }}"{!! \App\Support\Nav::isExact($child['url'], $currentPath ?? '/', $currentQuery ?? '') ? ' aria-current="page"' : '' !!}>{{ $child['label'] }}</a></li>
                                @endforeach
                            </ul>
                        @endif
                    </li>
                @endforeach
            </ul>

            {{-- The bar has no room for these on a phone, so they live at the
                 foot of the panel instead — same links, different width. --}}
            <div class="nav__foot" id="nav-contact">
                <p class="nav__foot-cta">
                    <a class="btn" href="{{ url('/contact') }}"><span>send an enquiry</span></a>
                </p>

                @php
                    /* Everything here is a way to reach a person, in the order a
                       traveller on a phone uses them. The rows are built in one
                       place and printed in another because the config is made of
                       env() defaults that are often empty, and an empty <ul> under
                       a rule is a divider with nothing above it. */
                    $foot = array_values(array_filter([
                        empty($phone['tel']) ? null : [
                            'label' => 'Call',
                            'text'  => $phone['label'] ?: $phone['tel'],
                            // tel: is a scheme, not a path — url() here used to
                            // write href="/+20…", a 404 in a pocket.
                            'href'  => 'tel:' . preg_replace('/[^0-9+]/', '', $phone['tel']),
                        ],
                        $wasap ? [
                            'label' => 'WhatsApp',
                            'text'  => '+' . $wasap,
                            'href'  => 'https://wa.me/' . $wasap,
                        ] : null,
                        empty($contact['email']) ? null : [
                            'label' => 'Email',
                            'text'  => $contact['email'],
                            'href'  => 'mailto:' . $contact['email'],
                        ],
                        empty($contact['hours']) ? null : [
                            'label' => 'Hours',
                            'text'  => $contact['hours'],
                            'href'  => '',
                        ],
                    ]));

                    $nets = [];

                    foreach ($contact['social'] ?? [] as $network) {
                        if (empty($network['url'])) {
                            continue;
                        }

                        // A config cell that says "facebook.com/x" is a host, not
                        // a relative link: without the scheme it would point at a
                        // page on this site.
                        $nets[] = [
                            'label' => $network['label'],
                            'href'  => preg_match('#^(https?:)?//#', $network['url'])
                                ? (strpos($network['url'], '//') === 0 ? 'https:' . $network['url'] : $network['url'])
                                : 'https://' . ltrim($network['url'], '/'),
                        ];
                    }
                @endphp

                @if (count($foot))
                    <ul class="nav__contact">
                        @foreach ($foot as $row)
                            <li>
                                <span>{{ $row['label'] }}</span>
                                @if ($row['href'])
                                    {{-- Only a web link needs a new tab and a
                                         noreferrer; a phone number is neither. --}}
                                    <a href="{{ $row['href'] }}"@if (preg_match('#^https?://#', $row['href'])) rel="noopener nofollow" target="_blank"@endif>{{ $row['text'] }}</a>
                                @else
                                    {{ $row['text'] }}
                                @endif
                            </li>
                        @endforeach
                    </ul>
                @endif

                @if (count($nets))
                    <ul class="nav__social">
                        @foreach ($nets as $net)
                            <li><a href="{{ $net['href'] }}" rel="noopener me" target="_blank">{{ $net['label'] }}</a></li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </nav>

        <div class="site-header__actions">
            @if (! empty($phone['tel']))
                <a class="nav__phone" href="tel:{{ preg_replace('/[^0-9+]/', '', $phone['tel']) }}">{{ $phone['label'] }}</a>
            @endif
            @if ($wasap)
                <a class="nav__whatsapp" href="https://wa.me/{{ $wasap }}" rel="noopener" target="_blank">WhatsApp</a>
            @endif
            <a class="btn btn--ghost btn--sm site-header__enquire" href="{{ url('/contact') }}"><span>enquire</span></a>
            <button class="menu-toggle" id="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Menu">
                <span class="menu-toggle__bar"></span>
                <span class="menu-toggle__bar"></span>
                <span class="sr-only">Menu</span>
            </button>
        </div>
    </div>
</header>
