@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero, 'heroClass' => 'page-hero--tall'])

    <p class="drive-notice">
        <strong>The trip photography is not loading.</strong>
        It is served from our own Google Drive folder, so that folder has to be shared as
        <em>Anyone with the link — Viewer</em>. Check its sharing setting, or copy the folder
        into <code>public/img/tours</code> and set <code>DRIVE_MODE=local</code>.
    </p>

    <section class="filters">
        <div class="wrap filters__inner">
            <p class="eyebrow">what kind of day?</p>
            <ul class="filters__list">
                <li><a class="{{ !$active ? 'is-active' : '' }}" href="{{ url('/tours') }}">All {{ $tripCount }}</a></li>
                @foreach ($categories as $option)
                    <li>
                        <a class="{{ $active === $option['key'] ? 'is-active' : '' }}"
                           href="{{ url('/tours?category=' . urlencode($option['key'])) }}">{{ $option['label'] }} <i>{{ $option['count'] }}</i></a>
                    </li>
                @endforeach
                <li><a href="{{ url('/films') }}">Films</a></li>
            </ul>
        </div>
    </section>

    @if ($active)
        <div class="wrap">
            <p class="filter-note">
                {{ count($tours) }} trips in this group · <a href="{{ url('/tours') }}">show all {{ $tripCount }}</a>
            </p>
        </div>
    @endif

    <section class="itn itn--page tours-grid">
        <div class="itn__grid">
            @foreach ($tours as $index => $item)
                @include('partials.tour-card', [
                    'item'  => $item,
                    'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'total' => str_pad((string) count($tours), 2, '0', STR_PAD_LEFT),
                ])
            @endforeach
        </div>

        @if (!$tours)
            <div class="wrap"><p class="prose">Nothing in that group yet — <a href="{{ url('/tours') }}">see every trip</a> instead.</p></div>
        @endif
    </section>

    <section class="practical">
        <div class="wrap practical__grid">
            <div class="practical__text">
                <p class="eyebrow reveal-up" data-reveal>how the days work</p>
                <h2 class="display display--sm reveal-up" data-reveal>prices, pick-ups and the small print</h2>
                <p class="prose reveal-up" data-reveal>
                    Trip prices are per person and confirmed before you pay, because they move with the season, the boat and how
                    many of you there are. Private versions of almost everything here cost more per head and are worth it on the
                    boat days in particular.
                </p>
                <p class="prose reveal-up" data-reveal>
                    Pick-up is from your hotel gate, not the lobby, and the driver will ring reception if the gate is locked.
                    Cancelling is free until 24 hours before the start time — the boats and the quads are held for you overnight.
                </p>
                <p class="reveal-up" data-reveal>
                    <a class="btn btn--ghost" href="{{ url('/faq') }}"><span>all the questions, answered</span></a>
                </p>
            </div>
            <ul class="practical__list reveal-up" data-reveal>
                <li><span>Payment</span><em>Card, cash or transfer; nothing is charged until the trip is confirmed.</em></li>
                <li><span>Languages</span><em>English and Arabic on every trip; Russian, German, Italian and French on request.</em></li>
                <li><span>Children</span><em>Most trips take children from 4; dolphin and submarine days take any age.</em></li>
                <li><span>What to bring</span><em>Swimwear, towel, sunscreen, shoes that can get wet, small notes for the crew.</em></li>
                <li><span>Weather</span><em>Boat days are wind-dependent. If we cancel, you are refunded or moved, your choice.</em></li>
            </ul>
        </div>
    </section>

    <section class="faq-strip">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">asked every week</p>
                <h2 class="display display--sm">before you book a day with us</h2>
            </header>

            <dl class="faq-list">
                @foreach (array_slice($faq ?? [], 0, 4) as $item)
                    <div class="faq-item">
                        <dt>{{ $item['q'] }}</dt>
                        <dd>{{ $item['a'] }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'tell us the day you want',
        'text'    => 'Two people, a boat, a Friday, nothing shared with strangers — that is a normal request and usually a better day than the group version.',
    ])

@endsection
