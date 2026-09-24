@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="dest-index">
        <div class="wrap">
            <p class="eyebrow reveal-up" data-reveal>around sharm el-sheikh</p>
        </div>

        <ul class="dest-list">
            @foreach ($areas as $index => $area)
                <li class="dest-row reveal" data-reveal>
                    <a href="{{ url('/areas/' . $area['slug']) }}">
                        <span class="dest-row__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        <span class="dest-row__name">{{ $area['name'] }}</span>
                        <span class="dest-row__strap">{{ $area['strap'] }}</span>
                        <span class="dest-row__media" data-media>
                            <img class="drive-img" src="{{ img($area['image']) }}" alt="{{ $area['alt'] }}" loading="lazy" width="800" height="560">
                        </span>
                        <span class="dest-row__go" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 12h15m-6-7l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                        </span>
                    </a>
                </li>
            @endforeach
        </ul>
    </section>

    <section class="wrap faq-strip">
        <header class="section-head">
            <p class="eyebrow">start from a trip instead</p>
            <h2 class="display display--sm">twenty days out of the bay</h2>
        </header>
        <p class="prose">
            Every place here is the start or the finish of one of the trips on the day-trip page. If you already know what you
            want to do, <a href="{{ url('/tours') }}">pick it there</a> and the meeting point writes itself.
        </p>
    </section>

    @include('partials.cta-band', [
        'heading' => 'not sure which end of the bay?',
        'text'    => 'Tell us where you are staying and what the group is like. We will say which days start closest and which are worth the drive.',
    ])

@endsection
