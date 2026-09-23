<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('site.name') }}</title>
    <meta name="description" content="{{ $description ?? config('site.description') }}">
    <meta name="theme-color" content="#101010">

    <meta property="og:site_name" content="{{ config('site.name') }}">
    <meta property="og:title" content="{{ $title ?? config('site.name') }}">
    <meta property="og:description" content="{{ $description ?? config('site.description') }}">
    <meta property="og:type" content="website">
    @if (isset($ogImage))
        <meta property="og:image" content="{{ img($ogImage) }}">
    @endif

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap">
    <link rel="stylesheet" href="{{ asset('css/site.css') }}?v={{ file_exists(public_path('css/site.css')) ? filemtime(public_path('css/site.css')) : 'dev' }}">
    <link rel="icon" href="{{ img('/uploads/2023/09/logo-gray-black.svg') }}" type="image/svg+xml">

    <script>document.documentElement.className += ' js';</script>
</head>
<body class="{{ $bodyClass ?? '' }} header-{{ $headerTheme ?? 'light' }}">
    <div id="fader" class="fader" aria-hidden="true">
        <div class="fader__bar"></div>
        <p class="fader__word">fitzroy</p>
    </div>

    <a class="skip-link" href="#main">Skip to content</a>

    @include('partials.header')

    <main id="main" class="site-main">
        @yield('content')
    </main>

    @include('partials.footer')

    <script src="{{ asset('js/site.js') }}?v={{ file_exists(public_path('js/site.js')) ? filemtime(public_path('js/site.js')) : 'dev' }}" defer></script>
    @stack('scripts')
</body>
</html>
