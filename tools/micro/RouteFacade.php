<?php

namespace Micro;

/**
 * Route registry exposed as `Illuminate\Support\Facades\Route` (see
 * public/index.php), so routes/web.php reads like a normal Laravel routes file.
 */
class RouteFacade
{
    public static function get($uri, $action = null)
    {
        return self::register(['GET', 'HEAD'], $uri, $action);
    }

    public static function post($uri, $action = null)
    {
        return self::register(['POST'], $uri, $action);
    }

    public static function any($uri, $action = null)
    {
        return self::register(['GET', 'HEAD', 'POST'], $uri, $action);
    }

    public static function match($methods, $uri, $action = null)
    {
        return self::register((array) $methods, $uri, $action);
    }

    public static function view($uri, $view, array $data = [])
    {
        return self::register(['GET', 'HEAD'], $uri, function () use ($view, $data) {
            return view($view, $data);
        });
    }

    public static function group(array $attributes, $routes)
    {
        $previous = Router::$prefix;
        Router::$prefix = $previous . (isset($attributes['prefix']) ? '/' . trim($attributes['prefix'], '/') : '');

        if (is_string($routes) && is_file($routes)) {
            require $routes;
        } elseif (is_callable($routes)) {
            $routes();
        }

        Router::$prefix = $previous;
    }

    protected static function register(array $methods, $uri, $action)
    {
        if (is_array($uri)) {
            $action = isset($uri['uses']) ? $uri['uses'] : $action;
            $uri = $uri['uri'] ?? '/';
        }

        $pattern = Router::$prefix . '/' . ltrim((string) $uri, '/');
        $pattern = str_replace('//', '/', $pattern);

        Kernel::$instance->router->add($methods, rtrim($pattern, '/') ?: '/', $action);
    }
}
