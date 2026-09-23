@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="filters">
        <div class="wrap filters__inner">
            <p class="eyebrow">filter by country</p>
            <ul class="filters__list">
                <li><a class="{{ !$active ? 'is-active' : '' }}" href="{{ url('/inspiration') }}">All</a></li>
                @foreach ($countries as $option)
                    <li>
                        <a class="{{ $active === $option ? 'is-active' : '' }}" href="{{ url('/inspiration?country=' . urlencode($option)) }}">{{ $option }}</a>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

    <section class="itn itn--page">
        <div class="itn__grid">
            @php $total = count($itineraries); @endphp
            @foreach ($itineraries as $index => $item)
                @include('partials.itinerary-card', [
                    'item'  => $item,
                    'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'total' => str_pad((string) $total, 2, '0', STR_PAD_LEFT),
                ])
            @endforeach
        </div>
        @if (!$itineraries)
            <div class="wrap"><p class="prose">No sample journeys match that filter yet — try another country.</p></div>
        @endif
    </section>

    @include('partials.approach', ['approach' => $approach])

    @include('partials.cta-band', [
        'heading' => 'make it yours',
        'text'    => 'Every price here is a real quote for real dates, and every line can be changed — longer in one camp, a night under canvas, a different month entirely.',
    ])

@endsection
