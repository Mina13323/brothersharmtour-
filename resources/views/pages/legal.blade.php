@extends('layouts.app')

@section('content')

    <section class="legal">
        <div class="wrap legal__grid">
            <nav class="legal__nav" aria-label="Policies">
                <p class="eyebrow">the paperwork</p>
                <ul>
                    @foreach ($pages as $slug => $item)
                        <li>
                            <a class="{{ $item['title'] === $page['title'] ? 'is-current' : '' }}" href="{{ url('/' . $slug) }}">{{ $item['title'] }}</a>
                        </li>
                    @endforeach
                </ul>
                <p class="legal__note">
                    Updated {{ $page['updated'] }}. These pages are the operating terms for the trips listed on this site; ask
                    before you book if anything needs spelling out for your group.
                </p>
            </nav>

            <article class="legal__body">
                @include('partials.breadcrumb')

                <h1 class="display">{{ $page['title'] }}</h1>
                @foreach ($page['blocks'] as $block)
                    <h2 class="h2">{{ $block['h'] }}</h2>
                    @foreach ($block['p'] as $paragraph)
                        <p class="prose">{{ $paragraph }}</p>
                    @endforeach
                @endforeach
            </article>
        </div>
    </section>

@endsection
