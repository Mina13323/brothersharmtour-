<section class="itn" id="inspiration">
    <div class="wrap">
        <header class="section-head">
            <p class="eyebrow">looking for inspiration?</p>
            <h2 class="display">sample journeys</h2>
            <p class="section-head__lede">
                A dozen nights in the north, ten across the land of a thousand hills, one hundred and forty kilometres of
                floodplain on foot — starting points rather than fixed packages.
            </p>
        </header>
    </div>

    <div class="itn__grid">
        @php $total = count($itineraries); @endphp
        @foreach ($itineraries as $index => $item)
            @include('partials.itinerary-card', [
                'item'  => $item,
                'count' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                'total' => str_pad((string) $total, 2, '0', STR_PAD_LEFT),
            ])
        @endforeach
    </div>

    <div class="wrap">
        <p class="itn__more">
            <a class="btn" href="{{ url('/inspiration') }}"><span>browse all safaris</span></a>
        </p>
    </div>
</section>
