@extends('layouts.app')

@php $slug = request() ? trim(parse_url(request()->url(), PHP_URL_PATH), '/') : '/stories'; $index = (int) basename($slug); @endphp

@section('content')

    <article class="article">
        <header class="article__head">
            <div class="wrap">
                <p class="eyebrow">{{ $story['kicker'] }}</p>
                <h1 class="display">{{ $story['title'] }}</h1>
                <p class="article__meta">{{ $story['date'] }} · {{ $story['read'] }} read · Fitzroy field notes</p>
            </div>
        </header>

        <figure class="article__hero">
            <img src="{{ img($story['image']) }}" alt="{{ $story['title'] }}" width="1800" height="1000">
        </figure>

        <div class="wrap article__body">
            <p class="lead">{{ $story['excerpt'] }}</p>

            @foreach ($story['body'] as $block)
                @if (isset($block['h']))
                    <h2 class="h2">{{ $block['h'] }}</h2>
                @else
                    <p class="prose">{{ $block['p'] }}</p>
                @endif
            @endforeach

            <p class="article__pull">{{ $story['pull'] }}</p>

            <p class="article__foot">
                <a class="btn" href="{{ url('/contact-us') }}"><span>talk it through</span></a>
                <a class="link-quiet" href="{{ url('/inspiration') }}">Browse sample safaris</a>
            </p>
        </div>
    </article>

    <section class="more-stories">
        <div class="wrap">
            <p class="eyebrow">keep reading</p>
            <ul class="more-stories__grid">
                @php $n = -1; @endphp
                @foreach ($stories as $other)
                    @php $n++; @endphp
                    <li>
                        <a href="{{ url('/stories/' . $n) }}">
                            <span class="more-stories__media"><img src="{{ img($other['image']) }}" alt="{{ $other['title'] }}" loading="lazy" width="900" height="600"></span>
                            <span class="more-stories__title">{{ $other['title'] }}</span>
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>

@endsection
