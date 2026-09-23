@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="split split--plain">
        <div class="wrap split__grid">
            <div class="split__text">
                <p class="eyebrow reveal-up" data-reveal>travelling with fitzroy</p>
                <h2 class="display display--sm reveal-up" data-reveal>planning, permits and the parts nobody sees</h2>
                <p class="prose reveal-up" data-reveal>
                    Meaningful travel starts with honest conversation. We work out what each of you actually wants from the trip —
                    animals, landscape, people, quiet — and lean on long-standing local partnerships to build something private and
                    carefully paced around that.
                </p>
                <p class="prose reveal-up" data-reveal>
                    The result is less a package than a set of decisions made in the right order: which month, which side of the
                    water, who meets you at the airstrip, and what happens if a weather diversion moves a connection by six hours.
                </p>
                <p class="reveal-up" data-reveal>
                    <a class="btn" href="{{ url('/contact-us') }}"><span>plan your safari</span></a>
                </p>
            </div>

            <div class="split__cards">
                <figure class="tile reveal" data-reveal>
                    <span class="tile__media">
                        <img src="{{ img(\App\Support\Repo::THEME . '/hiw-bg-mobile.webp') }}" alt="Morning game drive" loading="lazy" width="900" height="1200">
                    </span>
                    <figcaption class="tile__label">
                        <span class="tile__kicker">before you fly</span>
                        <span class="tile__name">Everything confirmed in writing</span>
                    </figcaption>
                </figure>
            </div>
        </div>
    </section>

    @include('partials.process-steps', ['process' => $process])

    @include('partials.quote', ['quote' => $quote])

    @include('partials.approach', ['approach' => $approach])

    @include('partials.cta-band', [
        'heading' => 'ready to get started?',
        'text'    => 'A first conversation tells us whether we are the right fit for your trip — and usually gives you a clearer picture of what is possible.',
    ])

@endsection
