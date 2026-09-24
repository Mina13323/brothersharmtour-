@extends('layouts.app')

@php
    $hasShots = count($gallery) > 0;
    $hasClips = count($clips) > 0;
@endphp

@section('content')

    <section class="page-hero page-hero--tall tour-hero">
        <div class="page-hero__media" data-media>
            <img class="drive-img" src="{{ $heroImage }}" alt="{{ $heroAlt }}" fetchpriority="high" width="1800" height="1200">
            <span class="page-hero__scrim" aria-hidden="true"></span>
        </div>
        <div class="wrap page-hero__inner">
            @include('partials.breadcrumb', ['crumbClass' => 'crumbs--onhero'])

            <p class="eyebrow reveal-up" data-reveal>{{ $categoryLabel }}</p>
            <h1 class="display reveal-up" data-reveal>{{ $tour['title'] }}</h1>
            <p class="page-hero__lede reveal-up" data-reveal>{{ $tour['strap'] }}</p>
            <ul class="tour-hero__badges reveal-up" data-reveal>
                <li>{{ $tour['duration'] }}</li>
                <li>{{ \App\Support\Tours::price($tour) }}</li>
                <li>hotel pick-up included</li>
                @if ($hasClips)
                    <li class="tour-hero__badge--film">
                        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                        {{ count($clips) }} film{{ count($clips) > 1 ? 's' : '' }}
                    </li>
                @endif
            </ul>
        </div>
    </section>

    <section class="trip-meta">
        <div class="wrap trip-meta__inner">
            <dl>
                <dt>length</dt>
                <dd>{{ $tour['duration'] }}</dd>
                <dt>price</dt>
                <dd>{{ \App\Support\Tours::price($tour) }}{{ $tour['price'] ? ' per person' : '' }}</dd>
                <dt>pick-up</dt>
                <dd>{{ $tour['meeting'] }}</dd>
                @if (isset($tour['season']))
                    <dt>when</dt>
                    <dd>{{ $tour['season'] }}</dd>
                @endif
            </dl>
            <p class="trip-meta__cta">
                <a class="btn" href="{{ url('/contact?tour=' . $tour['slug']) }}"><span>enquire about this trip</span></a>
                @if (!empty($contact['phone']['tel']))
                    <a class="btn btn--ghost" href="{{ url($contact['phone']['tel']) }}"><span>{{ $contact['phone']['label'] }}</span></a>
                @endif
            </p>
        </div>
    </section>

    @if ($hasShots)
        <section class="gallery" data-gallery>
            <div class="gallery__strip" data-gallery-strip>
                @foreach ($gallery as $index => $shot)
                    <figure class="gallery__frame">
                        <img class="drive-img" src="{{ $shot['src'] }}"
                             alt="{{ $shot['alt'] }}"
                             width="1350" height="900"
                             loading="{{ $index < 3 ? 'eager' : 'lazy' }}">
                    </figure>
                @endforeach
            </div>
            <div class="wrap gallery__bar">
                <p class="gallery__count"><span data-gallery-index>01</span> <i>/</i> {{ str_pad((string) count($gallery), 2, '0', STR_PAD_LEFT) }}</p>
                <p class="gallery__hint">drag, scroll or use the arrow keys — {{ count($gallery) }} frames from the trip</p>
            </div>
        </section>
    @endif

    <article class="tour-body">
        <div class="wrap tour-body__grid">
            <div class="tour-body__text">
                <p class="lead reveal-up" data-reveal>{{ $tour['lede'] }}</p>

                @foreach ($tour['body'] as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach

                @if (!$hasShots)
                    <p class="prose prose--quiet reveal-up" data-reveal>
                        This one is a transfer rather than a trip, so there is nothing to photograph — the car, the driver and
                        the time you give us are the whole product.
                    </p>
                @endif

                <h2 class="h2">what happens</h2>
                <ul class="ticklist">
                    @foreach ($tour['highlights'] as $point)
                        <li>{{ $point }}</li>
                    @endforeach
                </ul>

                @if ($hasClips)
                    <h2 class="h2">watch it</h2>
                    <p class="prose">Filmed on the trip itself, nothing added but a caption.</p>
                    <div class="films__grid films__grid--inline">
                        @php $clipNo = 0; @endphp
                        @foreach ($clips as $clip)
                            @php $clipNo++; @endphp
                            <figure class="film">
                                <div class="film__frame">
                                    <iframe src="{{ $clip['embed'] }}" title="{{ $tour['title'] }} film" loading="lazy"
                                            allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>
                                </div>
                                <figcaption class="film__cap">
                                    <span>{{ $clip['name'] ?: 'Clip ' . $clipNo }}</span>
                                    <a class="link-quiet" href="{{ url('/contact?tour=' . $tour['slug']) }}">ask about this trip</a>
                                </figcaption>
                            </figure>
                        @endforeach
                    </div>
                @endif

                <h2 class="h2">what you get</h2>
                <div class="incl">
                    <div class="incl__col">
                        <p class="eyebrow">included</p>
                        <ul class="ticklist ticklist--yes">
                            @foreach ($tour['included'] as $line)
                                <li>{{ $line }}</li>
                            @endforeach
                        </ul>
                    </div>
                    <div class="incl__col">
                        <p class="eyebrow">not included</p>
                        <ul class="ticklist ticklist--no">
                            @foreach ($tour['excluded'] as $line)
                                <li>{{ $line }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>

                <h2 class="h2">planning it</h2>
                <ul class="ticklist">
                    <li>{{ $tour['meeting'] }}</li>
                    <li>{{ $tour['level'] }}</li>
                    @if (isset($tour['season']))
                        <li>Runs {{ strtolower($tour['season']) }}</li>
                    @endif
                    <li>Cancelling is free until 24 hours before pick-up</li>
                </ul>
            </div>

            <aside class="tour-body__side">
                <div class="side-card">
                    <p class="eyebrow">good to know</p>
                    <p class="side-card__line"><span>Effort</span>{{ $tour['level'] }}</p>
                    <p class="side-card__line"><span>Start</span>{{ $tour['meeting'] }}</p>
                    @if (isset($tour['season']))
                        <p class="side-card__line"><span>Season</span>{{ $tour['season'] }}</p>
                    @endif
                    <p class="side-card__price">{{ \App\Support\Tours::price($tour) }}</p>
                    <p><a class="btn btn--solid" href="{{ url('/contact?tour=' . $tour['slug']) }}"><span>ask about this trip</span></a></p>
                    <button class="link-quiet" type="button" data-share="{{ $tour['title'] }}">Share this trip</button>
                </div>
            </aside>
        </div>
    </article>

    @if (count($related))
        <section class="itn itn--page">
            <div class="wrap">
                <header class="section-head">
                    <p class="eyebrow">goes well with</p>
                    <h2 class="display display--sm">also worth a day</h2>
                </header>
            </div>
            <div class="itn__grid">
                @foreach ($related as $item)
                    @include('partials.tour-card', ['item' => $item])
                @endforeach
            </div>
        </section>
    @endif

    @include('partials.cta-band', [
        'heading' => 'book ' . strtolower($tour['title']) . ' with us',
        'text'    => 'Tell us the date, how many of you there are, and what you would change about the standard day. We will confirm the price and the pick-up time the same day.',
    ])

@endsection
