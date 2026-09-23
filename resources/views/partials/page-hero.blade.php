<section class="page-hero">
    <div class="page-hero__media">
        <img src="{{ img($hero['image']) }}" alt="" fetchpriority="high" width="1800" height="1200">
        <span class="page-hero__scrim" aria-hidden="true"></span>
    </div>
    <div class="wrap page-hero__inner">
        @if (isset($hero['eyebrow']))
            <p class="eyebrow reveal-up" data-reveal>{{ $hero['eyebrow'] }}</p>
        @endif
        <h1 class="display reveal-up" data-reveal>{{ $hero['title'] }}</h1>
        @if (isset($hero['lede']))
            <p class="page-hero__lede reveal-up" data-reveal>{{ $hero['lede'] }}</p>
        @endif
        @if (isset($hero['credit']))
            <p class="credit credit--light">{{ $hero['credit'] }}</p>
        @endif
    </div>
</section>
