<section class="cta-band{{ isset($bg) && $bg ? ' cta-band--photo' : '' }}">
    @if (isset($bg) && $bg)
        {{-- A frame from the same Drive folder, held far enough back that the
             buttons keep their contrast. Optional: pages that pass no $bg get
             the plain band they always had. --}}
        <figure class="photo-band__bg" aria-hidden="true">
            <img class="drive-img" src="{{ $bg }}" alt="" loading="lazy" decoding="async">
        </figure>
    @endif
    <div class="wrap cta-band__inner">
        <div>
            <h2 class="display display--sm">{{ $heading }}</h2>
            @if (isset($text))
                <p class="cta-band__text">{{ $text }}</p>
            @endif
        </div>
        <p class="cta-band__actions">
            <a class="btn" href="{{ url('/contact') }}"><span>send an enquiry</span></a>
            @if (!empty($contact['phone']['tel']))
                <a class="btn btn--ghost" href="{{ url($contact['phone']['tel']) }}"><span>{{ $contact['phone']['label'] }}</span></a>
            @elseif (!empty($contact['whatsapp']))
                <a class="btn btn--ghost" href="https://wa.me/{{ preg_replace('/\D/', '', $contact['whatsapp']) }}" rel="noopener" target="_blank"><span>whatsapp us</span></a>
            @else
                <a class="btn btn--ghost" href="{{ url('/tours') }}"><span>see all trips</span></a>
            @endif
        </p>
    </div>
</section>
