{{--
    The postcard wall. Real frames from the Drive folder, pinned in a staggered
    grid, each one linking to the trip it was taken on. Deliberately not a
    slider: it is a wall you read down, it needs no JavaScript, and every frame
    is a link rather than decoration.

    $frames rows: ['slug' => white-island, 'i' => 2, 'note' => '…', 'ar' => '4 / 5']
    `ar` is the box the image is cropped to, and it is what holds the layout
    steady while the photograph is still loading.
--}}
<section class="postcards" id="frames">
    <div class="wrap">
        <header class="section-head">
            <p class="eyebrow reveal-up" data-reveal>from the trips themselves</p>
            <h2 class="display display--sm reveal-up" data-reveal>ten frames from the last few weeks</h2>
            <p class="section-head__lede reveal-up" data-reveal>
                Nothing here is stock. Every frame comes out of the folder the guides keep on
                their phones — the same folder the trip pages are built from — so a boat you
                recognise here is a boat you can actually get on.
            </p>
        </header>
    </div>

    <ul class="wrap postcards__wall">
        @foreach ($frames as $frame)
            @php
                $tour = \App\Support\Tours::find($frame['slug']);
                $alt  = \App\Support\Tours::alt($frame['slug'], $frame['i']);
            @endphp
            <li class="postcard reveal" data-reveal>
                <a href="{{ url('/tours/' . $frame['slug']) }}">
                    <span class="postcard__frame" style="--ar: {{ $frame['ar'] }}">
                        <img class="drive-img" src="{{ \App\Support\Tours::img($frame['slug'], $frame['i'], 800) }}"
                             alt="{{ $alt }}" loading="lazy" decoding="async">
                    </span>
                    <span class="postcard__cap">
                        <strong>{{ $tour ? $tour['title'] : $frame['note'] }}</strong>
                        <em>{{ $frame['note'] }}</em>
                    </span>
                </a>
            </li>
        @endforeach
    </ul>

    <div class="wrap">
        <p class="postcards__foot reveal-up" data-reveal>
            <a class="btn" href="{{ url('/tours') }}"><span>every trip, every frame</span></a>
        </p>
    </div>
</section>
