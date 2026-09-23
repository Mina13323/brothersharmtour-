@extends('layouts.app')

@section('content')

    <section class="member">
        <div class="wrap member__grid">
            <figure class="member__media">
                <img src="{{ img($member['image']) }}" alt="{{ $member['name'] }}" width="800" height="1000">
            </figure>
            <div class="member__body">
                <p class="eyebrow">{{ $member['role'] }}</p>
                <h1 class="display">{{ $member['name'] }}</h1>
                <p class="lead">{{ $member['blurb'] }}</p>
                @foreach ($member['bio'] as $paragraph)
                    <p class="prose">{{ $paragraph }}</p>
                @endforeach
                <p class="member__actions">
                    <a class="btn" href="{{ url('/contact-us') }}"><span>talk to the team</span></a>
                    <a class="link-quiet" href="{{ url('/about-us') }}">Back to about us</a>
                </p>
            </div>
        </div>
    </section>

    <section class="team team--strip">
        <div class="wrap">
            <p class="eyebrow">also on the team</p>
            <ul class="team__grid team__grid--small">
                @foreach ($team as $other)
                    @if ($other['slug'] !== $member['slug'])
                        <li class="team__item">
                            <a href="{{ url('/about-us/team/' . $other['slug']) }}">
                                <span class="team__media">
                                    <img src="{{ img($other['image']) }}" alt="{{ $other['name'] }}" loading="lazy" width="600" height="750">
                                </span>
                                <span class="team__role">{{ $other['role'] }}</span>
                                <span class="team__name">{{ $other['name'] }}</span>
                            </a>
                        </li>
                    @endif
                @endforeach
            </ul>
        </div>
    </section>

@endsection
