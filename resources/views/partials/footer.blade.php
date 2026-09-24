<footer class="site-footer">
    <div class="site-footer__glow" aria-hidden="true"></div>

    <div class="wrap site-footer__grid">
        <div class="site-footer__brand">
            @php $brand = \App\Support\Site::brand('on-dark'); @endphp
            @if ($brand)
                <p class="site-footer__logo">
                    <picture>
                        @if ($brand['webp'])<source type="image/webp" srcset="{{ $brand['webp'] }}">@endif
                        <img src="{{ $brand['png'] }}" width="{{ $brand['w'] }}" height="{{ $brand['h'] }}" alt="{{ $brand['alt'] }}" loading="lazy" decoding="async">
                    </picture>
                </p>
            @else
                <p class="footer-logo">{{ config('site.logo_word') }} <span>{{ config('site.logo_sub') }}</span></p>
            @endif
            <p class="site-footer__strap">{{ config('site.tagline') }}</p>

            <address class="site-footer__address">
                @foreach (($contact['address_lines'] ?? []) as $line)
                    <span>{{ $line }}</span>
                @endforeach
                @if (!empty($contact['hours']))
                    <span>{{ $contact['hours'] }}</span>
                @endif
            </address>

            <p class="site-footer__contact">
                @if (!empty($contact['phone']['tel']))
                    <a href="{{ url($contact['phone']['tel']) }}">{{ $contact['phone']['label'] }}</a>
                @endif
                @if (!empty($contact['whatsapp']))
                    <a href="https://wa.me/{{ preg_replace('/\D/', '', $contact['whatsapp']) }}" rel="noopener" target="_blank">WhatsApp us</a>
                @endif
                @if (!empty($contact['email']))
                    <a href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a>
                @endif
            </p>

            <ul class="assurances">
                @foreach (($contact['assurances'] ?? []) as $assurance)
                    <li>{{ $assurance }}</li>
                @endforeach
            </ul>
        </div>

        <div class="site-footer__navs">
            @foreach (($footerNav ?? []) as $heading => $links)
                <nav class="footer-col" aria-label="{{ $heading }}">
                    <p class="eyebrow">{{ $heading }}</p>
                    <ul>
                        @foreach ($links as $link)
                            <li><a href="{{ url($link['url']) }}">{{ $link['label'] }}</a></li>
                        @endforeach
                    </ul>
                </nav>
            @endforeach
        </div>
    </div>

    <div class="wrap site-footer__base">
        <p class="site-footer__social">
            @php $rows = 0; @endphp
            @foreach (($contact['social'] ?? []) as $network)
                @if (!empty($network['url']))
                    @php $rows++; @endphp
                    <a href="{{ $network['url'] }}" rel="noopener me" target="_blank">{{ $network['label'] }}</a>
                @endif
            @endforeach
            @if (!$rows)
                <a href="{{ url('/contact') }}">Send us a message</a>
            @endif
        </p>
        <p class="site-footer__legal">
            <span>&copy; {{ date('Y') }} {{ config('site.name') }}</span>
            @if (!empty($site['legal_name']))
                <span>{{ $site['legal_name'] }}</span>
            @endif
            <a href="{{ url('/booking-terms') }}">Booking terms</a>
            <a href="{{ url('/cancellation-policy') }}">Cancellation</a>
            <a href="{{ url('/privacy-policy') }}">Privacy</a>
            <a href="{{ url('/sitemap.xml') }}">Sitemap</a>
        </p>
    </div>

    <p class="wrap site-footer__note">
        {{ count(\App\Support\Tours::all()) }} day trips, reef boats, desert evenings and private transfers, run out of
        Naama Bay by the guides and captains who lead them. Every photograph and film on this site was taken on our own
        trips — if you appear in one and would rather not, tell us and it comes down.
    </p>
</footer>
