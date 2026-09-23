@extends('layouts.app')

@php $name = $destination['name']; @endphp

@section('content')

    <section class="page-hero page-hero--tall">
        <div class="page-hero__media">
            <img src="{{ img($destination['hero']) }}" alt="{{ $name }}" fetchpriority="high" width="1800" height="1200">
            <span class="page-hero__scrim" aria-hidden="true"></span>
        </div>
        <div class="wrap page-hero__inner">
            <p class="eyebrow reveal-up" data-reveal>destination</p>
            <h1 class="display reveal-up" data-reveal>{{ strtolower($name) }}</h1>
            <p class="page-hero__lede reveal-up" data-reveal>{{ $destination['intro'] }}</p>
            <button class="share" type="button" data-share="{{ $name }}">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3v13m0-13L7 8m5-5l5 5M5 14v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                share
            </button>
            <p class="credit credit--light">{{ $destination['credit'] }}</p>
        </div>
    </section>

    <article class="essay">
        <div class="wrap essay__grid">
            <div class="essay__side">
                <p class="eyebrow">{{ $destination['strap'] }}</p>
                <span class="essay__map" aria-hidden="true"><img src="{{ img($destination['map']) }}" alt=""></span>
            </div>

            <div class="essay__body">
                <h2 class="display display--sm">{{ $name }} in detail</h2>
                @foreach ($destination['body'] as $index => $paragraph)
                    <p class="prose">{{ $paragraph }}</p>
                    @if ($index === 0)
                        <p class="pull">{{ $destination['pull'] }}</p>
                    @endif
                @endforeach

                <div class="essay__pair">
                    <figure>
                        <img src="{{ img($destination['images'][0]) }}" alt="{{ $name }}" loading="lazy" width="850" height="850">
                    </figure>
                    <figure>
                        <img src="{{ img($destination['images'][1]) }}" alt="{{ $name }}" loading="lazy" width="850" height="850">
                    </figure>
                </div>

                @if (isset($destination['body'][3]))
                    <p class="prose">{{ $destination['body'][3] }}</p>
                @endif
            </div>
        </div>
    </article>

    <section class="season" id="best-time">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">the best time to visit {{ strtolower($name) }}</p>
            </header>

            <div class="season__grid">
                <ul class="months" data-months>
                    @foreach ($months as $index => $label)
                        <li class="month" data-level="{{ $destination['months'][$index] }}">
                            <span class="month__bar" style="--i: {{ $index }}"></span>
                            <span class="month__label">{{ $label }}</span>
                        </li>
                    @endforeach
                </ul>

                <div class="season__legend">
                    <p class="legend"><i class="dot dot--good"></i> Recommended</p>
                    <p class="legend"><i class="dot dot--trans"></i> Transitional</p>
                    <p class="legend"><i class="dot dot--hard"></i> Challenging conditions</p>
                </div>

                <p class="season__text">{{ $destination['seasons'] }}</p>
            </div>
        </div>
    </section>

    <section class="areas">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">areas to visit</p>
                <h2 class="display display--sm">where in {{ $name }}</h2>
            </header>

            <div class="areas__grid">
                @foreach ($destination['areas'] as $index => $area)
                    <article class="area reveal" data-reveal>
                        <span class="area__media">
                            <img src="{{ img($area['image']) }}" alt="{{ $area['name'] }}" loading="lazy" width="505" height="850">
                            <span class="area__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        </span>
                        <h3>{{ $area['name'] }}</h3>
                        <p>{{ $area['blurb'] }}</p>
                    </article>
                @endforeach
            </div>

            <div class="areas__pair">
                <figure><img src="{{ img($destination['images'][2]) }}" alt="{{ $name }}" loading="lazy" width="680" height="850"></figure>
                <figure><img src="{{ img($destination['images'][3]) }}" alt="{{ $name }}" loading="lazy" width="1350" height="844"></figure>
            </div>
        </div>
    </section>

    @if ($itinerary)
        <section class="wrap paired">
            <div class="paired__text">
                <p class="eyebrow">a journey to start from</p>
                <h2 class="display display--sm">{{ $itinerary['title'] }}</h2>
                <p class="prose">{{ $itinerary['summary'] }}</p>
                <ul class="itn-meta">
                    <li>{{ $itinerary['style'] }}</li>
                    <li>From {{ $itinerary['price'] }}</li>
                    <li>{{ $itinerary['guests'] }} guests</li>
                    <li>{{ $itinerary['nights'] }} nights</li>
                </ul>
                <p><a class="btn" href="{{ url('/sample-itineraries/' . $itinerary['slug']) }}"><span>view safari</span></a></p>
            </div>
            <figure class="paired__media">
                <img src="{{ img($itinerary['image']) }}" alt="{{ $itinerary['title'] }}" loading="lazy" width="850" height="850">
            </figure>
        </section>
    @endif

    <section class="next">
        <div class="wrap next__inner">
            <p class="eyebrow">next destination</p>
            <a class="next__link" href="{{ url('/' . $neighbour['slug']) }}">
                <span class="next__name">{{ strtolower($neighbour['name']) }}</span>
                <span class="next__media"><img src="{{ img($neighbour['thumb']) }}" alt="{{ $neighbour['name'] }}" loading="lazy" width="700" height="460"></span>
            </a>
        </div>
    </section>

    @include('partials.quote', ['quote' => $quote])

    @include('partials.cta-band', [
        'heading' => 'plan a safari in ' . $name,
        'text'    => 'Send us the dates you have and the things you will not want to miss, and we will shape an itinerary around them.',
    ])

@endsection
