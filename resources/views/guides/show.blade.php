@extends('layouts.app')

@section('content')

    <section class="article">
        <div class="wrap article__head">
            @include('partials.breadcrumb')

            <p class="eyebrow reveal-up" data-reveal>{{ $guide['type'] === 'season' ? 'season' : 'guide' }} · sharm el-sheikh</p>
            <h1 class="display reveal-up" data-reveal>{{ $guide['title'] }}</h1>
            <p class="lead reveal-up" data-reveal>{{ $guide['strap'] }}</p>
            <p class="article__meta reveal-up" data-reveal>
                <span>Written by the guides who run the days</span>
                <span>{{ count($guide['trips']) }} trips mentioned</span>
                <button class="link-quiet" type="button" data-share="{{ $guide['title'] }}">Share</button>
            </p>
        </div>

        <figure class="article__hero" data-media>
            <img class="drive-img" src="{{ img($guide['image']) }}" alt="{{ $guide['title'] }}" fetchpriority="high" width="1600" height="900">
        </figure>

        <div class="wrap article__body">
            <div class="article__text">
                <p class="lead">{{ $guide['lede'] }}</p>

                @if (isset($guide['body']))
                    @foreach ($guide['body'] as $index => $paragraph)
                        <p class="prose">{{ $paragraph }}</p>
                        @if ($index === 1 && isset($guide['bullets'][0]))
                            <p class="article__pull">{{ $guide['bullets'][0] }}</p>
                        @endif
                    @endforeach
                @endif

                @if (isset($guide['bullets']))
                    <h2 class="h2">the short list</h2>
                    <ul class="ticklist">
                        @foreach (array_slice($guide['bullets'], 1) as $bullet)
                            <li>{{ $bullet }}</li>
                        @endforeach
                    </ul>
                @endif

                @if (count($trips))
                    <h2 class="h2">trips in this guide</h2>
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

                <p class="article__foot">
                    <a class="btn" href="{{ url('/contact') }}"><span>ask us about this</span></a>
                    <a class="btn btn--ghost" href="{{ url('/tours') }}"><span>all day trips</span></a>
                </p>
            </div>

            <aside class="article__side">
                <div class="side-card">
                    <p class="eyebrow">in this guide</p>
                    <ul class="side-toc">
                        <li><a href="#main">Start here</a></li>
                        @if (isset($guide['bullets']))
                            <li><a href="#main">The short list</a></li>
                        @endif
                        @if (count($trips))
                            <li><a href="#main">Trips mentioned</a></li>
                        @endif
                        <li><a href="{{ url('/faq') }}">Booking FAQ</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    </section>

    @if (count($others))
        <section class="stories stories--strip">
            <div class="wrap">
                <header class="section-head">
                    <p class="eyebrow">keep reading</p>
                    <h2 class="display display--sm">more from the guides</h2>
                </header>

                <div class="stories__grid">
                    @foreach ($others as $other)
                        <article class="story-card">
                            <a class="story-card__media" data-media href="{{ url('/guides/' . $other['slug']) }}">
                                <img class="drive-img" src="{{ img($other['image']) }}" alt="{{ $other['title'] }}" loading="lazy" width="900" height="620">
                            </a>
                            <h3 class="story-card__title"><a href="{{ url('/guides/' . $other['slug']) }}">{{ $other['title'] }}</a></h3>
                            <p class="story-card__strap">{{ $other['strap'] }}</p>
                        </article>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

@endsection
