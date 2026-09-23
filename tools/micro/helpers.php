<?php
/**
 * Global helpers for the micro runtime.
 *
 * Every function mirrors a Laravel helper of the same name, which is why the
 * controllers and views can be dropped into a real framework install
 * unchanged. Each definition is guarded so the framework's version always
 * wins if it is loaded first.
 */

namespace {

    use Micro\Kernel;
    use Micro\RedirectResponse;
    use Micro\Response;
    use Micro\ViewRenderer;

    if (!function_exists('e')) {
        function e($value)
        {
            return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
        }
    }

    if (!function_exists('env')) {
        /** env('ASSET_BASE', 'fallback') — reads .env without phpdotenv. */
        function env($key, $default = null)
        {
            static $dotenv = null;

            if ($dotenv === null) {
                $dotenv = [];
                $file = dirname(__DIR__, 2) . '/.env';

                if (is_file($file)) {
                    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                        if ($line[0] === '#' || strpos($line, '=') === false) {
                            continue;
                        }
                        [$k, $v] = explode('=', $line, 2);
                        $dotenv[trim($k)] = trim(trim($v), "\"'");
                    }
                }
            }

            $value = getenv($key);

            if ($value === false || $value === '') {
                $value = $dotenv[$key] ?? null;
            }

            return ($value === null || $value === '') ? $default : $value;
        }
    }

    if (!function_exists('app')) {
        function app()
        {
            return Kernel::$instance;
        }
    }

    if (!function_exists('config')) {
        function config($key = null, $default = null)
        {
            $kernel = Kernel::$instance;

            if (!$kernel) {
                return $default;
            }

            return $key === null ? $kernel->config : $kernel->config($key, $default);
        }
    }

    if (!function_exists('view')) {
        function view($name, array $data = [])
        {
            return new ViewRenderer($name, $data);
        }
    }

    if (!function_exists('request')) {
        function request()
        {
            return Kernel::$instance ? Kernel::$instance->request : null;
        }
    }

    if (!function_exists('old')) {
        function old($key, $default = '')
        {
            $value = request() ? request()->get($key) : null;

            return ($value === null || $value === '') ? $default : $value;
        }
    }

    if (!function_exists('asset')) {
        function asset($path)
        {
            return preg_match('#^https?://#', $path) ? $path : '/' . ltrim($path, '/');
        }
    }

    if (!function_exists('img')) {
        /**
         * Photography helper. Absolute URLs pass through, anything starting
         * with /img/ is read from public/img, everything else gets prefixed
         * with config('site.asset_base') — hot-linked in the shipped clone.
         */
        function img($path)
        {
            if ($path === null || $path === '') {
                return '';
            }

            if (preg_match('#^https?://#', $path)) {
                return $path;
            }

            if (strpos($path, '/img/') === 0) {
                return asset($path);
            }

            return rtrim((string) config('site.asset_base'), '/') . '/' . ltrim($path, '/');
        }
    }

    if (!function_exists('public_path')) {
        function public_path($path = '')
        {
            return dirname(__DIR__, 2) . '/public' . ($path ? '/' . ltrim($path, '/') : '');
        }
    }

    if (!function_exists('storage_path')) {
        function storage_path($path = '')
        {
            return dirname(__DIR__, 2) . '/storage' . ($path ? '/' . ltrim($path, '/') : '');
        }
    }

    if (!function_exists('url')) {
        function url($path = '')
        {
            if ($path === '' || $path === '/') {
                return '/';
            }

            return preg_match('#^https?://#', $path) ? $path : '/' . ltrim($path, '/');
        }
    }

    if (!function_exists('redirect')) {
        function redirect($to = null, $status = 302)
        {
            return $to ? RedirectResponse::to(url($to), $status) : new RedirectResponse();
        }
    }

    if (!function_exists('back')) {
        function back($fallback = '/')
        {
            if (!empty($_SERVER['HTTP_REFERER'])) {
                return RedirectResponse::to($_SERVER['HTTP_REFERER']);
            }

            return RedirectResponse::to(url($fallback));
        }
    }

    if (!function_exists('abort')) {
        function abort($code, $message = '')
        {
            if ((int) $code === 404) {
                throw new \Micro\NotFound($message);
            }

            throw new \Micro\HttpException($code, $message);
        }
    }

    if (!function_exists('response')) {
        function response($body = '', $status = 200, array $headers = [])
        {
            return new Response($body, $status, $headers);
        }
    }

    if (!function_exists('csrf_token')) {
        function csrf_token()
        {
            return 'micro-csrf-token';
        }
    }

    if (!function_exists('csrf_field')) {
        function csrf_field()
        {
            return '<input type="hidden" name="_token" value="' . csrf_token() . '">';
        }
    }

    if (!function_exists('format_date')) {
        /** "2026-07-01" → "1 July 2026"; unparsable input passes through. */
        function format_date($value, $format = 'j F Y')
        {
            $ts = is_numeric($value) ? (int) $value : strtotime((string) $value);

            return $ts ? date($format, $ts) : (string) $value;
        }
    }

    if (!function_exists('str_slug')) {
        function str_slug($value)
        {
            return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $value)), '-');
        }
    }

    if (!function_exists('number_pp')) {
        /** Money formatting for itinerary meta: 19824 → "$19,824". */
        function number_pp($amount)
        {
            if ($amount === null || $amount === '') {
                return '';
            }

            return '$' . number_format((float) $amount);
        }
    }
}
