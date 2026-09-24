{{-- A package card. $package = one row from App\Support\Packages::all(). --}}
@php
    $tone    = isset($package['tone']) ? ' package-card--' . $package['tone'] : '';
    $length  = \App\Support\Packages::length($package);
    $trips   = \App\Support\Packages::tripsIn($package);
@endphp

<article class="package-card{{ $tone }}{{ isset($package['featured']) && $package['featured'] ? ' is-featured' : '' }}">
    @if (!empty($package['badge']))
        <p class="package-card__badge">{{ $package['badge'] }}</p>
    @endif

    <p class="package-card__meta">
        @if ($length)
            <span>{{ $length }}</span>
        @endif
        @if (!empty($package['people']))
            <span>{{ $package['people'] }} people</span>
        @endif
        @if (count($trips))
            <span>{{ count($trips) }} trips</span>
        @endif
    </p>

    <h3 class="package-card__title display">{{ $package['name'] }}</h3>

    @if (!empty($package['strap']))
        <p class="package-card__strap">{{ $package['strap'] }}</p>
    @endif

    @if (!empty($package['included']))
        <ul class="package-card__list ticklist ticklist--yes">
            @foreach ($package['included'] as $line)
                <li>{{ $line }}</li>
            @endforeach
        </ul>
    @endif

    @if (!empty($package['excluded']))
        <ul class="package-card__list package-card__list--not ticklist ticklist--no">
            @foreach ($package['excluded'] as $line)
                <li>{{ $line }}</li>
            @endforeach
        </ul>
    @endif

    <footer class="package-card__foot">
        <p class="package-card__price">{{ \App\Support\Packages::price($package) }}</p>
        <p class="package-card__actions">
            <a class="btn btn--solid" href="{{ url('/packages/' . $package['slug']) }}"><span>see the week</span></a>
            <a class="link-quiet" href="{{ url('/contact') }}"><span>ask about this one</span></a>
        </p>
    </footer>
</article>
