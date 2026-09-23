@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="dest-index">
        <div class="wrap">
            <p class="eyebrow reveal-up" data-reveal>selected destinations</p>
        </div>

        <ul class="dest-list">
            @foreach ($destinations as $destination)
                @php $number = $numberOrder[$destination['slug']] ?? $destination['number']; @endphp
                <li class="dest-row reveal" data-reveal>
                    <a href="{{ url('/' . $destination['slug']) }}">
                        <span class="dest-row__num">{{ $number }}</span>
                        <span class="dest-row__name">{{ $destination['name'] }}</span>
                        <span class="dest-row__strap">{{ $destination['strap'] }}</span>
                        <span class="dest-row__media">
                            <img src="{{ img($destination['thumb']) }}" alt="{{ $destination['name'] }}" loading="lazy" width="800" height="560">
                        </span>
                        <span class="dest-row__go" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 12h15m-6-7l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                        </span>
                    </a>
                </li>
            @endforeach
        </ul>
    </section>

    @include('partials.quote', ['quote' => $quote])

    @include('partials.cta-band', [
        'heading' => 'not sure where to start?',
        'text'    => 'Most trips begin with a country you have only read about. Tell us the animals, the landscape or the occasion, and we will tell you where it is actually possible.',
    ])

@endsection
