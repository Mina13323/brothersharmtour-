@extends('layouts.app')

@php
    $errors = $errors ?? [];
    $sent   = $sent ?? false;
    $copy   = $copy ?? [];
@endphp

@section('content')

    <section class="contact">
        <div class="wrap contact__grid">
            <div class="contact__intro">
                @include('partials.breadcrumb')

                <p class="eyebrow reveal-up" data-reveal>{{ $hero['eyebrow'] ?? 'start here' }}</p>
                <h1 class="display reveal-up" data-reveal>{{ $hero['title'] ?? 'tell us the day you want' }}</h1>
                <p class="prose reveal-up" data-reveal>
                    {{ $copy['lede'] ?? 'One form, one message or one phone call. Tell us who is coming, roughly when, and what you would hate to miss.' }}
                </p>

                <h2 class="h3">other ways to reach us</h2>
                <address class="contact__details">
                    <p>
                        @foreach ($contact['address_lines'] as $line)
                            <span>{{ $line }}</span>
                        @endforeach
                        @if (!empty($contact['hours']))
                            <span>{{ $contact['hours'] }}</span>
                        @endif
                    </p>
                    <p>
                        @if (!empty($contact['phone']['tel']))
                            <a href="{{ url($contact['phone']['tel']) }}">{{ $contact['phone']['label'] }}</a>
                        @endif
                        @if (!empty($contact['whatsapp']))
                            <a href="https://wa.me/{{ preg_replace('/\D/', '', $contact['whatsapp']) }}" rel="noopener" target="_blank">WhatsApp</a>
                        @endif
                        @if (!empty($contact['email']))
                            <a href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a>
                        @endif
                        @if (empty($contact['phone']['tel']) && empty($contact['email']))
                            <span>This form is the fastest route — it comes straight to the people running the days.</span>
                        @endif
                    </p>
                </address>

                <ul class="assurances assurances--inline reveal-up" data-reveal>
                    @foreach ($contact['assurances'] as $assurance)
                        <li>{{ $assurance }}</li>
                    @endforeach
                </ul>

                <div class="contact__note">
                    <h2 class="h3">how the answer comes back</h2>
                    <p class="prose">
                        A price for the trip as it will actually run on your date — pick-up time, what is on the boat, what to
                        bring, and the private option if you want it. Usually inside the hour between 7am and 11pm, Sharm time.
                    </p>
                </div>
            </div>

            <div class="contact__form">
                <div class="form-card">
                    <p class="form-card__status" data-form-status @if ($sent) data-sent="1" @endif>
                        {{ $sent ? 'Thank you — your enquiry is with the team. We will answer from the same address you wrote to.' : '' }}
                    </p>

                    <form id="enquiry" action="{{ url('/contact') }}" method="post" novalidate data-enquiry-form>
                        @csrf

                        @if (isset($tour) && $tour)
                            <input type="hidden" name="tour" value="{{ $tour['slug'] }}">
                            <p class="form-card__trip">
                                <span>enquiry about</span>
                                <a href="{{ url('/tours/' . $tour['slug']) }}">{{ $tour['title'] }}</a>
                                <em>{{ $tour['duration'] }}</em>
                                <a class="link-quiet" href="{{ url('/contact') }}">change</a>
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
                                        <span data-dial-flag aria-hidden="true">🇪🇬</span>
                                        <span data-dial-code>+20</span>
                                        <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
                                    </button>
                                    <div class="dial__panel" role="listbox" hidden>
                                        <input class="dial__search" type="search" placeholder="Search countries" data-dial-search aria-label="Search countries">
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
                                    <input type="hidden" name="dial" value="+20" data-dial-input>
                                </div>
                            </div>
                            <div>
                                <label for="phone">Phone</label>
                                <input id="phone" name="phone" type="tel" autocomplete="tel" value="{{ old('phone') }}">
                            </div>
                        </div>

                        <div class="field">
                            <label for="tour-select">Which trip?</label>
                            <select id="tour-select" name="tour_choice">
                                <option value="">Not sure yet — help me choose</option>
                                @foreach ($trips as $slug => $label)
                                    <option value="{{ $slug }}" @if (isset($tour) && $tour && $tour['slug'] === $slug) selected @endif>{{ $label }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="field">
                            <label for="travel">Rough dates</label>
                            <input id="travel" name="travel" type="text" placeholder="e.g. 12–19 October, two adults and one child"
                                   value="{{ old('travel') }}">
                        </div>

                        <fieldset class="field">
                            <legend>About your day <i>*</i></legend>
                            <textarea id="message" name="message" rows="6" required
                                      placeholder="Who is travelling, what you most want to see, anything that must be avoided.">{{ old('message', $prefill ?? '') }}</textarea>
                            <p class="field__error">{{ $errors['message'] ?? '' }}</p>
                        </fieldset>

                        <p class="form-card__foot">
                            <button class="btn btn--solid" type="submit"><span>send enquiry</span></button>
                            <small>{{ $copy['private'] ?? 'Your details are used to price and run your trip, and for nothing else.' }}</small>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>

@endsection

@push('scripts')
    <script>window.__formEndpoint = "{{ url('/contact') }}";</script>
@endpush
