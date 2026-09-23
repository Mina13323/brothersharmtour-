<section class="steps" id="how-it-works">
    <div class="steps__bg" aria-hidden="true">
        <img src="{{ img($process['background']) }}" alt="" loading="lazy">
    </div>

    <div class="wrap steps__inner">
        <div class="steps__head">
            <p class="eyebrow">{{ $process['eyebrow'] }}</p>
            <p class="steps__lede">{{ $process['lede'] }}</p>
        </div>

        <ol class="steps__list">
            @foreach ($process['steps'] as $index => $step)
                <li class="step reveal" data-reveal>
                    <span class="step__num">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                    <h3>{{ $step['title'] }}</h3>
                    <p>{{ $step['body'] }}</p>
                </li>
            @endforeach
        </ol>

        <figure class="steps__figure">
            <img src="{{ img($process['image']) }}" alt="Activity at {{ $process['credit'] }}" loading="lazy" width="1272" height="1272">
            <figcaption>{{ $process['credit'] }}</figcaption>
        </figure>
    </div>
</section>
