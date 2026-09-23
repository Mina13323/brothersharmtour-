@extends('layouts.app')

@section('content')

    <section class="legal">
        <div class="wrap legal__grid">
            <aside class="legal__aside">
                <p class="eyebrow">the small print</p>
                <nav class="legal__nav" aria-label="Policies">
                    <ul>
                        @foreach (config('site.footer_nav.Legal') as $link)
                            <li><a class="{{ rtrim(url($link['url']), '/') === url('/' . $slug) ? 'is-active' : '' }}" href="{{ url($link['url']) }}">{{ $link['label'] }}</a></li>
                        @endforeach
                    </ul>
                </nav>
            </aside>

            <article class="legal__body">
                <h1 class="display">{{ $page['title'] }}</h1>
                <p class="lead">{{ $page['lede'] }}</p>
                @foreach ($page['body'] as $paragraph)
                    <p class="prose">{{ $paragraph }}</p>
                @endforeach

                <p class="legal__note">
                    This page is placeholder language written for the template. Replace it with your own reviewed policy before
                    publishing anything commercially.
                </p>
            </article>
        </div>
    </section>

@endsection
