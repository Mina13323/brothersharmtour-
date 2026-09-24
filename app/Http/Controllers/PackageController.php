<?php

namespace App\Http\Controllers;

use App\Support\Packages;
use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Packages — /packages and /packages/{slug}.
 *
 * The page exists whether or not App\Support\Packages has rows: when it does
 * not, the template renders the placeholder state and nothing links to a
 * package that is not there yet. That is what lets the data be filled in later
 * without touching a template.
 */
class PackageController extends Controller
{
    public function index(Request $request)
    {
        $packages = Packages::all();
        $intro    = Packages::intro();

        $data = [
            'title'       => 'Sharm el-Sheikh trip packages for a week',
            'description' => $intro['lede'],
            'hero'        => [
                'eyebrow' => 'packages',
                'title'   => 'a week, one price, the trips that fit it',
                'lede'    => 'Bundled days built the way we would build our own week: the reef when the sea is flat, the desert for the hot afternoon, and the long drive on a day you have the energy for.',
                'image'   => Tours::img('colored-canyon', 3, 1800),
                'alt'     => 'Walking out of the Colored Canyon between two of the days in a package week',
                'actions' => [
                    ['label' => 'build my week', 'url' => '/contact'],
                    ['label' => 'all day trips', 'url' => '/tours', 'ghost' => true],
                ],
            ],
            'ogImage'     => Tours::img('colored-canyon', 3, 1200),
            'intro'       => $intro,
            'packages'    => $packages,
            'note'        => Packages::emptyNote(),
            'always'      => Packages::alwaysIncluded(),
            'tours'       => Tours::featured(6),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'packages packages-index',
            'breadcrumb'  => [$this->crumb('Packages', '/packages')],
            'seoNodes'    => [
                count($packages) ? Seo::itemList('Sharm el-Sheikh trip packages', array_map(function ($package) {
                    return ['name' => $package['name'], 'url' => '/packages/' . $package['slug']];
                }, $packages)) : null,
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'Packages', 'url' => '/packages'],
                ]),
            ],
        ];

        return $this->view('packages.index', $data);
    }

    public function show(Request $request, $slug = null)
    {
        $package = Packages::find((string) $slug);

        if (!$package) {
            abort(404, 'That package is not published yet.');
        }

        $trips = Packages::tripsIn($package);
        $url   = '/packages/' . $package['slug'];
        $image = $this->imageFor($package, $trips);

        return $this->view('packages.show', [
            'title'       => isset($package['seo_title']) && $package['seo_title']
                ? $package['seo_title']
                : $package['name'] . ' — Sharm el-Sheikh package',
            'description' => isset($package['seo_description']) && $package['seo_description']
                ? $package['seo_description']
                : $package['strap'] . ' ' . Packages::price($package) . '.',
            'package'     => $package,
            'trips'       => $trips,
            'heroImage'   => $image,
            'ogImage'     => $image,
            'headerTheme' => 'transparent',
            'bodyClass'   => 'package',
            'breadcrumb'  => [
                $this->crumb('Packages', '/packages'),
                $this->crumb($package['name'], $url),
            ],
            'seoNodes'    => [
                [
                    '@type'            => 'Product',
                    'name'             => $package['name'],
                    'description'      => $package['lede'] ?? $package['strap'],
                    'image'            => $image,
                    'brand'            => ['@type' => 'Brand', 'name' => (string) config('site.name')],
                    'category'         => 'Holiday package',
                    'offers'           => array_filter([
                        '@type'         => 'Offer',
                        'url'           => Seo::canonical($url),
                        'price'         => ! empty($package['price']) ? (float) $package['price'] : null,
                        'priceCurrency' => $package['currency'] ?? 'USD',
                        'availability'  => 'https://schema.org/InStock',
                        'description'   => empty($package['price']) ? 'Price on request' : null,
                    ]),
                    'positiveNotes'    => ['@type' => 'ItemList', 'itemListElement' => array_map(function ($line) {
                        return ['@type' => 'ListItem', 'name' => $line];
                    }, $package['included'] ?? [])],
                ],
                count($trips) ? [
                    '@type'           => 'ItemList',
                    'name'            => 'The days inside ' . $package['name'],
                    'itemListElement' => array_map(function ($tour) {
                        return ['@type' => 'ListItem', 'name' => $tour['title'], 'url' => Seo::canonical('/tours/' . $tour['slug'])];
                    }, $trips),
                ] : null,
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'Packages', 'url' => '/packages'],
                    ['name' => $package['name'], 'url' => $url],
                ]),
            ],
        ]);
    }

    /**
     * The package borrows the cover of its first trip, so adding a package never
     * means adding photography: the Drive folders already have it.
     */
    protected function imageFor(array $package, array $trips)
    {
        if (! empty($package['image'])) {
            return $package['image'];
        }

        foreach ($trips as $tour) {
            if (! empty($tour['folder'])) {
                return Tours::img($tour['slug'], 0, 1800);
            }
        }

        return Site::hero()['image'];
    }
}
