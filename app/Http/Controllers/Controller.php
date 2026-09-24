<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;

/**
 * Base controller: page furniture shared by every view (brand, nav, footer),
 * the canonical URL, and the structured-data graph the layout renders.
 */
class Controller
{
    protected function view($name, array $data = [])
    {
        return view($name, $this->share($data));
    }

    protected function share(array $data)
    {
        $shared = [
            'site'        => config('site'),
            'nav'         => config('site.nav'),
            'contact'     => config('site.contact'),
            'footerNav'   => config('site.footer_nav'),
            'tripCount'   => count(Tours::all()),
            'categories'  => Tours::categories(),
            'areas'       => Site::areas(),
            'promise'     => Site::promise(),
            'approach'    => Site::approach(),
            'process'     => Site::process(),
            'stats'       => Site::stats(),
            'bodyClass'   => '',
            'headerTheme' => 'transparent',
            'currentPath'  => $this->path(),
            'currentQuery' => $this->query(),
            'canonical'   => $this->canonical(),
            'ogImage'     => Site::hero()['image'],
            'jsonLd'      => [],
            'breadcrumb'  => [],
        ];

        // One place for title and description hygiene, so no page ships a
        // truncated-in-the-wrong-spot snippet.
        if (! empty($data['description'])) {
            $data['description'] = Seo::describe((string) $data['description']);
        } else {
            unset($data['description']);
        }

        if (isset($data['title'])) {
            // Controllers supply the keyword-led part; the brand suffix (and a
            // sensible cut when it will not fit) is added here for every page.
            $data['seoTitle'] = Seo::title((string) $data['title']);
        }

        // Query strings never belong in a canonical: /tours?category=sea is the
        // same page as /tours, and saying so is what stops the filters being
        // indexed as duplicates.
        $data['canonical'] = $data['canonical'] ?? $shared['canonical'];
        $data['seoNodes']  = $data['seoNodes'] ?? [];

        $merged = array_merge($shared, $data);

        $merged['jsonLd'] = array_values(array_filter(array_merge(
            [Seo::agency()],
            $merged['seoNodes']
        )));

        unset($merged['seoNodes']);

        return $merged;
    }

    /**
     * The path being served, without the query string — what the header matches
     * a nav url against. Kept separate from canonical(), which returns an
     * absolute url for the <link> tag and is the wrong shape for comparing.
     */
    protected function path()
    {
        $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
        $path = parse_url($uri, PHP_URL_PATH);

        return $path ? $path : '/';
    }

    /** The live query string, for nav links that carry one. */
    protected function query()
    {
        $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';

        return parse_url($uri, PHP_URL_QUERY) ?: '';
    }

    protected function canonical($override = null)
    {
        if ($override) {
            return Seo::canonical($override);
        }

        $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
        $path = parse_url($uri, PHP_URL_PATH);

        return Seo::canonical($path ?: '/');
    }

    protected function crumb(string $name, string $url): array
    {
        return ['name' => $name, 'url' => $url];
    }
}
