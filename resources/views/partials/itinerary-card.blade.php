<article class="itn-card">
    <a class="itn-card__media" href="{{ url('/sample-itineraries/' . $item['slug']) }}" tabindex="-1" aria-hidden="true">
        <img src="{{ img($item['image']) }}" alt="{{ $item['country'] }}: {{ $item['title'] }}" loading="lazy" width="850" height="850">
        <span class="itn-card__view">view</span>
    </a>
    <p class="itn-card__count"><span>{{ $count }}</span> of {{ $total }}</p>
    <h3 class="itn-card__title">
        <a href="{{ url('/sample-itineraries/' . $item['slug']) }}">{{ $item['country'] }}: {{ $item['title'] }}</a>
    </h3>
    <p class="itn-card__summary">{{ $item['summary'] }}</p>
    <ul class="itn-meta">
        <li>{{ $item['style'] }}</li>
        <li>From {{ $item['price'] }}</li>
        <li>{{ $item['guests'] }} guests</li>
        <li>{{ $item['nights'] }} nights</li>
    </ul>
    <p class="itn-card__foot">
        <a class="btn btn--sm btn--ghost" href="{{ url('/sample-itineraries/' . $item['slug']) }}"><span>view safari</span></a>
    </p>
</article>
