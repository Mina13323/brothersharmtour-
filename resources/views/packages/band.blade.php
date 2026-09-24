{{-- Homepage packages band. Included only when Packages::has() is true, so an
     empty data file never leaves a gap on the page. --}}
<section class="packages packages--band">
    <div class="wrap">
        <header class="section-head packages__head">
            <p class="eyebrow reveal-up" data-reveal>the weeks</p>
            <h2 class="display reveal-up" data-reveal>book the whole stay, not one day at a time</h2>
            <p class="section-head__lede reveal-up" data-reveal>
                Each one is a set of the trips above, in the order the weather and the boat times prefer, at a single
                price for the week.
            </p>
        </header>

        <div class="packages__grid">
            @foreach ($packages as $package)
                @include('partials.package-card', ['package' => $package])
            @endforeach
        </div>

        <p class="packages__foot reveal-up" data-reveal>
            <a class="link-more" href="{{ url('/packages') }}"><span>how the weeks work</span></a>
        </p>
    </div>
</section>
