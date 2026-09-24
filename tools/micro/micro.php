<?php
/**
 * micro — a deliberately small runtime so this project boots with `php -S`
 * before anyone runs `composer install`.
 *
 * It implements only the slice of Laravel's HTTP surface this app uses: a Route
 * registry, a Blade-subset view compiler, Request/Response objects, and the
 * Kernel that wires them together. Everything here exists to be *shadowed* by
 * the real framework: once vendor/autoload.php is present, public/index.php
 * hands the request to Laravel and this file is never loaded.
 */

namespace Micro;

/** Thrown by abort(404); rendered as the site 404 page. */
class NotFound extends \RuntimeException
{
    public function __construct($message = 'Not found')
    {
        parent::__construct($message, 404);
    }
}

/** Thrown by abort(n) for any other status. */
class HttpException extends \RuntimeException
{
    public function __construct($code = 500, $message = '')
    {
        parent::__construct($message ?: ('HTTP ' . $code), (int) $code);
    }
}

class Request
{
    public $method;
    public $path;
    public $query = [];
    public $input = [];
    public $headers = [];

    public function __construct($method, $uri, array $query = [], array $input = [], array $headers = [])
    {
        $this->method  = strtoupper($method);
        $parts         = parse_url($uri);
        $this->path    = '/' . trim($parts['path'] ?? '/', '/');
        $this->query   = $query;
        $this->input   = $input;
        $this->headers = $headers;
    }

    public function all()
    {
        return $this->input + $this->query;
    }

    public function get($key, $default = null)
    {
        $all = $this->all();

        return array_key_exists($key, $all) ? $all[$key] : $default;
    }

    public function has($key)
    {
        $all = $this->all();

        return isset($all[$key]) && trim((string) $all[$key]) !== '';
    }

    public function wantsJson()
    {
        return isset($this->headers['accept']) && strpos($this->headers['accept'], 'json') !== false;
    }

    public function url()
    {
        return $this->path;
    }
}

class Response
{
    public $status = 200;
    public $headers = [];
    public $body = '';

    public function __construct($body = '', $status = 200, array $headers = [])
    {
        $this->body    = (string) $body;
        $this->status  = (int) $status;
        $this->headers = $headers;
    }

    public function header($name, $value)
    {
        $this->headers[$name] = $value;

        return $this;
    }

    public function send()
    {
        if (!headers_sent()) {
            if (function_exists('http_response_code')) {
                http_response_code($this->status);
            }
            foreach ($this->headers as $name => $value) {
                header($name . ': ' . $value, true);
            }
        }

        echo $this->body;
    }
}

class RedirectResponse extends Response
{
    public static function to($url, $status = 302)
    {
        $response = new self('', $status);

        return $response->header('Location', $url);
    }
}

class Router
{
    public $routes = [];

    /** Current Route::group() prefix, maintained by RouteFacade. */
    public static $prefix = '';

    public function add($methods, $pattern, $action)
    {
        $this->routes[] = [
            'methods' => (array) $methods,
            'pattern' => $pattern,
            'regex'   => $this->toRegex($pattern),
            'action'  => $action,
        ];
    }

    protected function toRegex($pattern)
    {
        $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function ($m) {
            return '(?P<' . $m[1] . '>[^/]+)';
        }, $pattern);

        return '#^' . rtrim($regex, '/') . '/?$#';
    }

    public function match(Request $request)
    {
        $path = rtrim($request->path, '/') ?: '/';

        foreach ($this->routes as $route) {
            if (preg_match($route['regex'], $path, $m) && in_array($request->method, $route['methods'], true)) {
                $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);

                return [$route, array_values($params)];
            }
        }

        return null;
    }
}

/**
 * Compiles a Blade subset to plain PHP. Supported:
 * @extends @section @endsection @show @yield @include @if @elseif @else @endif
 * @foreach @endforeach @for @endfor @while @endwhile @php @endphp {{ }} {!! !!}
 * @json @csrf @method @stack @push @endpush @verbatim
 */
class Blade
{
    protected static $protected = [];

    public static function compile($source)
    {
        $source = self::shield($source);

        $source = preg_replace('/\{\{--.*?--\}\}/s', '', $source);

        $source = self::scan($source);
        $source = self::closeDirectives($source);

        $source = preg_replace('/\{!!\s*(.+?)\s*!!\}/s', '<?php echo $1; ?>', $source);

        $source = preg_replace_callback('/\{\{\s*(.+?)\s*\}\}/s', function ($m) {
            return '<?php echo e(' . $m[1] . '); ?>';
        }, $source);

        return self::restore($source);
    }

    /** Hide @verbatim blocks (and raw @ signs) from the compiler. */
    protected static function shield($source)
    {
        self::$protected = [];

        return preg_replace_callback('/@verbatim(.*?)@endverbatim/s', function ($m) {
            $key = '@@SHIELD' . count(self::$protected) . '@@';
            self::$protected[$key] = $m[1];

            return $key;
        }, $source);
    }

    protected static function restore($source)
    {
        foreach (self::$protected as $key => $content) {
            $source = str_replace($key, $content, $source);
        }

        return $source;
    }

    /**
     * Walk the template, replacing every @directive (with balanced-paren
     * arguments, so @if(count($x) > 0) works) with PHP.
     */
    protected static function scan($source)
    {
        $inline = [
            'if'      => '<?php if (%s): ?>',
            'elseif'  => '<?php elseif (%s): ?>',
            'foreach' => '<?php foreach (%s): ?>',
            'for'     => '<?php for (%s): ?>',
            'while'   => '<?php while (%s): ?>',
        ];

        $out = '';
        $i = 0;
        $len = strlen($source);

        while ($i < $len) {
            $at = strpos($source, '@', $i);

            if ($at === false) {
                $out .= substr($source, $i);
                break;
            }

            $out .= substr($source, $i, $at - $i);

            // Anchor the match to the "@" we just found: preg_match with an
            // offset is allowed to skip ahead, which would swallow real HTML.
            if (!preg_match('/@([a-zA-Z_][a-zA-Z0-9_]*)/', $source, $m, PREG_OFFSET_CAPTURE, $at) || $m[0][1] !== $at) {
                $out .= '@';
                $i = $at + 1;
                continue;
            }

            $m[0] = $m[0][0];
            $m[1] = $m[1][0];

            $name      = $m[1];
            $afterName = $at + strlen($m[0]);
            $cursor    = $afterName;
            $args      = null;
            $hasArgs   = false;

            // Blade tolerates a space before the argument list: @if ($x)
            while ($cursor < $len && ($source[$cursor] === ' ' || $source[$cursor] === "\t")) {
                $cursor++;
            }

            if ($cursor < $len && $source[$cursor] === '(') {
                $end = self::matchParens($source, $cursor);
                if ($end !== null) {
                    $args = trim(substr($source, $cursor + 1, $end - $cursor - 1));
                    $hasArgs = true;
                    $cursor = $end + 1;
                }
            }

            $compiled = self::emit($name, $args, $hasArgs, $inline);

            if ($compiled === null) {
                // Unknown @word: leave the source alone.
                $compiled = substr($source, $at, $afterName - $at);
                $cursor = $afterName;
            }

            $out .= $compiled;
            $i = $cursor;
        }

        return $out;
    }

    /** Index of the paren that closes the one at $open, or null. */
    protected static function matchParens($source, $open)
    {
        $depth = 0;
        $quote = null;
        $len = strlen($source);

        for ($i = $open; $i < $len; $i++) {
            $c = $source[$i];

            if ($quote !== null) {
                if ($c === '\\') {
                    $i++;
                } elseif ($c === $quote) {
                    $quote = null;
                }
                continue;
            }

            if ($c === '"' || $c === "'") {
                $quote = $c;
            } elseif ($c === '(') {
                $depth++;
            } elseif ($c === ')') {
                if (--$depth === 0) {
                    return $i;
                }
            }
        }

        return null;
    }

    protected static function emit($name, $args, $hasArgs, array $inline)
    {
        if (isset($inline[$name])) {
            return $hasArgs ? sprintf($inline[$name], $args) : null;
        }

        $parts = $hasArgs ? self::splitArgs($args) : [];

        switch ($name) {
            case 'extends':
                return sprintf('<?php $__env->setExtends(%s); ?>', $parts[0]);
            case 'section':
                if (count($parts) >= 2) {
                    return sprintf('<?php $__env->setSection(%s, %s); ?>', $parts[0], $parts[1]);
                }

                return sprintf('<?php $__env->startSection(%s); ?>', $parts[0] ?? "''");
            case 'endsection':
            case 'stop':
            case 'show':
            case 'overwrite':
                return '<?php $__env->stopSection(); ?>';
            case 'yield':
                return sprintf(
                    '<?php echo $__env->yieldSection(%s, %s); ?>',
                    $parts[0] ?? "''",
                    $parts[1] ?? "''"
                );
            case 'include':
            case 'includeIf':
            case 'includeWhen':
                $data = $parts[1] ?? '[]';

                return sprintf(
                    '<?php echo $__env->make(%s, array_merge($__data ?? [], (array) %s)); ?>',
                    $parts[0] ?? "''",
                    $data
                );
            case 'push':
                return sprintf('<?php $__env->startSection("stack:" . %s); ?>', $parts[0] ?? "''");
            case 'endpush':
                return '<?php $__env->stopSection(); ?>';
            case 'stack':
                return sprintf('<?php echo $__env->yieldSection("stack:" . %s, ""); ?>', $parts[0] ?? "''");
            case 'php':
                return $hasArgs ? '<?php ' . $args . ' ?>' : '<?php ';
            case 'endphp':
                return ' ?>';
            case 'csrf':
                return '<?php echo csrf_field(); ?>';
            case 'method':
                return sprintf('<input type="hidden" name="_method" value="<?php echo e(%s); ?>">', $parts[0] ?? "''");
            case 'json':
                return sprintf('<?php echo json_encode(%s); ?>', $args);
            case 'verbatim':
            case 'endverbatim':
                return '';
        }

        return null;
    }

    /** Split "a, b('x,y')" on top-level commas only. */
    public static function splitArgs($args)
    {
        $parts = [];
        $buf = '';
        $depth = 0;
        $quote = null;
        $len = strlen($args);

        for ($i = 0; $i < $len; $i++) {
            $c = $args[$i];

            if ($quote !== null) {
                $buf .= $c;
                if ($c === '\\') {
                    $buf .= $args[++$i] ?? '';
                } elseif ($c === $quote) {
                    $quote = null;
                }
                continue;
            }

            if ($c === '"' || $c === "'") {
                $quote = $c;
                $buf .= $c;
                continue;
            }

            if (strpos('([{', $c) !== false) {
                $depth++;
            } elseif (strpos(')]}', $c) !== false) {
                $depth--;
            }

            if ($c === ',' && $depth === 0) {
                $parts[] = trim($buf);
                $buf = '';
                continue;
            }

            $buf .= $c;
        }

        if (trim($buf) !== '') {
            $parts[] = trim($buf);
        }

        return $parts;
    }

    /** Directives that take no arguments. */
    protected static function closeDirectives($source)
    {
        $closing = [
            'endif'      => '<?php endif; ?>',
            'endfor'     => '<?php endfor; ?>',
            'endforeach' => '<?php endforeach; ?>',
            'endwhile'   => '<?php endwhile; ?>',
            'else'       => '<?php else: ?>',
        ];

        foreach ($closing as $directive => $php) {
            $source = preg_replace('/@' . $directive . '(?![a-zA-Z0-9_])/', $php, $source);
        }

        $source = preg_replace('/@php(?![a-zA-Z0-9_])/', '<?php ', $source);
        $source = preg_replace('/@endphp(?![a-zA-Z0-9_])/', ' ?>', $source);

        return $source;
    }
}

class View
{
    public $viewPath;
    public $cachePath;
    public $cache = false;

    protected $sections = [];
    protected $stack = [];
    protected $extendsStack = [];
    protected $depth = 0;

    public function __construct($viewPath, $cachePath, $cache = false)
    {
        $this->viewPath  = rtrim($viewPath, '/');
        $this->cachePath = rtrim($cachePath, '/');
        $this->cache     = (bool) $cache && is_dir($cachePath) && is_writable($cachePath);
    }

    public function startSection($name)
    {
        ob_start();
        $this->stack[] = $name;
    }

    public function stopSection()
    {
        $name = array_pop($this->stack);
        $this->sections[$name] = ob_get_clean();
    }

    public function setSection($name, $value)
    {
        $this->sections[$name] = (string) $value;
    }

    /**
     * @extends records the layout for the *outermost* render only, so a partial
     * pulled in with @include can never steal it.
     */
    public function setExtends($layout)
    {
        $this->extendsStack[] = $layout;
    }

    public function yieldSection($name, $default = '')
    {
        return isset($this->sections[$name]) ? $this->sections[$name] : $default;
    }

    public function make($view, array $data = [])
    {
        $this->depth++;

        $data['__data'] = $data;
        $data['__env']  = $this;

        $html = $this->evaluate($this->compileFile($this->resolve($view)), $data);

        if ($this->depth === 1 && $this->extendsStack) {
            $layout = $this->resolve(array_shift($this->extendsStack));

            $html = $this->evaluate($this->compileFile($layout), $data);
        }

        if ($this->depth === 1) {
            $this->extendsStack = [];
            $this->sections     = [];
            $this->stack        = [];
        }

        $this->depth--;

        return $html;
    }

    protected function resolve($view)
    {
        $file = $this->viewPath . '/' . str_replace('.', '/', $view) . '.blade.php';

        if (!is_file($file)) {
            throw new \RuntimeException("View [{$view}] not found.");
        }

        return $file;
    }

    protected function compileFile($file)
    {
        $source = file_get_contents($file);
        $compiled = Blade::compile($source);

        if ($this->cache) {
            $cacheFile = $this->cachePath . '/' . md5($file) . '.php';

            if (is_file($cacheFile) && filemtime($cacheFile) >= filemtime($file)) {
                return file_get_contents($cacheFile);
            }

            @file_put_contents($cacheFile, $compiled);
        }

        return $compiled;
    }

    public function evaluate($__code, array $__data = [])
    {
        ob_start();

        try {
            (static function ($__code, $__data) {
                extract($__data, EXTR_SKIP);
                eval('?>' . $__code);
            })($__code, $__data);
        } catch (\Throwable $e) {
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            throw $e;
        }

        return ob_get_clean();
    }
}

class ViewRenderer
{
    protected $name;
    protected $data;

    public function __construct($name, array $data = [])
    {
        $this->name = $name;
        $this->data = $data;
    }

    public function with($key, $value = null)
    {
        if (is_array($key)) {
            $this->data = array_merge($this->data, $key);
        } else {
            $this->data[$key] = $value;
        }

        return $this;
    }

    public function render()
    {
        return Kernel::$instance->view->make($this->name, $this->data);
    }

    public function __toString()
    {
        return $this->render();
    }
}

class Kernel
{
    public $root;
    public $router;
    public $view;
    public $config = [];
    public $request;
    public static $instance;

    public function __construct($root, array $options = [])
    {
        $this->root = rtrim($root, '/');
        self::$instance = $this;

        require_once __DIR__ . '/helpers.php';
        require_once __DIR__ . '/RouteFacade.php';

        // Controllers and routes type-hint Laravel's own class names; point them
        // at the micro equivalents when the framework is not installed.
        foreach ([
            'Illuminate\Support\Facades\Route' => 'Micro\RouteFacade',
            'Illuminate\Http\Request'          => 'Micro\Request',
            'Illuminate\Http\Response'         => 'Micro\Response',
            'Symfony\Component\HttpKernel\Exception\NotFoundHttpException' => 'Micro\NotFound',
        ] as $laravel => $implementation) {
            if (!class_exists($laravel, false)) {
                class_alias($implementation, $laravel);
            }
        }

        $this->config = $this->loadConfig();
        $this->router = new Router();

        $cacheDir = $this->root . '/storage/framework/views';
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0777, true);
        }

        $this->view = new View(
            $this->root . '/resources/views',
            $cacheDir,
            !empty($options['view_cache'])
        );

        $routes = $this->root . '/routes/web.php';
        if (is_file($routes)) {
            require $routes;
        }
    }

    protected function loadConfig()
    {
        $config = [];

        foreach (glob($this->root . '/config/*.php') ?: [] as $file) {
            $config[basename($file, '.php')] = require $file;
        }

        return $config;
    }

    public function config($key = null, $default = null)
    {
        if ($key === null) {
            return $this->config;
        }

        $value = $this->config;

        foreach (explode('.', $key) as $segment) {
            if (is_array($value) && array_key_exists($segment, $value)) {
                $value = $value[$segment];
            } else {
                return $default;
            }
        }

        return $value;
    }

    public function handle($method, $uri, array $query = [], array $input = [], array $headers = [])
    {
        $request = new Request($method, $uri, $query, $input, $headers);
        $this->request = $request;

        try {
            $matched = $this->router->match($request);

            if (!$matched) {
                return $this->notFound();
            }

            [$route, $args] = $matched;

            return $this->toResponse($this->run($route['action'], $args, $request));
        } catch (NotFound $e) {
            return $this->notFound();
        } catch (HttpException $e) {
            return new Response($this->errorPage($e, $e->getCode()), $e->getCode() ?: 500, [
                'Content-Type' => 'text/html; charset=UTF-8',
            ]);
        } catch (\Throwable $e) {
            error_log((string) $e);

            if ($request->wantsJson()) {
                return new Response(json_encode([
                    'error'   => 'server_error',
                    'message' => $e->getMessage(),
                ]), 500, ['Content-Type' => 'application/json']);
            }

            return new Response($this->errorPage($e), 500, ['Content-Type' => 'text/html; charset=UTF-8']);
        }
    }

    protected function run($action, array $args, Request $request)
    {
        if (is_callable($action)) {
            return $action($request, ...$args);
        }

        if (is_string($action) && strpos($action, '@') !== false) {
            $action = explode('@', $action);
        }

        if (is_array($action) && count($action) === 2) {
            [$class, $method] = $action;

            if (!class_exists($class)) {
                throw new \RuntimeException("Controller [{$class}] not found.");
            }

            $controller = new $class();

            return $controller->{$method}($request, ...$args);
        }

        throw new \RuntimeException('Unsupported route action.');
    }

    protected function toResponse($result)
    {
        if ($result instanceof Response) {
            return $result;
        }

        if ($result instanceof ViewRenderer) {
            $result = $result->render();
        }

        if (is_array($result)) {
            return new Response(
                json_encode($result, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
                200,
                ['Content-Type' => 'application/json']
            );
        }

        return new Response((string) $result, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    protected function notFound()
    {
        try {
            $html = $this->view->make('errors.404', [
                'title'        => \App\Support\Seo::title('Page not found'),
                'description' => \App\Support\Seo::describe(
                    'That page has moved or never existed. All twenty Sharm el-Sheikh day trips, the films, the places and the guides are one click away.'
                ),
                // A 404 should never be indexed, and should never canonicalise
                // onto something it is not.
                'noindex'     => true,
                'canonical'   => null,
                'tours'       => \App\Support\Tours::featured(6),
                'nav'         => $this->config('site.nav'),
                'contact'     => $this->config('site.contact'),
                'footerNav'   => $this->config('site.footer_nav'),
                'promise'     => \App\Support\Site::promise(),
                'stats'       => \App\Support\Site::stats(),
                'tripCount'   => count(\App\Support\Tours::all()),
                'site'        => $this->config('site'),
            ]);
        } catch (\Throwable $e) {
            $html = '<!doctype html><meta charset="utf-8"><title>404</title><body style="font:16px/1.6 system-ui;padding:4rem;background:#101010;color:#f4f4f2"><h1>404 — page not found</h1><p><a style="color:#c0b38c" href="/">Back to the homepage</a></p>';
        }

        return new Response($html, 404, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    protected function errorPage(\Throwable $e, $status = 500)
    {
        return '<!doctype html><meta charset="utf-8"><title>Runtime error</title>'
            . '<body style="font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;padding:2.5rem;background:#101010;color:#f4f4f2">'
            . '<p style="letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#c0b38c">micro kernel · HTTP ' . (int) $status . '</p>'
            . '<h1 style="font-size:1.15rem;font-weight:600;margin:.4rem 0 1.2rem">' . htmlspecialchars($e->getMessage(), ENT_QUOTES) . '</h1>'
            . '<pre style="white-space:pre-wrap;color:#8b8b86;font-size:12px">'
            . htmlspecialchars($e->getFile() . ':' . $e->getLine() . "\n\n" . $e->getTraceAsString(), ENT_QUOTES)
            . '</pre>';
    }
}
