<header class="site-header" id="site-header">
    <div class="site-header__inner">
        <a class="logo" href="{{ url('/') }}" aria-label="{{ config('site.name') }} — home">
            <span class="logo__type">{{ config('site.logo_word') }}</span>
            <span class="logo__sub">{{ config('site.logo_sub') }}</span>
        </a>

        <nav class="nav" id="primary-nav" aria-label="Primary">
            <ul class="nav__list">
                @foreach (($nav ?? []) as $item)
                    <li class="nav__item{{ isset($item['children']) ? ' nav__item--has-children' : '' }}">
                        <a class="nav__link" href="{{ url($item['url']) }}">
                            {{ $item['label'] }}
                            @if (isset($item['children']))
                                <span class="nav__caret" aria-hidden="true">
                                    <svg viewBox="0 0 12 8" width="12" height="8"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                                </span>
                            @endif
                        </a>
                        @if (isset($item['children']))
                            <ul class="nav__sub">
                                @foreach ($item['children'] as $child)
                                    <li><a href="{{ url($child['url']) }}">{{ $child['label'] }}</a></li>
                                @endforeach
                            </ul>
                        @endif
                    </li>
                @endforeach
            </ul>
        </nav>

        <div class="site-header__actions">
            @if (!empty($contact['phone']['tel']))
                <a class="nav__phone" href="{{ url($contact['phone']['tel']) }}">{{ $contact['phone']['label'] }}</a>
            @endif
            @if (!empty($contact['whatsapp']))
                <a class="nav__whatsapp" href="https://wa.me/{{ preg_replace('/\D/', '', $contact['whatsapp']) }}" rel="noopener" target="_blank">WhatsApp</a>
            @endif
            <a class="btn btn--ghost btn--sm" href="{{ url('/contact') }}"><span>enquire</span></a>
            <button class="menu-toggle" id="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false">
                <span class="menu-toggle__bar"></span>
                <span class="menu-toggle__bar"></span>
                <span class="sr-only">Menu</span>
            </button>
        </div>
    </div>
</header>
