<section class="approach reveal" data-reveal>
    <div class="approach__media" aria-hidden="true">
        <img src="{{ img($approach['image']) }}" alt="" loading="lazy" width="1200" height="1500">
    </div>
    <div class="approach__body">
        <p class="eyebrow">{{ $approach['eyebrow'] }}</p>
        <h2 class="display display--sm">{{ $approach['title'] }}</h2>
        @foreach ($approach['body'] as $paragraph)
            <p>{{ $paragraph }}</p>
        @endforeach
        <p class="approach__cta">
            <a class="btn" href="{{ url('/contact-us') }}"><span>get in touch</span></a>
            <a class="link-phone" href="{{ url($contact['phone_us']['tel']) }}">{{ $contact['phone_us']['label'] }}</a>
        </p>
    </div>
</section>
