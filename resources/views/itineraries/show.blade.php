@extends('layouts.app')

@php $meta = [['type', $itinerary['style']], ['from', $itinerary['price']], ['guests', $itinerary['guests']], ['nights', $itinerary['nights']]]; @endphp

@section('content')

    <section class="page-hero page-hero--tall">
        <div class="page-hero__media">
            <img src="{{ img($itinerary['gallery'][0]) }}" alt="{{ $itinerary['lodge'] }}" fetchpriority="high" width="1800" height="1200">
            <span class="page-hero__scrim" aria-hidden="true"></span>
        </div>
        <div class="wrap page-hero__inner">
            <p class="eyebrow reveal-up" data-reveal>{{ strtolower($itinerary['country']) }}</p>
            <h1 class="display reveal-up" data-reveal>{{ $itinerary['title'] }}</h1>
            <p class="page-hero__lede reveal-up" data-reveal>{{ $itinerary['summary'] }}</p>
            <p class="credit credit--light">{{ $itinerary['lodge'] }}</p>
        </div>
    </section>

    <section class="trip-meta">
        <div class="wrap trip-meta__inner">
            <dl>
                <dt>style</dt>
                <dd>{{ $itinerary['style'] }}</dd>
                <dt>from</dt>
                <dd>{{ $itinerary['price'] }} per person</dd>
                <dt>based on</dt>
                <dd>{{ $itinerary['guests'] }} sharing</dd>
                <dt>length</dt>
                <dd>{{ $itinerary['nights'] }} nights</dd>
            </dl>
            <p class="trip-meta__cta">
                <a class="btn" href="{{ url('/contact-us') }}"><span>plan this safari</span></a>
                <a class="btn btn--ghost" href="{{ url($contact['phone_us']['tel']) }}"><span>{{ $contact['phone_us']['label'] }}</span></a>
            </p>
        </div>
    </section>

    <section class="gallery" data-gallery>
        <div class="gallery__strip" data-gallery-strip>
            @foreach ($itinerary['gallery'] as $index => $shot)
                <figure class="gallery__frame">
                    <img src="{{ img($shot) }}" alt="{{ $itinerary['lodge'] }}" loading="{{ $index < 3 ? 'eager' : 'lazy' }}" width="1350" height="844">
                </figure>
            @endforeach
        </div>
        <div class="wrap gallery__bar">
            <p class="gallery__count"><span data-gallery-index>01</span> <i>/</i> {{ str_pad((string) count($itinerary['gallery']), 2, '0', STR_PAD_LEFT) }}</p>
            <p class="gallery__hint">drag, scroll or use the arrow keys</p>
        </div>
    </section>

    <article class="itinerary-days">
        <div class="wrap itinerary-days__grid">
            <div class="itinerary-days__intro">
                <p class="eyebrow">how it unfolds</p>
                <h2 class="display display--sm">{{ $itinerary['nights'] }} nights across {{ $itinerary['country'] }}</h2>
                <p class="prose">
                    A shape rather than a schedule: where you sleep, how you get between them, and what a
                    typical day looks like once you are there. Swap any leg for longer, or drop it entirely.
                </p>
            </div>

            <ol class="days">
                @foreach ($itinerary['days'] as $day)
                    <li class="day reveal" data-reveal>
                        <p class="day__tag">{{ $day['day'] }}</p>
                        <h3>{{ $day['title'] }}</h3>
                        <p>{{ $day['body'] }}</p>
                    </li>
                @endforeach
            </ol>
        </div>
    </article>

    @if ($destination)
        <section class="paired">
            <div class="wrap paired__grid">
                <figure class="paired__media">
                    <img src="{{ img($destination['thumb']) }}" alt="{{ $destination['name'] }}" loading="lazy" width="800" height="620">
                </figure>
                <div class="paired__text">
                    <p class="eyebrow">the destination</p>
                    <h2 class="display display--sm">{{ $destination['name'] }}</h2>
                    <p class="prose">{{ $destination['intro'] }}</p>
                    <p><a class="btn btn--ghost" href="{{ url('/' . $destination['slug']) }}"><span>explore {{ $destination['name'] }}</span></a></p>
                </div>
            </div>
        </section>
    @endif

    <section class="itn itn--related">
        <div class="wrap"><p class="eyebrow">other journeys</p></div>
        <div class="itn__grid itn__grid--three">
            @foreach (array_slice($related, 0, 3) as $index => $item)
                @include('partials.itinerary-card', [
                    'item'  => $item,
                    'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'total' => '06',
                ])
            @endforeach
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'start from this itinerary',
        'text'    => 'Send it over with your notes — dates, who is travelling, what you would rather skip — and we will price the version that fits.',
    ])

@endsection
