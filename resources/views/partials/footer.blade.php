<footer class="site-footer">
    <div class="site-footer__glow" aria-hidden="true"></div>

    <div class="wrap site-footer__grid">
        <div class="site-footer__brand">
            <p class="footer-logo">fitzroy <span>travel</span></p>
            <p class="site-footer__strap">{{ config('site.tagline') }}</p>

            <address class="site-footer__address">
                @foreach ($contact['address_lines'] as $line)
                    <span>{{ $line }}</span>
                @endforeach
            </address>

            <p class="site-footer__contact">
                <a href="{{ url($contact['phone_uk']['tel']) }}">{{ $contact['phone_uk']['label'] }}</a>
                <a href="{{ url($contact['phone_us']['tel']) }}">{{ $contact['phone_us']['label'] }}</a>
                <a href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a>
            </p>

            <a class="reviews" href="{{ $contact['reviews']['url'] }}" rel="noopener" target="_blank">
                <span class="reviews__stars" aria-hidden="true">★★★★★</span>
                <span class="reviews__label">{{ $contact['reviews']['label'] }}</span>
            </a>
        </div>

        <div class="site-footer__navs">
            @foreach ($footerNav as $heading => $links)
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
            @foreach ($contact['social'] as $network)
                <a href="{{ $network['url'] }}" rel="noopener" target="_blank">{{ $network['label'] }}</a>
            @endforeach
        </p>
        <p class="site-footer__legal">
            <span>&copy; {{ date('Y') }} {{ config('site.name') }} Ltd</span>
            <a href="{{ url('/financial-protection') }}">Financial protection</a>
            <a href="{{ url('/privacy-policy') }}">Privacy</a>
            <a href="{{ url('/terms-conditions') }}">Terms</a>
        </p>
    </div>

    <p class="wrap site-footer__note">
        Front-end study: layout and typography recreated for development use. Photography is hot-linked from
        fitzroy-travel.com and all copy, images and marks remain the property of their owners.
    </p>
</footer>
