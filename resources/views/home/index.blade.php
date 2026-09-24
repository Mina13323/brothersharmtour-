@extends('layouts.app')

@php
    // A rolling strip: one strong frame from trips in different categories.
    $strip = [
        ['tiran-island-snorkelling', 3],
        ['super-safari', 0],
        ['white-island', 4],
        ['swim-with-dolphins', 1],
        ['colored-canyon', 6],
        ['new-cairo-giza-museum', 1],
        ['bedouin-safari', 5],
        ['parasailing', 0],
    ];
@endphp

@section('content')

    <!-- 1 · Hero -->
    <section class="hero" id="hero">
        <div class="hero__media" data-media>
            <img class="drive-img" src="{{ img($hero['image']) }}" alt="{{ $hero['alt'] }}" fetchpriority="high" width="1800" height="1200">
            <span class="hero__grain" aria-hidden="true"></span>
        </div>

        <div class="wrap hero__inner">
            <p class="eyebrow reveal-up" data-reveal>{{ $hero['eyebrow'] }}</p>
            <h1 class="display hero__title reveal-up" data-reveal>{{ $hero['title'] }}</h1>
            <p class="hero__lede reveal-up" data-reveal>{{ $hero['lede'] }}</p>
            <p class="hero__actions reveal-up" data-reveal>
                <a class="btn" href="{{ url('/tours') }}"><span>choose a day trip</span></a>
                <a class="btn btn--ghost" href="{{ url('/contact') }}"><span>ask about dates</span></a>
            </p>
        </div>

        <div class="hero__foot">
            <p class="scroll-cue">
                <span>{{ $hero['scroll'] }}</span>
                <i aria-hidden="true"></i>
            </p>
            <p class="credit">{{ $hero['credit'] }}</p>
        </div>
    </section>

    <!-- 2a · The ticker: what actually runs this season. Rendered in Blade so it
         is here without JS; public/js/animations.js clones the row and drives it
         from scroll velocity when GSAP is available. -->
    @php $ticker = array_column(\App\Support\Tours::all(), 'title'); @endphp
    @if (count($ticker))
        <section class="marquee" data-marquee aria-hidden="true">
            <div class="marquee__track">
                <span class="marquee__row">
                    @foreach ($ticker as $name)
                        <span class="marquee__item">{{ $name }}<i>◆</i></span>
                    @endforeach
                </span>
            </div>
        </section>
    @endif

    <!-- 2b · Who you book with -->
    <section class="split">
        <div class="wrap split__grid">
            <div class="split__text">
                <p class="eyebrow reveal-up" data-reveal>{{ $intro['eyebrow'] }}</p>
                <h2 class="display display--sm reveal-up" data-reveal>{{ $intro['title'] }}</h2>
                @foreach ($intro['body'] as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                <p class="split__cta reveal-up" data-reveal>
                    <a class="btn" href="{{ url('/about') }}"><span>about us</span></a>
                    <a class="btn btn--ghost" href="{{ url('/how-it-works') }}"><span>how it works</span></a>
                </p>
            </div>

            <div class="split__cards">
                @foreach ($intro['cards'] as $card)
                    <figure class="tile reveal" data-reveal>
                        <span class="tile__media" data-media>
                            <img class="drive-img" src="{{ img($card['image']) }}" alt="{{ $card['alt'] }}" loading="lazy" width="900" height="1200">
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

    <!-- 3 · Numbers -->
    <section class="stats">
        <ul class="wrap stats__grid">
            @foreach ($stats as $stat)
                <li class="stat reveal-up" data-reveal>
                    <span class="stat__value">{{ $stat['value'] }}</span>
                    <span class="stat__label">{{ $stat['label'] }}</span>
                </li>
            @endforeach
        </ul>
    </section>

    <!-- 4 · Where we work -->
    <section class="where" id="where-we-operate">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow reveal-up" data-reveal>around sharm</p>
                @foreach ($operating as $paragraph)
                    <p class="section-head__lede reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
            </header>
        </div>

        <div class="where__slider" data-slider="areas">
            <div class="where__track" data-slider-track>
                @foreach ($areas as $index => $area)
                    <article class="where__slide" data-slide>
                        <a class="where__card" href="{{ url('/areas/' . $area['slug']) }}">
                            <span class="where__media" data-media>
                                <img class="drive-img" src="{{ img($area['image']) }}" alt="{{ $area['alt'] }}" loading="lazy" width="1000" height="1250">
                            </span>
                            <span class="where__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                            <span class="where__body">
                                <span class="where__name">{{ $area['name'] }}</span>
                                <span class="where__strap">{{ $area['strap'] }}</span>
                                <span class="where__more">See what starts here</span>
                            </span>
                        </a>
                    </article>
                @endforeach
            </div>

            <div class="wrap where__controls">
                <p class="where__count"><span data-slider-index>01</span> <i>/</i> {{ str_pad((string) count($areas), 2, '0', STR_PAD_LEFT) }}</p>
                <p class="where__arrows">
                    <button class="arrow" type="button" data-slider-prev aria-label="Previous place">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                    <button class="arrow" type="button" data-slider-next aria-label="Next place">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                </p>
            </div>
        </div>
    </section>

    <!-- 5 · The trips -->
    @include('partials.tour-grid', ['tours' => $tours])

    <!-- 5b · Packages. Renders only once App\Support\Packages::all() has rows in
         it, so an empty data file never leaves a hole on the page. The full
         section — with its own placeholder — lives at /packages. -->
    @if (\App\Support\Packages::has())
        @include('packages.band', ['packages' => \App\Support\Packages::featured(3)])
    @endif

    <!-- 6 · Promise -->
    @include('partials.quote', ['quote' => $promise])

    <!-- 7 · How a booking works -->
    @include('partials.process-steps', ['process' => $process])

    <!-- 8 · One frame per trip type -->
    <section class="spot" data-gallery>
        <div class="spot__strip" data-gallery-strip>
            @foreach ($strip as $index => $pair)
                <figure class="spot__frame">
                    <img class="drive-img" src="{{ \App\Support\Tours::img($pair[0], $pair[1], 1350) }}"
                         alt="{{ \App\Support\Tours::alt($pair[0], $pair[1]) }}"
                         loading="{{ $index < 2 ? 'eager' : 'lazy' }}" width="1350" height="844">
                </figure>
            @endforeach
        </div>
        <div class="wrap spot__overlay">
            <p class="spot__count"><span data-gallery-index>01</span> <i>/</i> {{ str_pad((string) count($strip), 2, '0', STR_PAD_LEFT) }}</p>
            <p class="eyebrow">sharm el-sheikh, south sinai</p>
            <h2 class="display display--sm">the same water, eight different days</h2>
            <p class="spot__summary">Pick a trip and the page tells you the length, the pick-up time, what is on the boat and what to bring. No “from £—” with an asterisk.</p>
            <ul class="itn-meta">
                <li>{{ $tripCount }} trips</li>
                <li>hotel pick-up included</li>
                <li>free cancellation 24h</li>
                <li>pay on the day</li>
            </ul>
            <p><a class="btn" href="{{ url('/tours') }}"><span>browse every trip</span></a></p>
        </div>
    </section>

    <!-- 9 · Why it is like this -->
    <section class="why">
        <div class="wrap why__grid">
            <div class="why__text">
                <p class="eyebrow reveal-up" data-reveal>why book with us?</p>
                @foreach ($why as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                <p class="reveal-up" data-reveal><a class="btn btn--ghost" href="{{ url('/about') }}"><span>about us</span></a></p>
            </div>
            <div class="why__media">
                <figure class="reveal" data-reveal>
                    <img class="drive-img" src="{{ \App\Support\Tours::img('white-island', 9, 1200) }}" alt="Swimmers in the shallows off White Island" loading="lazy" width="1200" height="800">
                </figure>
                <figure class="reveal" data-reveal>
                    <img class="drive-img" src="{{ \App\Support\Tours::img('super-safari', 2, 1200) }}" alt="Quad bikes on the plateau above Naama Bay at sunset" loading="lazy" width="1200" height="800">
                </figure>
            </div>
        </div>
    </section>

    <!-- 10 · How the days are built -->
    <div class="wrap">
        @include('partials.approach', ['approach' => $approach])
    </div>

    @include('partials.cta-band', [
        'heading' => 'ready to pick a day?',
        'text'    => 'Send us the date and the number of you. We will come back with the price for that day, what is on it, and the pick-up time — usually within the hour.',
    ])

@endsection
