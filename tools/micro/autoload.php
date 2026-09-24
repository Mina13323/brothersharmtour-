<?php
/**
 * PSR-4 autoloading for the micro runtime (used only when vendor/ is absent).
 */

spl_autoload_register(static function ($class) {
    static $map = [
        'App\\'   => '/app/',
        'Micro\\' => '/tools/micro/',
    ];

    $root = dirname(__DIR__, 2);

    foreach ($map as $prefix => $dir) {
        if (strpos($class, $prefix) !== 0) {
            continue;
        }

        $relative = str_replace('\\', '/', substr($class, strlen($prefix)));

        // App\Http\Controllers\Foo is stored as app/Http/Controllers/Foo.php,
        // and Micro\Bar as tools/micro/Bar.php.
        $file = $root . $dir . $relative . '.php';

        if (is_file($file)) {
            require $file;

            return;
        }
    }
});

require __DIR__ . '/micro.php';
require __DIR__ . '/helpers.php';
require __DIR__ . '/RouteFacade.php';
