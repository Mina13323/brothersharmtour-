@extends('layouts.app')

@section('content')

    @include('partials.page-hero', [
        'hero' => [
            'eyebrow' => 'about fitzroy',
            'title'   => 'the team behind the adventures',
            'lede'    => 'A small, completely independent tour operator building immersive journeys into some of Africa’s most remote places.',
            'image'   => \App\Support\Repo::THEME . '/whyd-chem-mobile.webp',
            'credit'  => 'Chem Chem',
        ],
    ])

    <section class="prose-block">
        <div class="wrap prose-block__grid">
            <p class="lead">
                We have no interest in mass tourism, and no intention of starting. What we do instead is take travellers into
                destinations they may previously have only read about, in a way that is genuinely good for the people who live there.
            </p>
            <p>
                Independence is the practical reason any of this works: with no shareholder expecting volume, we can say no to a
                lodge, a season, or an itinerary that would make a nice brochure and a poor trip.
            </p>
        </div>
    </section>

    <section class="team">
        <div class="wrap">
            <p class="eyebrow">who you will actually speak to</p>
            <ul class="team__grid">
                @foreach ($team as $member)
                    <li class="team__item reveal" data-reveal>
                        <a href="{{ url('/about-us/team/' . $member['slug']) }}">
                            <span class="team__media">
                                <img src="{{ img($member['image']) }}" alt="{{ $member['name'] }}" loading="lazy" width="800" height="1000">
                            </span>
                            <span class="team__role">{{ $member['role'] }}</span>
                            <span class="team__name">{{ $member['name'] }}</span>
                            <span class="team__blurb">{{ $member['blurb'] }}</span>
                            <span class="team__more">Read the full bio</span>
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

    <section class="commit">
        <div class="wrap commit__grid">
            <h2 class="display display--sm">our commitment</h2>
            <div>
                @foreach (\App\Support\Repo::commitment() as $paragraph)
                    <p class="prose">{{ $paragraph }}</p>
                @endforeach
                <p><a class="btn btn--ghost" href="{{ url('/contact-us') }}"><span>plan your safari</span></a></p>
            </div>
        </div>
    </section>

    <section class="lasting">
        <div class="wrap lasting__grid">
            <div>
                <p class="eyebrow">lasting relationships</p>
                <h2 class="display display--sm">there is no ‘best’, only the most suitable</h2>
                <p class="prose">
                    Clients tend to keep coming back, because each trip teaches us something about what they want next. That is the
                    whole model: a decade of small corrections, remembered, applied to the journey after this one.
                </p>
            </div>
            <figure class="lasting__media">
                <img src="{{ img('/uploads/2026/06/mountain-gorilla-17fa1f-scaled.webp') }}" alt="Mountain gorilla in mist" loading="lazy" width="1200" height="800">
                <figcaption>Mount Gahinga Lodge, Mgahinga</figcaption>
            </figure>
        </div>
    </section>

    @include('partials.approach', ['approach' => $approach])

@endsection
