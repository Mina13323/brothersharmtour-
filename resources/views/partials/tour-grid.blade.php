{{-- Homepage band: the excursions from the Drive folder. --}}
@php $tours = \App\Support\Tours::featured(6); @endphp

<section class="itn tours-band" id="day-trips">
    <div class="wrap">
        <header class="section-head">
            <p class="eyebrow">sharm el-sheikh day trips</p>
            <h2 class="display">the water, the desert, and one very long day in Cairo</h2>
            <p class="section-head__lede">
                {{ count(\App\Support\Tours::all()) }} trips we run ourselves or with people we know by name — reef boats and
                sandbars, quads and camels in the foothills, dolphins, canyons, and the transfers that join it all up.
                Photographed by our own guides, not bought from a library.
            </p>
        </header>
    </div>

    <div class="itn__grid">
        @php $total = count($tours); @endphp
        @foreach ($tours as $index => $item)
            @include('partials.tour-card', [
                'item'  => $item,
                'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                'total' => str_pad((string) $total, 2, '0', STR_PAD_LEFT),
            ])
        @endforeach
    </div>

    <div class="wrap">
        <p class="itn__more">
            <a class="btn" href="{{ url('/tours') }}"><span>all {{ count(\App\Support\Tours::all()) }} trips</span></a>
            <a class="btn btn--ghost" href="{{ url('/films') }}"><span>watch the films</span></a>
        </p>
    </div>
</section>
