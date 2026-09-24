@extends('layouts.app')

@php $name = $area['name']; @endphp

@section('content')

    <section class="page-hero page-hero--tall">
        <div class="page-hero__media" data-media>
            <img class="drive-img" src="{{ img($area['image']) }}" alt="{{ $area['alt'] }}" fetchpriority="high" width="1800" height="1200">
            <span class="page-hero__scrim" aria-hidden="true"></span>
        </div>
        <div class="wrap page-hero__inner">
            @include('partials.breadcrumb', ['crumbClass' => 'crumbs--onhero'])

            <p class="eyebrow reveal-up" data-reveal>place</p>
            <h1 class="display reveal-up" data-reveal>{{ $name }}</h1>
            <p class="page-hero__lede reveal-up" data-reveal>{{ $area['blurb'] }}</p>
            <button class="share" type="button" data-share="{{ $name }}">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3v13m0-13L7 8m5-5l5 5M5 14v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                share
            </button>
            <p class="credit credit--light">{{ $area['strap'] }}</p>
        </div>
    </section>

    <article class="essay">
        <div class="wrap essay__grid">
            <div class="essay__side">
                <p class="eyebrow">{{ $area['strap'] }}</p>
                <ul class="essay__facts">
                    <li><span>Trips starting here</span>{{ count($trips) }}</li>
                    <li><span>Base</span>Naama Bay, Sharm el-Sheikh</li>
                    <li><span>Pick-up</span>from every hotel in the bay</li>
                </ul>
            </div>

            <div class="essay__body">
                <h2 class="display display--sm">{{ $name }} in practice</h2>
                <p class="lead">{{ $area['blurb'] }}</p>
                <p class="prose">
                    What follows is how the place behaves on the days we run here — where the boats tie up, when the wind comes,
                    which hour the light is worth getting out of bed for. It is the same information we give people over
                    WhatsApp, put in one place.
                </p>

                @if (count($trips))
                    <h3 class="h3">days that start here</h3>
                    <ul class="area-trips">
                        @foreach ($trips as $tour)
                            <li>
                                <a href="{{ url('/tours/' . $tour['slug']) }}">
                                    <span class="area-trips__title">{{ $tour['title'] }}</span>
                                    <span class="area-trips__meta">{{ $tour['duration'] }} · {{ \App\Support\Tours::price($tour) }}</span>
                                </a>
                            </li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </div>
    </article>

    @if (count($trips))
        <section class="itn itn--page">
            <div class="itn__grid">
                @foreach ($trips as $index => $tour)
                    @include('partials.tour-card', [
                        'item'  => $tour,
                        'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                        'total' => str_pad((string) count($trips), 2, '0', STR_PAD_LEFT),
                    ])
                @endforeach
            </div>
        </section>
    @endif

    <section class="next">
        <div class="wrap next__inner">
            <p class="eyebrow">next place</p>
            <a class="next__link" href="{{ url('/areas/' . $neighbour['slug']) }}">
                <span class="next__name">{{ $neighbour['name'] }}</span>
                <span class="next__media" data-media>
                    <img class="drive-img" src="{{ img($neighbour['image']) }}" alt="{{ $neighbour['alt'] }}" loading="lazy" width="700" height="460">
                </span>
            </a>
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'spend a day here properly',
        'text'    => 'Tell us the date and how many of you there are and we will build the day around this place rather than around a fixed schedule.',
    ])

@endsection
