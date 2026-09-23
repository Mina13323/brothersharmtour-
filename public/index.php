<?php
/**
 * Front controller.
 *
 * Two modes, one set of files:
 *
 *  1. `composer install` has been run  → the real Laravel HTTP kernel handles
 *     the request (bootstrap/app.php), using the same routes/ and views/.
 *  2. no vendor/ directory             → the bundled micro runtime boots, so
 *     `php -S localhost:8000 -t public` is enough to see the site.
 */

$root = dirname(__DIR__);

// Serve static assets directly under `php -S`.
if (PHP_SAPI === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($path !== '/' && is_file($root . '/public' . $path)) {
        return false;
    }
}

if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';

    $app = require $root . '/bootstrap/app.php';

    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

    $request  = Illuminate\Http\Request::capture();
    $response = $kernel->handle($request);

    $response->send();

    $kernel->terminate($request, $response);

    return;
}

require $root . '/tools/micro/autoload.php';

$collectHeaders = static function () {
    if (function_exists('getallheaders')) {
        $out = [];
        foreach (getallheaders() as $name => $value) {
            $out[strtolower($name)] = $value;
        }

        return $out;
    }

    $out = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $out[strtolower(str_replace('_', '-', substr($key, 5)))] = $value;
        }
    }

    return $out;
};

$kernel = new Micro\Kernel($root, [
    // Set VIEW_CACHE=1 to compile Blade into storage/framework/views.
    'view_cache' => (bool) (getenv('VIEW_CACHE') ?: 0),
]);

$kernel->handle(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $_SERVER['REQUEST_URI'] ?? '/',
    $_GET,
    $_POST,
    $collectHeaders()
)->send();
