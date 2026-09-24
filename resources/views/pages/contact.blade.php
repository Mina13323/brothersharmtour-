@extends('layouts.app')

@php
    $errors = $errors ?? [];
    $sent   = $sent ?? false;
@endphp

@section('content')

    <section class="contact">
        <div class="wrap contact__grid">
            <div class="contact__intro">
                <p class="eyebrow reveal-up" data-reveal>{{ $hero['eyebrow'] ?? 'start the conversation' }}</p>
                <h1 class="display reveal-up" data-reveal>{{ $hero['title'] ?? 'contact us' }}</h1>
                <p class="prose reveal-up" data-reveal>
                    The quickest way to plan is a phone call, not an email thread. Leave your details and someone who has stayed at
                    the camps will ring you — usually the same day, always without a call centre in between.
                </p>

                <h2 class="h3">our contact details</h2>
                <p class="prose">Prefer to reach us immediately? These work.</p>
                <address class="contact__details">
                    <p>
                        @foreach ($contact['address_lines'] as $line)
                            <span>{{ $line }}</span>
                        @endforeach
                    </p>
                    <p>
                        <a href="{{ url($contact['phone_uk']['tel']) }}">UK: {{ $contact['phone_uk']['label'] }}</a>
                        <a href="{{ url($contact['phone_us']['tel']) }}">USA: {{ $contact['phone_us']['label'] }}</a>
                        <a href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a>
                    </p>
                </address>

                <a class="reviews reviews--inline" href="{{ $contact['reviews']['url'] }}" rel="noopener" target="_blank">
                    <span class="reviews__stars" aria-hidden="true">★★★★★</span>
                    <span class="reviews__label">{{ $contact['reviews']['label'] }}</span>
                </a>

                <div class="contact__note">
                    <h2 class="h3">our approach</h2>
                    <p class="prose">
                        No two journeys should be the same, which is why we do not take enquiries by email alone. Designing a
                        bespoke itinerary needs a proper conversation: what you want to see, who is coming, and what would spoil it.
                    </p>
                </div>
            </div>

            <div class="contact__form">
                <div class="form-card">
                    <p class="form-card__status" data-form-status @if ($sent) data-sent="1" @endif>
                        {{ $sent ? 'Thank you — your enquiry is with the team. We will be in touch shortly.' : '' }}
                    </p>

                    <form id="enquiry" action="{{ url('/contact-us') }}" method="post" novalidate data-enquiry-form>
                        @csrf

                        @if (isset($tour) && $tour)
                            <input type="hidden" name="tour" value="{{ $tour['slug'] }}">
                            <p class="form-card__trip">
                                <span>enquiry about</span>
                                <a href="{{ url('/tours/' . $tour['slug']) }}">{{ $tour['title'] }}</a>
                                <em>{{ $tour['duration'] }}</em>
                                <a class="link-quiet" href="{{ url('/contact-us') }}">change</a>
                            </p>
                        @endif

                        <div class="field">
                            <label for="name">Your name <i>*</i></label>
                            <input id="name" name="name" type="text" autocomplete="name" required
                                   value="{{ old('name') }}"
                                   data-error="{{ $errors['name'] ?? '' }}">
                            <p class="field__error">{{ $errors['name'] ?? '' }}</p>
                        </div>

                        <div class="field">
                            <label for="email">Email <i>*</i></label>
                            <input id="email" name="email" type="email" autocomplete="email" required
                                   value="{{ old('email') }}"
                                   data-error="{{ $errors['email'] ?? '' }}">
                            <p class="field__error">{{ $errors['email'] ?? '' }}</p>
                        </div>

                        <div class="field field--split">
                            <div>
                                <label for="dial">Country code</label>
                                <div class="dial" data-dial>
                                    <button class="dial__button" type="button" aria-haspopup="listbox" aria-expanded="false">
                                        <span data-dial-flag aria-hidden="true">🇬🇧</span>
                                        <span data-dial-code>+44</span>
                                        <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                                    </button>
                                    <div class="dial__panel" role="listbox" hidden>
                                        <input class="dial__search" type="search" placeholder="Search 244 countries" data-dial-search aria-label="Search countries">
                                        <ul class="dial__options" data-dial-options>
                                            @foreach ($dialCodes as $option)
                                                <li role="option">
                                                    <button type="button" data-code="{{ $option['code'] }}" data-name="{{ $option['name'] }}">
                                                        <span>{{ $option['name'] }}</span><em>{{ $option['code'] }}</em>
                                                    </button>
                                                </li>
                                            @endforeach
                                        </ul>
                                        <p class="dial__empty" hidden>No results</p>
                                    </div>
                                    <input type="hidden" name="dial" value="+44" data-dial-input>
                                </div>
                            </div>
                            <div>
                                <label for="phone">Phone</label>
                                <input id="phone" name="phone" type="tel" autocomplete="tel" value="{{ old('phone') }}">
                            </div>
                        </div>

                        <div class="field">
                            <label for="country">Where are you thinking of going?</label>
                            <select id="country" name="country">
                                <option value="">No preference yet</option>
                                @foreach ($interests as $option)
                                    <option value="{{ $option }}">{{ $option }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="field">
                            <label for="travel">Rough dates</label>
                            <input id="travel" name="travel" type="text" placeholder="e.g. August 2027, 12 nights, two adults"
                                   value="{{ old('travel') }}">
                        </div>

                        <fieldset class="field">
                            <legend>About your trip <i>*</i></legend>
                            <textarea id="message" name="message" rows="6" required
                                      placeholder="Who is travelling, what you most want to see, anything that must be avoided.">{{ old('message', $prefill ?? '') }}</textarea>
                            <p class="field__error">{{ $errors['message'] ?? '' }}</p>
                        </fieldset>

                        <p class="form-card__foot">
                            <button class="btn btn--solid" type="submit"><span>send enquiry</span></button>
                            <small>Your details are kept private and never shared.</small>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>

    @include('partials.quote', ['quote' => $quote])

@endsection

@push('scripts')
    <script>window.__formEndpoint = "{{ url('/contact-us') }}";</script>
@endpush
