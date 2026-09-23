<section class="cta-band">
    <div class="wrap cta-band__inner">
        <div>
            <h2 class="display display--sm">{{ $heading }}</h2>
            @if (isset($text))
                <p class="cta-band__text">{{ $text }}</p>
            @endif
        </div>
        <p class="cta-band__actions">
            <a class="btn" href="{{ url('/contact-us') }}"><span>contact us</span></a>
            <a class="btn btn--ghost" href="{{ url($contact['phone_us']['tel']) }}"><span>{{ $contact['phone_us']['label'] }}</span></a>
        </p>
    </div>
</section>
