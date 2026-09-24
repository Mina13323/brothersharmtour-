@extends('layouts.app')

@section('content')

    <section class="missing">
        <div class="wrap missing__inner">
            <p class="eyebrow">404 · wrong heading</p>
            <h1 class="display">nothing here but sea</h1>
            <p class="prose">
                That page has moved or never existed. The trips below are all real, and so is the person who will answer your
                message.
            </p>

            <ul class="missing__links">
                @foreach (($tours ?? []) as $tour)
                    <li><a href="{{ url('/tours/' . $tour['slug']) }}">{{ $tour['title'] }}</a></li>
                @endforeach
            </ul>

            <p class="missing__actions">
                <a class="btn" href="{{ url('/') }}"><span>back home</span></a>
                <a class="btn btn--ghost" href="{{ url('/tours') }}"><span>all day trips</span></a>
                <a class="btn btn--ghost" href="{{ url('/contact') }}"><span>contact us</span></a>
            </p>
        </div>
    </section>

@endsection
