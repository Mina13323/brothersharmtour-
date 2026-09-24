<section class="approach reveal" data-reveal>
    <div class="approach__media" data-media>
        <img class="drive-img" src="{{ img($approach['image']) }}" alt="{{ $approach['alt'] ?? '' }}" loading="lazy" width="1200" height="1500">
    </div>
    <div class="approach__body">
        <p class="eyebrow">{{ $approach['eyebrow'] }}</p>
        <h2 class="display display--sm">{{ $approach['title'] }}</h2>
        @foreach ($approach['body'] as $paragraph)
            <p>{{ $paragraph }}</p>
        @endforeach
        <p class="approach__cta">
            <a class="btn" href="{{ url('/contact') }}"><span>get in touch</span></a>
            @if (!empty($contact['phone']['tel']))
                <a class="link-phone" href="{{ url($contact['phone']['tel']) }}">{{ $contact['phone']['label'] }}</a>
            @elseif (!empty($contact['whatsapp']))
                <a class="link-phone" href="https://wa.me/{{ preg_replace('/\D/', '', $contact['whatsapp']) }}" rel="noopener" target="_blank">Message us on WhatsApp</a>
            @endif
        </p>
    </div>
</section>
