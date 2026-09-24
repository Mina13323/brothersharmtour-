<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ $seoTitle ?? ($title ?? config('site.name')) }}</title>
    <meta name="description" content="{{ $description ?? config('site.description') }}">
    <meta name="theme-color" content="#101010">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    @if (isset($noindex))
        <meta name="robots" content="noindex, follow">
    @endif

    <link rel="canonical" href="{{ $canonical ?? url('/') }}">
    <link rel="alternate" hreflang="x-default" href="{{ $canonical ?? url('/') }}">
    <link rel="sitemap" type="application/xml" href="{{ url('/sitemap.xml') }}">
    <link rel="alternate" type="application/rss+xml" title="{{ config('site.name') }} guides" href="{{ url('/guides') }}">

    @php
        $ogImage = isset($ogImage) && $ogImage ? $ogImage : \App\Support\Site::hero()['image'];
        $ogType  = isset($ogType) ? $ogType : 'website';
        $brand   = config('site.name');
    @endphp

    <meta property="og:site_name" content="{{ $brand }}">
    <meta property="og:type" content="{{ $ogType }}">
    <meta property="og:locale" content="en">
    <meta property="og:title" content="{{ $seoTitle ?? ($title ?? $brand) }}">
    <meta property="og:description" content="{{ $description ?? config('site.description') }}">
    <meta property="og:url" content="{{ $canonical ?? url('/') }}">
    <meta property="og:image" content="{{ $ogImage }}">
    <meta property="og:image:alt" content="{{ $ogImageAlt ?? 'Sharm el-Sheikh reef and desert trips' }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="800">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seoTitle ?? ($title ?? $brand) }}">
    <meta name="twitter:description" content="{{ $description ?? config('site.description') }}">
    <meta name="twitter:image" content="{{ $ogImage }}">
    @if (config('site.twitter'))
        <meta name="twitter:site" content="{{ config('site.twitter') }}">
    @endif

    <link rel="icon" href="{{ asset('img/favicon.svg') }}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="{{ asset('img/favicon.svg') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://drive.google.com" crossorigin>
    <link rel="dns-prefetch" href="https://apis.google.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap">
    <link rel="stylesheet" href="{{ asset('css/site.css') }}?v={{ file_exists(public_path('css/site.css')) ? filemtime(public_path('css/site.css')) : 'dev' }}">

    @php $preload = $hero['image'] ?? ($heroImage ?? null); @endphp
    @if ($preload)
        <link rel="preload" as="image" href="{{ img($preload) }}" fetchpriority="high">
    @endif

    @if (!empty($jsonLd))
        <script type="application/ld+json">{!! \App\Support\Seo::json($jsonLd) !!}</script>
    @endif

    <script>
        document.documentElement.className += ' js';
        /* If the deferred script never runs — blocked, offline, a 404 on this
           host — the curtain must still come up and the revealed content must
           still show. Three seconds, then the CSS takes over. */
        setTimeout(function () {
            document.documentElement.className += ' force-show';
            if (document.body) { document.body.classList.add('loaded'); }
        }, 3000);
    </script>
</head>
<body class="{{ $bodyClass ?? '' }} header-{{ $headerTheme ?? 'light' }}">
    <div id="fader" class="fader" aria-hidden="true">
        <div class="fader__bar"></div>
        <p class="fader__word">{{ strtolower(config('site.logo_word')) }}</p>
    </div>

    <a class="skip-link" href="#main">Skip to content</a>

    @include('partials.header')

    <main id="main" class="site-main">
        @include('partials.breadcrumb')
        @yield('content')
    </main>

    @include('partials.footer')

    <script src="{{ asset('js/site.js') }}?v={{ file_exists(public_path('js/site.js')) ? filemtime(public_path('js/site.js')) : 'dev' }}" defer></script>
    @stack('scripts')
</body>
</html>
