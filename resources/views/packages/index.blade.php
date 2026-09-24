@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero, 'heroClass' => 'page-hero--tall'])

    <!-- Where the packages sit, or the honest state before they do. -->
    <section class="packages">
        <div class="wrap">
            <header class="section-head packages__head">
                <p class="eyebrow reveal-up" data-reveal>{{ $intro['eyebrow'] }}</p>
                <h2 class="display reveal-up" data-reveal>{{ $intro['title'] }}</h2>
                <p class="section-head__lede reveal-up" data-reveal>{{ $intro['lede'] }}</p>
            </header>

            @if (count($packages))
                <div class="packages__grid">
                    @foreach ($packages as $package)
                        @include('partials.package-card', ['package' => $package])
                    @endforeach
                </div>

                <p class="packages__foot reveal-up" data-reveal>
                    Every week here can be reshaped — more days, a private boat, a different order.
                    <a class="link-more" href="{{ url('/contact') }}"><span>tell us the shape you want</span></a>
                </p>
            @else
                <!-- Placeholder state: shown while App\Support\Packages::all() is
                     empty. Add a package and this block disappears on its own. -->
                <div class="packages__empty">
                    <div class="packages__empty-text">
                        <p class="eyebrow">{{ $note['title'] }}</p>
                        <h3 class="display display--sm">weeks are priced per season, not per website</h3>
                        <p class="prose">{{ $note['body'] }}</p>
                        <p class="packages__empty-actions">
                            <a class="btn" href="{{ url('/contact') }}"><span>build my week</span></a>
                            <a class="btn btn--ghost" href="{{ url('/tours') }}"><span>book the days yourself</span></a>
                        </p>
                    </div>

                    <ul class="packages__empty-list">
                        @foreach ($always as $item)
                            <li>
                                <h4>{{ $item['t'] }}</h4>
                                <p>{{ $item['p'] }}</p>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>
    </section>

    <!-- What is in the price, whether or not a bundle is listed. -->
    <section class="practical">
        <div class="wrap practical__grid">
            <div class="practical__text">
                <p class="eyebrow reveal-up" data-reveal>always in the price</p>
                <h2 class="display display--sm reveal-up" data-reveal>what a package is made of</h2>
                <p class="prose reveal-up" data-reveal>
                    A package is not a discount on the day trips. It is the same boats, the same guides and the same
                    cars, arranged across a week so the sea day comes when the sea is flat and the long drive comes
                    when you have the energy for it.
                </p>
            </div>

            <ul class="practical__list reveal-up" data-reveal>
                @foreach ($always as $item)
                    <li>
                        <span>{{ $item['t'] }}</span>
                        <em>{{ $item['p'] }}</em>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

    <!-- The days a package is built from, so this page is useful today. -->
    @include('partials.tour-grid', ['tours' => $tours])

@endsection
