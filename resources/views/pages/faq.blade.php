@extends('layouts.app')

@section('content')

    @include('partials.page-hero', ['hero' => $hero])

    <section class="faq-strip faq-strip--page">
        <div class="wrap">
            <dl class="faq-list faq-list--open">
                @foreach ($faq as $item)
                    <div class="faq-item">
                        <dt>{{ $item['q'] }}</dt>
                        <dd>{{ $item['a'] }}</dd>
                    </div>
                @endforeach
            </dl>

            <div class="faq-foot">
                <p class="prose">Anything not covered here: send it as a message and you will get an answer from a person, usually inside the hour.</p>
                <p><a class="btn" href="{{ url('/contact') }}"><span>ask a question</span></a></p>
            </div>
        </div>
    </section>

@endsection
