<?php

namespace App\Support;

/**
 * Structured data, canonical URLs and the sitemap.
 *
 * Everything here is derived from config('site') plus the trip catalogue, so a
 * page's SEO output cannot drift from the content it actually renders.
 */
class Seo
{
    public static function siteUrl(): string
    {
        $base = (string) config('site.url');

        if ($base === '' || $base === '/') {
            // Nothing configured (local dev): build from the request instead of
            // emitting bogus canonicals that point at a made-up domain.
            $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host   = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8000';

            return $scheme . '://' . $host;
        }

        return rtrim($base, '/');
    }

    public static function canonical($path = '/')
    {
        if (preg_match('#^https?://#', (string) $path)) {
            return $path;
        }

        return self::siteUrl() . '/' . ltrim((string) $path, '/');
    }

    /**
     * Titles are built, not hand-tuned: brand suffix on, and if the whole thing
     * is longer than the SERP will show, the suffix goes first and the core is
     * trimmed at a word boundary.
     */
    public static function title(string $core, $suffix = null, int $max = 68): string
    {
        $suffix = $suffix === null ? (string) config('site.name') : (string) $suffix;
        $full   = $suffix !== '' ? $core . ' | ' . $suffix : $core;

        if (self::len($full) <= $max) {
            return $full;
        }

        if (self::len($core) <= $max) {
            return $core;
        }

        return self::clip($core, $max);
    }

    /** Meta descriptions: never truncated mid-word by Google on our behalf. */
    public static function describe(string $text, int $max = 155): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));

        return self::len($text) <= $max ? $text : self::clip($text, $max - 1) . '…';
    }

    public static function len($text)
    {
        return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
    }

    private static function clip($text, $max)
    {
        $cut = function_exists('mb_substr') ? mb_substr($text, 0, $max, 'UTF-8') : substr($text, 0, $max);
        $sp  = strrpos($cut, ' ');

        return $sp !== false && $sp > $max * 0.6 ? rtrim(substr($cut, 0, $sp)) : rtrim($cut);
    }

    public static function json(array $graph): string
    {
        $nodes = array_values(array_filter($graph));

        $payload = count($nodes) === 1 ? $nodes[0] : ['@context' => 'https://schema.org'] + ['@graph' => $nodes];

        if (count($nodes) !== 1) {
            $payload = ['@context' => 'https://schema.org', '@graph' => $nodes];
        }

        return json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /* ------------------------------------------------------------- entities */

    public static function agency(): array
    {
        $contact = (array) config('site.contact');

        $node = [
            '@type'       => 'TravelAgency',
            '@id'         => self::canonical('/') . '#agency',
            'name'        => (string) config('site.name'),
            'url'         => self::canonical('/'),
            'description' => (string) config('site.description'),
            'image'       => Tours::img('tiran-island-snorkelling', 2, 1200),
            'logo'        => self::canonical('/img/brand/logo.png'),
            'slogan'      => (string) config('site.tagline'),
            'slogan'      => (string) config('site.tagline'),
            'areaServed'  => [
                ['@type' => 'City', 'name' => 'Sharm el-Sheikh'],
                ['@type' => 'Place', 'name' => 'South Sinai'],
                ['@type' => 'Country', 'name' => 'EG'],
            ],
            'knowsLanguage' => ['en', 'ar'],
            'currenciesAccepted' => 'USD, EGP, EUR',
            'paymentAccepted' => 'Cash, Credit card, Bank transfer',
        ];

        if (!empty($contact['email'])) {
            $node['email'] = $contact['email'];
        }

        if (!empty($contact['phone']['tel'])) {
            $node['telephone'] = $contact['phone']['tel'];
            $node['contactPoint'] = [[
                '@type'             => 'ContactPoint',
                'telephone'         => $contact['phone']['tel'],
                'contactType'       => 'reservations',
                'availableLanguage' => ['English', 'Arabic'],
            ]];
        }

        if (!empty($contact['address_lines'])) {
            $node['address'] = ['@type' => 'PostalAddress', 'addressLocality' => $contact['address_lines'][0] ?? '', 'addressCountry' => 'EG'];
        }

        $sameAs = [];

        foreach ((array) ($contact['social'] ?? []) as $network) {
            if (!empty($network['url'])) {
                $sameAs[] = $network['url'];
            }
        }

        if ($sameAs) {
            $node['sameAs'] = $sameAs;
        }

        return $node;
    }

    public static function website(): array
    {
        return [
            '@type' => 'WebSite',
            '@id'   => self::canonical('/') . '#website',
            'url'   => self::canonical('/'),
            'name'  => (string) config('site.name'),
            'description' => (string) config('site.description'),
            'inLanguage'  => 'en',
            'publisher'   => ['@id' => self::canonical('/') . '#agency'],
        ];
    }

    public static function breadcrumb(array $trail): array
    {
        $items = [];

        foreach (array_values($trail) as $index => $crumb) {
            $items[] = [
                '@type'    => 'ListItem',
                'position' => $index + 1,
                'name'     => $crumb['name'],
                'item'     => self::canonical($crumb['url']),
            ];
        }

        return ['@type' => 'BreadcrumbList', 'itemListElement' => $items];
    }

    public static function trip(array $tour): array
    {
        $folder = $tour['folder'];
        $shots  = array_slice($tour['gallery'], 0, 4);

        $node = [
            '@type'       => 'Product',
            '@id'         => self::canonical('/tours/' . $tour['slug']) . '#trip',
            'name'        => $tour['title'] . ' — day trip from Sharm el-Sheikh',
            'sku'         => $tour['slug'],
            'description' => $tour['lede'],
            'url'         => self::canonical('/tours/' . $tour['slug']),
            'category'    => isset(Tours::CATEGORIES[$tour['category']]) ? Tours::CATEGORIES[$tour['category']] : 'Day trip',
            'brand'       => ['@type' => 'Brand', 'name' => (string) config('site.name')],
            'image'       => array_map(function ($shot) use ($folder) {
                return Drive::img($shot, 1200, $folder);
            }, $shots ?: [Tours::cover()]),
            'offers'      => [
                [
                    '@type'           => 'Offer',
                    'url'             => self::canonical('/contact-us?tour=' . $tour['slug']),
                    'availability'    => 'https://schema.org/InStock',
                    'priceCurrency'   => 'USD',
                    'price'           => $tour['price'] ? (float) $tour['price'] : null,
                    'priceValidUntil' => date('Y-m-d', strtotime('+1 year')),
                    'eligibleQuantity' => ['@type' => 'QuantitativeValue', 'minValue' => 1],
                    'availabilityStarts' => null,
                ],
            ],
            'subjectOf'   => [
                '@type'       => 'TouristTrip',
                'name'        => $tour['title'],
                'description' => $tour['strap'],
                'itinerary'   => [
                    '@type'           => 'ItemList',
                    'numberOfItems'   => count($tour['highlights']),
                    'itemListElement'   => array_map(function ($index, $point) {
                        return ['@type' => 'ListItem', 'position' => $index + 1, 'name' => $point];
                    }, array_keys($tour['highlights']), $tour['highlights']),
                ],
                'touristType' => $tour['level'],
                'provider'    => ['@id' => self::canonical('/') . '#agency'],
            ],
        ];

        // Google wants offers without a null price — say "on request" instead.
        if (!$tour['price']) {
            $node['offers'][0]['price']       = 0;
            $node['offers'][0]['priceSpec']   = null;
            $node['offers'][0]['description'] = 'Price on request — ' . $tour['duration'];
        }

        unset($node['offers'][0]['priceSpec'], $node['offers'][0]['availabilityStarts']);

        if (!empty($tour['included'])) {
            $node['additionalProperty'] = array_map(function ($index, $line) {
                return ['@type' => 'PropertyValue', 'name' => 'Included ' . ($index + 1), 'value' => $line];
            }, array_keys($tour['included']), $tour['included']);
        }

        return array_filter($node, function ($value) {
            return $value !== null && $value !== [];
        });
    }

    public static function videos(array $clips, $folder = null, $name = 'Trip film'): array
    {
        $out = [];

        foreach ($clips as $index => $clip) {
            $out[] = [
                '@type'       => 'VideoObject',
                'name'        => Drive::label($clip) ?: ($name . ' ' . ($index + 1)),
                'description' => $name . ' from ' . (string) config('site.name'),
                'thumbnailUrl'=> Drive::img($clip, 640, $folder),
                'embedUrl'    => Drive::embed($clip, $folder),
                'contentUrl'  => Drive::file($clip, $folder),
                'uploadDate'  => (string) config('site.published'),
            ];
        }

        return $out;
    }

    public static function faq(array $items): array
    {
        return [
            '@type'      => 'FAQPage',
            'mainEntity' => array_map(function ($item) {
                return [
                    '@type'          => 'Question',
                    'name'           => $item['q'],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['a']],
                ];
            }, $items),
        ];
    }

    public static function article(array $guide): array
    {
        return [
            '@type'         => 'Article',
            'headline'      => $guide['title'],
            'description'   => $guide['lede'],
            'datePublished' => (string) config('site.published'),
            'dateModified'  => date('Y-m-d'),
            'inLanguage'    => 'en',
            'author'        => ['@id' => self::canonical('/') . '#agency'],
            'publisher'     => ['@id' => self::canonical('/') . '#agency'],
            'image'         => $guide['image'],
            'mainEntityOfPage' => self::canonical('/guides/' . $guide['slug']),
        ];
    }

    public static function itemList(string $name, array $items, string $type = 'ItemList'): array
    {
        return [
            '@type'         => $type,
            'name'          => $name,
            'numberOfItems' => count($items),
            'itemListElement' => array_map(function ($index, $item) {
                return [
                    '@type'    => 'ListItem',
                    'position' => $index + 1,
                    'name'     => $item['name'],
                    'url'      => self::canonical($item['url']),
                ];
            }, array_keys($items), $items),
        ];
    }

    /* -------------------------------------------------------------- sitemap */

    /** @return array<int, array{loc:string,lastmod:string,priority:string}> */
    public static function sitemap(): array
    {
        $today  = date('Y-m-d');
        $urls   = [];

        $add = function ($path, $priority) use (&$urls, $today) {
            $urls[] = ['loc' => self::canonical($path), 'lastmod' => $today, 'priority' => $priority];
        };

        $add('/', '1.0');
        $add('/tours', '0.9');

        foreach (Tours::all() as $tour) {
            $add('/tours/' . $tour['slug'], '0.8');
        }

        foreach (Site::areas() as $area) {
            $add('/areas/' . $area['slug'], '0.6');
        }

        $add('/areas', '0.7');

        // The packages index is a real page even while the data file is empty;
        // individual weeks join as soon as they are written.
        $add('/packages', '0.8');

        foreach (\App\Support\Packages::all() as $package) {
            $add('/packages/' . $package['slug'], '0.7');
        }

        foreach (Site::guides() as $guide) {
            $add('/guides/' . $guide['slug'], '0.7');
        }

        $add('/guides', '0.6');
        $add('/films', '0.6');
        $add('/faq', '0.6');
        $add('/how-it-works', '0.6');
        $add('/about', '0.6');
        $add('/contact', '0.7');

        foreach (array_keys(Site::legal()) as $slug) {
            $add('/' . $slug, '0.3');
        }

        return $urls;
    }

    public static function robotsTxt(): string
    {
        return implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /contact',
            'Disallow: /contact-us',
            '',
            'Sitemap: ' . self::canonical('/sitemap.xml'),
            '',
        ]);
    }
}
