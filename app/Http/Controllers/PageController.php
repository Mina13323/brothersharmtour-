<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Company pages, the FAQ and the policies.
 */
class PageController extends Controller
{

    /**
     * Paths that were published before the restructure. They redirect (301)
     * instead of rendering, so /excursions and /tours are never two indexable
     * copies of the same page.
     */
    protected static $aliases = [
        '/excursions'    => '/tours',
        '/day-trips'     => '/tours',
        '/places'        => '/areas',
        '/blog'          => '/guides',
        '/our-process'   => '/how-it-works',
        '/about-us'      => '/about',
        '/contact-us'    => '/contact',
        '/guides/best-time-to-visit'                 => '/guides/best-time-to-visit-sharm-el-sheikh',
        '/guides/best-time-to-visit-sharm'           => '/guides/best-time-to-visit-sharm-el-sheikh',
        '/guides/packing-for-a-boat-day'             => '/guides/what-to-pack-for-a-red-sea-boat-day',
        '/guides/cairo'                              => '/guides/one-day-in-cairo-from-sharm',
        '/areas/ras-mohammed-national-park'          => '/areas/ras-mohammed',
        '/areas/colored-canyon'                      => '/areas/sinai-backcountry',
    ];
    public function how(Request $request)
    {
        return $this->view('pages.how', [
            'title'       => 'How booking a day trip works',
            'description' => 'Send the date, get a real price for the trip as it will run, confirm, pay at the end of the day. Pick-up from your hotel, free cancellation up to 24 hours before.',
            'hero'        => [
                'eyebrow' => 'booking with us',
                'title'   => 'four steps, usually inside a day',
                'lede'    => 'No cart, no account, no deposit unless we need one for a flight seat. One person answers, prices and runs your day.',
                'image'   => Tours::img('super-safari', 5, 1800),
                'alt'     => 'Guides loading quad bikes at the start of a desert evening',
            ],
            'process'     => Site::process(),
            'faq'         => array_slice(Site::faq(), 0, 4),
            'ogImage'     => Tours::img('super-safari', 5, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'how',
            'breadcrumb'  => [$this->crumb('How it works', '/how-it-works')],
            'seoNodes'    => [
                Seo::faq(array_slice(Site::faq(), 0, 4)),
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'How it works', 'url' => '/how-it-works'],
                ]),
            ],
        ]);
    }

    public function about(Request $request)
    {
        $about = Site::about();

        return $this->view('pages.about', [
            'title'       => 'About us: who runs your trip in Sharm',
            'description' => 'A small outfit in Naama Bay: guides, boat captains and drivers who run twenty day trips and every transfer between them, and answer their own messages.',
            'hero'        => [
                'eyebrow' => $about['eyebrow'],
                'title'   => $about['title'],
                'lede'    => $about['body'][0],
                'image'   => Tours::img('bedouin-safari', 2, 1800),
                'alt'     => 'Camels and quad bikes at the bedouin camp above Naama Bay',
            ],
            'about'       => $about,
            'commitment'  => Site::commitment(),
            'areas'       => Site::areas(),
            'ogImage'     => Tours::img('bedouin-safari', 2, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'about',
            'breadcrumb'  => [$this->crumb('About', '/about')],
            'seoNodes'    => [
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'About', 'url' => '/about'],
                ]),
            ],
        ]);
    }

    public function faq(Request $request)
    {
        $faq = Site::faq();

        return $this->view('pages.faq', [
            'title'       => 'Booking FAQ: prices, pick-up, weather',
            'description' => 'Answers to the questions we get every day: how far ahead to book, what is included, private boats, wind cancellations, swimming, payment and delayed flights.',
            'hero'        => [
                'eyebrow' => 'asked every week',
                'title'   => 'the questions, answered',
                'lede'    => 'If yours is not here, message it to us — the answer usually ends up on this page.',
                'image'   => Tours::img('glass-bottom-boat', 3, 1800),
                'alt'     => 'Glass-bottom boat at the Naama Bay pier',
            ],
            'faq'         => $faq,
            'ogImage'     => Tours::img('glass-bottom-boat', 3, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'faq',
            'breadcrumb'  => [$this->crumb('FAQ', '/faq')],
            'seoNodes'    => [
                Seo::faq($faq),
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'FAQ', 'url' => '/faq'],
                ]),
            ],
        ]);
    }

    public function alias(Request $request)
    {
        $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
        $path = '/' . trim((string) parse_url($uri, PHP_URL_PATH), '/');
        $tail = [];

        if (preg_match('#^/trips/(.+)$#', $path, $m)) {
            $tail[] = $m[1];
            $path   = '/tours';
        }

        $to = isset(self::$aliases[$path]) ? self::$aliases[$path] : $path;

        // A legacy path with a slug on the end (/trips/white-island) keeps that
        // slug, so the redirect lands on the same page, not the index.
        if ($tail) {
            $to .= '/' . $tail[0];
        }

        $query = isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== ''
            ? '?' . $_SERVER['QUERY_STRING']
            : '';

        return redirect($to . $query, 301);
    }

    public function legal(Request $request, $slug = null)
    {
        if (!$slug) {
            // The routes mount each policy at its own path with no parameter, so
            // take the slug from the request path — works in Laravel and micro.
            $uri  = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
            $path = trim((string) parse_url($uri, PHP_URL_PATH), '/');
            $slug = $path !== '' ? $path : null;
        }

        $page = Site::legalPage((string) $slug);

        if (!$page) {
            abort(404, 'That page does not exist.');
        }

        return $this->view('pages.legal', [
            'title'       => $page['title'],
            'description' => $page['excerpt'],
            'page'        => $page,
            'pages'       => Site::legal(),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'legal',
            'breadcrumb'  => [$this->crumb($page['title'], '/' . $slug)],
            'seoNodes'    => [
                Seo::breadcrumb(array_merge(
                    [['name' => 'Home', 'url' => '/']],
                    [['name' => $page['title'], 'url' => '/' . $slug]]
                )),
            ],
        ]);
    }
}
