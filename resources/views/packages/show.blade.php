@extends('layouts.app')

@section('content')

    <section class="page-hero page-hero--tall tour-hero">
        <div class="page-hero__media" data-media>
            <img class="drive-img" src="{{ $heroImage }}" alt="{{ $package['name'] }} package in Sharm el-Sheikh" fetchpriority="high" width="1800" height="1200">
            <span class="page-hero__scrim" aria-hidden="true"></span>
        </div>
        <div class="wrap page-hero__inner">
            @include('partials.breadcrumb', ['crumbClass' => 'crumbs--onhero'])

            <p class="eyebrow reveal-up" data-reveal>{{ \App\Support\Packages::length($package) ?: 'a week in Sharm' }}</p>
            <h1 class="display reveal-up" data-reveal>{{ $package['name'] }}</h1>
            <p class="page-hero__lede reveal-up" data-reveal>{{ $package['strap'] }}</p>
        </div>
    </section>

    <section class="trip-meta">
        <div class="wrap trip-meta__inner">
            <dl>
                <div><dt>Length</dt><dd>{{ \App\Support\Packages::length($package) ?: '—' }}</dd></div>
                <div><dt>Group</dt><dd>{{ $package['people'] ?? '—' }}</dd></div>
                <div><dt>Trips</dt><dd>{{ count($trips) }}</dd></div>
                <div><dt>Price</dt><dd>{{ \App\Support\Packages::priceShort($package) }}</dd></div>
            </dl>
        </div>
    </section>

    <section class="tour-body">
        <div class="wrap tour-body__grid">
            <div class="tour-body__text">
                <p class="lead reveal-up" data-reveal>{{ $package['lede'] }}</p>

                @if (count($trips))
                    <h2 class="h2">the days in the week</h2>
                    <ol class="daylist">
                        @foreach ($trips as $day => $tour)
                            <li class="daylist__item">
                                <a href="{{ url('/tours/' . $tour['slug']) }}">
                                    <span class="daylist__n">day {{ str_pad((string) ($day + 1), 2, '0', STR_PAD_LEFT) }}</span>
                                    <span class="daylist__body">
                                        <strong>{{ $tour['title'] }}</strong>
                                        <em>{{ $tour['strap'] }}</em>
                                    </span>
                                    <span class="daylist__go" aria-hidden="true">→</span>
                                </a>
                            </li>
                        @endforeach
                    </ol>
                @endif

                @if (!empty($package['included']))
                    <h2 class="h2">what the price covers</h2>
                    <div class="incl">
                        <div class="incl__col">
                            <p class="eyebrow">included</p>
                            <ul class="ticklist ticklist--yes">
                                @foreach ($package['included'] as $line)
                                    <li>{{ $line }}</li>
                                @endforeach
                            </ul>
                        </div>
                        @if (!empty($package['excluded']))
                            <div class="incl__col">
                                <p class="eyebrow">not included</p>
                                <ul class="ticklist ticklist--no">
                                    @foreach ($package['excluded'] as $line)
                                        <li>{{ $line }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    </div>
                @endif

                @if (!empty($package['notes']))
                    <h2 class="h2">worth knowing</h2>
                    <p class="prose">{{ $package['notes'] }}</p>
                @endif
            </div>

            <aside class="tour-body__side">
                <div class="side-card">
                    <p class="eyebrow">this week</p>
                    <p class="side-card__price">{{ \App\Support\Packages::price($package) }}</p>
                    <p class="side-card__line"><span>Trips</span>{{ count($trips) }} included</p>
                    @if (!empty($package['people']))
                        <p class="side-card__line"><span>Sized for</span>{{ $package['people'] }}</p>
                    @endif
                    <a class="btn btn--solid" href="{{ url('/contact') }}"><span>hold these dates</span></a>
                    <a class="link-quiet" href="{{ url('/packages') }}"><span>all packages</span></a>
                </div>
            </aside>
        </div>
    </section>

    @include('partials.cta-band', ['heading' => 'change any of it', 'text' => 'Add a day, drop the quad evening, make the boat private. The week is yours to reshape and the price moves with it.'])

@endsection
