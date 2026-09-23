@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="stories">
        <div class="wrap stories__grid">
            @foreach ($stories as $index => $story)
                <article class="story-card reveal" data-reveal>
                    <a href="{{ url('/stories/' . $index) }}">
                        <span class="story-card__media">
                            <img src="{{ img($story['image']) }}" alt="{{ $story['title'] }}" loading="lazy" width="1200" height="800">
                        </span>
                        <span class="story-card__meta">
                            <span class="eyebrow">{{ $story['kicker'] }}</span>
                            <span class="story-card__date">{{ $story['date'] }} · {{ $story['read'] }} read</span>
                        </span>
                        <h2 class="story-card__title">{{ $story['title'] }}</h2>
                        <p>{{ $story['excerpt'] }}</p>
                        <span class="link-more">Read the article</span>
                    </a>
                </article>
            @endforeach
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'get the planning notes',
        'text'    => 'We would rather talk it through than send a PDF — but if you want the thinking behind an itinerary first, these pages are a good stand-in.',
    ])

@endsection
