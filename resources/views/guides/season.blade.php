@extends('layouts.app')

@section('content')

    <section class="article">
        <div class="wrap article__head">
            @include('partials.breadcrumb')

            <p class="eyebrow reveal-up" data-reveal>season · sharm el-sheikh</p>
            <h1 class="display reveal-up" data-reveal>{{ $guide['title'] }}</h1>
            <p class="lead reveal-up" data-reveal>{{ $guide['strap'] }}</p>
            <p class="article__meta reveal-up" data-reveal>
                <span>Air and sea temperatures, wind and crowds</span>
                <span>{{ count($trips) }} trips mentioned</span>
                <button class="link-quiet" type="button" data-share="{{ $guide['title'] }}">Share</button>
            </p>
        </div>

        <figure class="article__hero" data-media>
            <img class="drive-img" src="{{ img($guide['image']) }}" alt="Snorkellers on the reef shelf at Sharm el-Sheikh in spring" fetchpriority="high" width="1600" height="900">
        </figure>

        <section class="season" id="best-time">
            <div class="wrap">
                <header class="section-head">
                    <p class="eyebrow">the year, month by month</p>
                    <h2 class="display display--sm">when to come, and for what</h2>
                </header>

                <div class="season__grid">
                    <ul class="months" data-months>
                        @foreach ($labels as $index => $label)
                            <li class="month" data-level="{{ $months[$index] }}">
                                <span class="month__bar" style="--i: {{ $index }}"></span>
                                <span class="month__label">{{ $label }}</span>
                            </li>
                        @endforeach
                    </ul>

                    <div class="season__legend">
                        <p class="legend"><i class="dot dot--good"></i> Best for water &amp; boats</p>
                        <p class="legend"><i class="dot dot--trans"></i> Good, with a wind risk</p>
                        <p class="legend"><i class="dot dot--hard"></i> Hot — go early or after dark</p>
                    </div>

                    <p class="season__text">
                        Based on how the trips actually run, not on a climate chart. Pick a month and we will tell you which of
                        our days is good in it, and which we would rather move.
                    </p>
                </div>

                <div class="season-table">
                    <table>
                        <caption class="sr-only">Sharm el-Sheikh by month: high temperature, sea temperature and what the month is good for</caption>
                        <thead>
                            <tr><th scope="col">Month</th><th scope="col">Air high</th><th scope="col">Sea</th><th scope="col">What to expect</th></tr>
                        </thead>
                        <tbody>
                            @foreach ($seasonTable as $row)
                                <tr>
                                    <th scope="row">{{ $row[0] }}</th>
                                    <td>{{ $row[1] }}°C</td>
                                    <td>{{ $row[2] }}°C</td>
                                    <td>{{ $row[3] }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <div class="wrap article__body">
            <div class="article__text">
                @foreach ($guide['body'] as $index => $paragraph)
                    <p class="prose">{{ $paragraph }}</p>
                    @if ($index === 1 && isset($guide['bullets'][0]))
                        <p class="article__pull">{{ $guide['bullets'][0] }}</p>
                    @endif
                @endforeach

                <h2 class="h2">book the month well</h2>
                <ul class="ticklist">
                    @foreach (array_slice($guide['bullets'], 1) as $bullet)
                        <li>{{ $bullet }}</li>
                    @endforeach
                </ul>

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
                    <a class="btn" href="{{ url('/contact') }}"><span>ask about your dates</span></a>
                    <a class="btn btn--ghost" href="{{ url('/tours') }}"><span>all day trips</span></a>
                </p>
            </div>

            <aside class="article__side">
                <div class="side-card">
                    <p class="eyebrow">on this page</p>
                    <ul class="side-toc">
                        <li><a href="#best-time">The month chart</a></li>
                        <li><a href="#best-time">Temperatures, table form</a></li>
                        <li><a href="{{ url('/faq') }}">Booking FAQ</a></li>
                        <li><a href="{{ url('/tours') }}">Every trip</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'tell us your week',
        'text'    => 'Dates, group, and what you want out of it. We will put the days in the right order for the season you are coming in.',
    ])

@endsection
