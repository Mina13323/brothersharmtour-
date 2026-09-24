{{-- Grid of trips. Pass $tours to choose the rows; defaults to the featured six. --}}
@php
    $tours   = !empty($tours) ? $tours : \App\Support\Tours::featured(6);
    $total   = count($tours);
    $heading = $heading ?? 'the trips, as we run them';
    $eyebrow = $eyebrow ?? 'day trips out of sharm el-sheikh';
    $lede    = $lede ?? 'Reef boats and sandbars, quads and camels in the foothills, dolphins for the children, the canyon over the mountains, and the transfers that join it all up. Every price is per person and every day starts at your hotel gate.';
@endphp

<section class="itn tours-band" id="day-trips">
    <div class="wrap">
        <header class="section-head">
            <p class="eyebrow">{{ $eyebrow }}</p>
            <h2 class="display">{{ $heading }}</h2>
            <p class="section-head__lede">{{ $lede }}</p>
        </header>
    </div>

    <div class="itn__grid">
        @foreach ($tours as $index => $item)
            @include('partials.tour-card', [
                'item'  => $item,
                'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                'total' => str_pad((string) $total, 2, '0', STR_PAD_LEFT),
            ])
        @endforeach
    </div>

    @if (empty($hideLink))
        <div class="wrap">
            <p class="itn__more">
                <a class="btn" href="{{ url('/tours') }}"><span>all {{ count(\App\Support\Tours::all()) }} trips</span></a>
                <a class="btn btn--ghost" href="{{ url('/films') }}"><span>watch the films</span></a>
            </p>
        </div>
    @endif
</section>
