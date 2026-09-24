{{-- One excursion in a grid. $item = a row from App\Support\Tours::all(). --}}
@php
    $cover    = isset($item['gallery'][0]) ? $item['gallery'][0] : (isset($item['video'][0]) ? $item['video'][0] : null);
    $hasFilm  = !empty($item['video']);
    $catLabel = isset(\App\Support\Tours::CATEGORIES[$item['category']]) ? \App\Support\Tours::CATEGORIES[$item['category']] : '';
    $alt      = \App\Support\Tours::alt($item['slug'], 0);
@endphp

<article class="tour-card">
    <a class="tour-card__media" data-media data-badge="view trip" href="{{ url('/tours/' . $item['slug']) }}" tabindex="-1" aria-hidden="true">
        <span class="tour-card__blank" aria-hidden="true">
            <span class="tour-card__blank-word">{{ $item['title'] }}</span>
        </span>
        @if ($cover)
            <img class="drive-img" src="{{ \App\Support\Drive::img($cover, 900, $item['folder']) }}"
                 alt="{{ $alt }}" loading="lazy" width="900" height="700">
        @endif

        @if ($hasFilm)
            <span class="tour-card__flag">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                film
            </span>
        @endif

        <span class="tour-card__view">view trip</span>
    </a>

    @if (isset($count) && isset($total))
        <p class="tour-card__count"><span>{{ $count }}</span> of {{ $total }}</p>
    @endif

    <p class="tour-card__cat">{{ $catLabel }}</p>

    <h3 class="tour-card__title">
        <a href="{{ url('/tours/' . $item['slug']) }}">{{ $item['title'] }}</a>
    </h3>

    <p class="tour-card__strap">{{ $item['strap'] }}</p>

    <ul class="tour-meta">
        <li>{{ $item['duration'] }}</li>
        <li>{{ \App\Support\Tours::price($item) }}</li>
    </ul>

    <p class="tour-card__foot">
        <a class="btn btn--sm btn--ghost" href="{{ url('/tours/' . $item['slug']) }}"><span>view trip</span></a>
        <a class="link-quiet" href="{{ url('/contact?tour=' . $item['slug']) }}">ask about it</a>
    </p>
</article>
