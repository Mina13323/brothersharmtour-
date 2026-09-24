<?php

namespace App\Support;

/**
 * Navigation matching: which item is the one you are looking at, and what its
 * dropdown is called.
 *
 * The header needs this to mark the current page (`aria-current="page"`) in both
 * the bar and the mobile panel, and to give every submenu an id the expander
 * button can point at. It lives here rather than in the template because the
 * rules are fiddly: a child's url carries a query string (/tours?category=sea),
 * /tours itself should stay current while a filter is applied, and an area or
 * trip page belongs to its section two levels down (/tours/white-island is
 * "Day trips").
 */
class Nav
{
    /** The path part of a url, without the query string. */
    public static function path($url)
    {
        $path = parse_url((string) $url, PHP_URL_PATH);

        return $path ? self::normalise($path) : '/';
    }

    /** A stable id fragment for a nav url: /tours?category=sea → tours. */
    public static function slug($url)
    {
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(self::path($url))), '-');

        return $slug === '' ? 'item' : $slug;
    }

    /**
     * Is this the page you are on? The root is exact, everything else is a
     * prefix — so /tours stays current on /tours/white-island and on the
     * filtered lists, which is what a visitor expects the bar to say.
     */
    public static function isCurrent($url, $current)
    {
        $url = self::path($url);
        $current = self::normalise($current);

        if ($url === '/' || $url === $current) {
            return $url === $current;
        }

        return strpos($current, $url . '/') === 0;
    }

    /**
     * Exact match, for a link at the end of a dropdown. The prefix rule above is
     * what a section heading wants and what a leaf cannot have: "Sea & reef"
     * points at /tours?category=sea, and it is current on that filter and nowhere
     * else — never on /tours itself, and never on a trip page.
     */
    public static function isExact($url, $current, $query = '')
    {
        if (self::path($url) !== self::normalise($current)) {
            return false;
        }

        $want = parse_url((string) $url, PHP_URL_QUERY);

        return $want ? (string) $want === (string) $query : true;
    }

    /** Does any item in a dropdown match? Marks its parent as current too. */
    public static function hasCurrent($children, $current, $query = '')
    {
        foreach ($children as $child) {
            if (! empty($child['url']) && self::isExact($child['url'], $current, $query)) {
                return true;
            }
        }

        return false;
    }

    private static function normalise($path)
    {
        $path = '/' . trim((string) $path, '/');

        return $path === '/' ? '/' : rtrim($path, '/');
    }
}
