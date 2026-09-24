@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="films">
        <div class="wrap">
            <header class="section-head">
                <p class="eyebrow">{{ count($films['video']) }} clips</p>
                <h2 class="display">shot on the trips</h2>
                <p class="section-head__lede">
                    Nothing here was filmed for a catalogue. It came off the boats, the quads and the back seats of the cars,
                    and it is the closest thing this site has to showing you what a day actually looks like.
                </p>
            </header>
        </div>

        <div class="wrap films__grid">
            @foreach ($films['video'] as $clip)
                <figure class="film">
                    <div class="film__frame">
                        <iframe src="{{ $clip['embed'] }}" title="Sharm el-Sheikh trip film" loading="lazy"
                                allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>
                    </div>
                    <figcaption class="film__cap">
                        <span>{{ $clip['name'] ?: 'Trip film' }}</span>
                        <a class="link-quiet" href="{{ $clip['file'] }}" target="_blank" rel="noopener">open file</a>
                    </figcaption>
                </figure>
            @endforeach
        </div>
    </section>

    @if (count($films['gallery']))
        <section class="gallery" data-gallery>
            <div class="gallery__strip" data-gallery-strip>
                @foreach ($films['gallery'] as $index => $shot)
                    <figure class="gallery__frame">
                        <img class="drive-img" src="{{ $shot['src'] }}" alt="Sharm el-Sheikh — {{ $shot['alt'] }}"
                             width="1350" height="900" loading="{{ $index < 3 ? 'eager' : 'lazy' }}">
                    </figure>
                @endforeach
            </div>
            <div class="wrap gallery__bar">
                <p class="gallery__count"><span data-gallery-index>01</span> <i>/</i> {{ str_pad((string) count($films['gallery']), 2, '0', STR_PAD_LEFT) }}</p>
                <p class="gallery__hint">stills from the same folder</p>
            </div>
        </section>
    @endif

    @include('partials.cta-band', [
        'heading' => 'pick a day, we will fill it',
        'text'    => 'Every trip on this site has a page with the practical detail on it — how long, what you get, and what to bring.',
    ])

@endsection
