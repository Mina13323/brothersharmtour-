@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    @include('partials.process-steps', ['process' => $process])

    <section class="prose-block">
        <div class="wrap prose-block__grid">
            <div>
                <p class="eyebrow reveal-up" data-reveal>what we need from you</p>
                <h2 class="display display--sm reveal-up" data-reveal>three lines is enough to price a day</h2>
            </div>
            <div>
                <ul class="ticklist reveal-up" data-reveal>
                    <li>The date, or the window you are flexible in</li>
                    <li>How many of you, and the age of the youngest</li>
                    <li>The hotel name, so the pick-up time is right the first time</li>
                    <li>Anything that matters: a birthday, a bad shoulder, a fear of open water, a vegetarian in the group</li>
                </ul>
                <p class="prose reveal-up" data-reveal>
                    Everything else we can work out. If a trip does not suit your group we will say so and point at the one that
                    does — that conversation has saved more ruined days than any itinerary ever written.
                </p>
            </div>
        </div>
    </section>

    <section class="faq-strip">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">the first four questions</p>
                <h2 class="display display--sm">answered before you ask</h2>
            </header>

            <dl class="faq-list">
                @foreach ($faq as $item)
                    <div class="faq-item">
                        <dt>{{ $item['q'] }}</dt>
                        <dd>{{ $item['a'] }}</dd>
                    </div>
                @endforeach
            </dl>

            <p><a class="link-more" href="{{ url('/faq') }}">every question</a></p>
        </div>
    </section>

    @include('partials.cta-band', [
        'heading' => 'start with a date',
        'text'    => 'Send it over and we will come back with the price, the pick-up time and what to bring.',
    ])

@endsection
