@extends('layouts.app')

@section('content')

    <!-- 1 · Hero -->
    <section class="hero" id="hero">
        <div class="hero__media">
            <img src="{{ img($hero['image']) }}" alt="Guests around a campfire on an open sandbank under a sky full of stars" fetchpriority="high" width="1800" height="1200">
            <span class="hero__grain" aria-hidden="true"></span>
        </div>

        <div class="wrap hero__inner">
            <p class="eyebrow reveal-up" data-reveal>{{ $hero['eyebrow'] }}</p>
            <h1 class="display hero__title reveal-up" data-reveal>{{ $hero['title'] }}</h1>
            <p class="hero__lede reveal-up" data-reveal>{{ $hero['lede'] }}</p>
        </div>

        <div class="hero__foot">
            <p class="scroll-cue">
                <span>{{ $hero['scroll'] }}</span>
                <i aria-hidden="true"></i>
            </p>
            <p class="credit">{{ $hero['credit'] }}</p>
        </div>
    </section>

    <!-- 2 · Why choose / split -->
    <section class="split">
        <div class="wrap split__grid">
            <div class="split__text">
                <p class="eyebrow reveal-up" data-reveal>{{ $intro['eyebrow'] }}</p>
                <h2 class="display display--sm reveal-up" data-reveal>{{ $intro['title'] }}</h2>
                @foreach ($intro['body'] as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                <p class="split__cta reveal-up" data-reveal>
                    <a class="btn" href="{{ url('/contact-us') }}"><span>contact us</span></a>
                </p>
            </div>

            <div class="split__cards">
                @foreach ($intro['cards'] as $card)
                    <figure class="tile reveal" data-reveal>
                        <span class="tile__media">
                            <img src="{{ img($card['image']) }}" alt="{{ $card['alt'] }}" loading="lazy" width="900" height="1200">
                        </span>
                        <figcaption class="tile__label">
                            <span class="tile__kicker">{{ $card['kicker'] }}</span>
                            <span class="tile__name">{{ $card['label'] }}</span>
                        </figcaption>
                    </figure>
                @endforeach
            </div>
        </div>
    </section>

    <!-- 3 · Where we operate -->
    <section class="where" id="where-we-operate">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow reveal-up" data-reveal>where we operate</p>
                @foreach ($operating as $paragraph)
                    <p class="section-head__lede reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
            </header>
        </div>

        <div class="where__slider" data-slider="destinations">
            <div class="where__track" data-slider-track>
                @foreach ($destinations as $destination)
                    <article class="where__slide" data-slide>
                        <a class="where__card" href="{{ url('/' . $destination['slug']) }}">
                            <span class="where__media">
                                <img src="{{ img($destination['thumb']) }}" alt="{{ $destination['name'] }}" loading="lazy" width="1000" height="1250">
                            </span>
                            <span class="where__map" aria-hidden="true">
                                <img src="{{ img($destination['map']) }}" alt="">
                            </span>
                            <span class="where__num">{{ $destination['number'] }}</span>
                            <span class="where__body">
                                <span class="where__name">{{ $destination['name'] }}</span>
                                <span class="where__strap">{{ $destination['strap'] }}</span>
                                <span class="where__more">Explore {{ $destination['name'] }}</span>
                            </span>
                        </a>
                    </article>
                @endforeach
            </div>

            <div class="wrap where__controls">
                <p class="where__count"><span data-slider-index>01</span> <i>/</i> {{ str_pad((string) count($destinations), 2, '0', STR_PAD_LEFT) }}</p>
                <p class="where__arrows">
                    <button class="arrow" type="button" data-slider-prev aria-label="Previous destination">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                    <button class="arrow" type="button" data-slider-next aria-label="Next destination">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                </p>
            </div>
        </div>
    </section>

    <!-- 4 · Client quote -->
    @include('partials.quote', ['quote' => $quote])

    <!-- 5 · How it works -->
    @include('partials.process-steps', ['process' => $process])

    <!-- 6 · Sample itineraries -->
    @include('partials.itinerary-grid', ['itineraries' => $itineraries])

    <!-- 7 · Featured gallery -->
    @if (count($featured))
        @php $spot = $featured[0]; @endphp
        <section class="spot" data-gallery>
            <div class="spot__strip" data-gallery-strip>
                @foreach ($spot['gallery'] as $index => $shot)
                    <figure class="spot__frame" @if ($index > 4) data-defer-src="{{ img($shot) }}" @endif>
                        <img src="{{ img($shot) }}" alt="{{ $spot['lodge'] }}" loading="lazy" width="1350" height="844">
                    </figure>
                @endforeach
            </div>
            <div class="wrap spot__overlay">
                <p class="spot__count"><span data-gallery-index>01</span> <i>/</i> {{ str_pad((string) count($spot['gallery']), 2, '0', STR_PAD_LEFT) }}</p>
                <p class="eyebrow">{{ strtolower($spot['country']) }}</p>
                <h2 class="display display--sm">{{ $spot['title'] }}</h2>
                <p class="spot__summary">{{ $spot['summary'] }}</p>
                <ul class="itn-meta">
                    <li>{{ $spot['style'] }}</li>
                    <li>From {{ $spot['price'] }}</li>
                    <li>{{ $spot['guests'] }} guests</li>
                    <li>{{ $spot['nights'] }} nights</li>
                </ul>
                <p><a class="btn" href="{{ url('/sample-itineraries/' . $spot['slug']) }}"><span>view safari</span></a></p>
            </div>
        </section>
    @endif

    <!-- 8 · Independence -->
    <section class="why">
        <div class="wrap why__grid">
            <div class="why__text">
                <p class="eyebrow reveal-up" data-reveal>why choose fitzroy?</p>
                @foreach ($why as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                <p class="reveal-up" data-reveal><a class="btn btn--ghost" href="{{ url('/about-us') }}"><span>about us</span></a></p>
            </div>
            <div class="why__media">
                <figure class="reveal" data-reveal>
                    <img src="{{ img(\App\Support\Repo::THEME . '/whyd-img2-desktop.webp') }}" alt="Lion at dawn" loading="lazy" width="1200" height="800">
                </figure>
                <figure class="reveal" data-reveal>
                    <img src="{{ img(\App\Support\Repo::THEME . '/whyd-img3-desktop.webp') }}" alt="Balloon safari over the desert" loading="lazy" width="1200" height="800">
                </figure>
            </div>
        </div>
    </section>

    <!-- 9 · Our approach -->
    <div class="wrap">
        @include('partials.approach', ['approach' => $approach])
    </div>

    @include('partials.cta-band', [
        'heading' => 'ready to get started?',
        'text'    => 'An initial conversation is the fastest way to find out whether we are the right fit — and the most fun part of planning.',
    ])

@endsection
