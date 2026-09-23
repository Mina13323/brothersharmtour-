<section class="quote reveal" data-reveal>
    <div class="quote__media">
        <img src="{{ img($quote['image']) }}" alt="{{ $quote['badge'] }}" loading="lazy" width="900" height="1100">
        <p class="quote__badge">{{ $quote['badge'] }}</p>
    </div>
    <div class="quote__body">
        <blockquote>
            <p>{{ $quote['text'] }}</p>
        </blockquote>
        <p class="quote__who">{{ $quote['name'] }}</p>
        <p class="quote__role">{{ $quote['role'] }}</p>
    </div>
</section>
