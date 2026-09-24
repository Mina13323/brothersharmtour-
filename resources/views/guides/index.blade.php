@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="stories">
        <div class="wrap">
            <div class="stories__grid">
                @foreach ($guides as $index => $guide)
                    <article class="story-card reveal" data-reveal>
                        <a class="story-card__media" data-media href="{{ url('/guides/' . $guide['slug']) }}">
                            <img class="drive-img" src="{{ img($guide['image']) }}" alt="{{ $guide['title'] }}" loading="lazy" width="900" height="620">
                        </a>
                        <p class="story-card__meta">
                            <span>{{ $guide['type'] === 'season' ? 'season' : 'guide' }}</span>
                            <span>{{ count($guide['trips']) }} related trip{{ count($guide['trips']) > 1 ? 's' : '' }}</span>
                        </p>
                        <h2 class="story-card__title">
                            <a href="{{ url('/guides/' . $guide['slug']) }}">{{ $guide['title'] }}</a>
                        </h2>
                        <p class="story-card__strap">{{ $guide['strap'] }}</p>
                        <p><a class="link-more" href="{{ url('/guides/' . $guide['slug']) }}">read it</a></p>
                    </article>
                @endforeach
            </div>
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'question we have not written down?',
        'text'    => 'Ask it. The good ones end up on this page, and the answer reaches the next person asking.',
    ])

@endsection
