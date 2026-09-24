@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="split split--plain">
        <div class="wrap split__grid">
            <div class="split__text">
                <p class="eyebrow reveal-up" data-reveal>the short version</p>
                @foreach ($about['body'] as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                @foreach ($about['second'] as $paragraph)
                    <p class="prose reveal-up" data-reveal>{{ $paragraph }}</p>
                @endforeach
                <p class="split__cta reveal-up" data-reveal>
                    <a class="btn" href="{{ url('/tours') }}"><span>see the trips</span></a>
                    <a class="btn btn--ghost" href="{{ url('/contact') }}"><span>talk to us</span></a>
                </p>
            </div>

            <div class="split__cards">
                @php $frames = [['bedouin-safari', 1], ['tiran-island-snorkelling', 4], ['white-island', 11]]; @endphp
                @foreach ($frames as $pair)
                    <figure class="tile reveal" data-reveal>
                        <span class="tile__media" data-media>
                            <img class="drive-img" src="{{ \App\Support\Tours::img($pair[0], $pair[1], 900) }}"
                                 alt="{{ \App\Support\Tours::alt($pair[0], $pair[1]) }}" loading="lazy" width="900" height="1200">
                        </span>
                        <figcaption class="tile__label">
                            <span class="tile__kicker">on a trip</span>
                            <span class="tile__name">{{ \App\Support\Tours::find($pair[0])['title'] }}</span>
                        </figcaption>
                    </figure>
                @endforeach
            </div>
        </div>
    </section>

    <section class="commit">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">what we hold to</p>
                <h2 class="display display--sm">three lines, no small print</h2>
            </header>

            <ul class="commit__grid">
                @foreach ($commitment as $index => $line)
                    <li class="reveal-up" data-reveal>
                        <span class="commit__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        <p>{{ $line }}</p>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

    <section class="areas">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">where we work</p>
                <h2 class="display display--sm">the bay, the reef, the mountains</h2>
            </header>

            <div class="areas__grid">
                @foreach ($areas as $index => $area)
                    <a class="area reveal" data-reveal href="{{ url('/areas/' . $area['slug']) }}">
                        <span class="area__media" data-media>
                            <img class="drive-img" src="{{ img($area['image']) }}" alt="{{ $area['alt'] }}" loading="lazy" width="505" height="850">
                            <span class="area__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        </span>
                        <h3>{{ $area['name'] }}</h3>
                        <p>{{ $area['blurb'] }}</p>
                    </a>
                @endforeach
            </div>
        </div>
    </section>

    @include('partials.quote', ['quote' => $promise])

    @include('partials.cta-band', [
        'heading' => 'book with the people who write this',
        'text'    => 'No call centre, no broker, no upsell desk. One number, and the day you asked for.',
    ])

@endsection
