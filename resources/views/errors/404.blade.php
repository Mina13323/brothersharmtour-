@extends('layouts.app')

@section('content')

    <section class="missing">
        <div class="wrap missing__inner">
            <p class="eyebrow">404 · lost the trail</p>
            <h1 class="display">nothing out here</h1>
            <p class="prose">
                That page has moved or never existed. The destinations below are all real, and so is the phone number.
            </p>

            <ul class="missing__links">
                @foreach (($destinations ?? []) as $destination)
                    <li><a href="{{ url('/' . $destination['slug']) }}">{{ $destination['name'] }}</a></li>
                @endforeach
            </ul>

            <p class="missing__actions">
                <a class="btn" href="{{ url('/') }}"><span>back home</span></a>
                <a class="btn btn--ghost" href="{{ url('/contact-us') }}"><span>contact us</span></a>
            </p>
        </div>
    </section>

@endsection
