<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Places — /areas and /areas/{slug}. Each one is a silo into the trips that
 * start there, with photography from the same Drive folders.
 */
class AreaController extends Controller
{
    public function index(Request $request)
    {
        return $this->view('areas.index', [
            'title'       => 'Around Sharm el-Sheikh: bay, reef, desert',
            'description' => 'Naama Bay, Ras Mohammed, Tiran, the old town, the foothills and the canyon — what each part of Sharm el-Sheikh is good for, and which trips start there.',
            'hero'        => [
                'eyebrow' => 'around sharm',
                'title'   => 'six places, one base',
                'lede'    => 'Everything we run starts from somewhere specific, and it is worth knowing which: the pier, the park gate, the canyon track or the hotel lobby.',
                'image'   => Tours::img('submarine', 6, 1800),
                'alt'     => 'The reef shelf off Naama Bay seen from the water',
            ],
            'ogImage'     => Tours::img('submarine', 6, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'areas-index',
            'breadcrumb'  => [$this->crumb('Places', '/areas')],
            'seoNodes'    => [
                Seo::itemList('Places around Sharm el-Sheikh', array_map(function ($area) {
                    return ['name' => $area['name'], 'url' => '/areas/' . $area['slug']];
                }, Site::areas())),
            ],
        ]);
    }

    public function show(Request $request, $slug = null)
    {
        $area = Site::area((string) $slug);

        if (!$area) {
            abort(404, 'That place does not exist.');
        }

        $all   = Site::areas();
        $index = array_search($slug, array_column($all, 'slug'), true);
        $next  = $all[(int) (($index + 1) % count($all))];

        $trips = Tours::in($area['trips']);
        $url   = '/areas/' . $area['slug'];

        return $this->view('areas.show', [
            'title'       => $area['name'] . ' — Sharm el-Sheikh trips',
            'description' => $area['blurb'],
            'area'        => $area,
            'trips'       => $trips,
            'neighbour'   => $next,
            'ogImage'     => $area['image'],
            'headerTheme' => 'transparent',
            'bodyClass'   => 'area',
            'breadcrumb'  => [
                $this->crumb('Places', '/areas'),
                $this->crumb($area['name'], $url),
            ],
            'seoNodes'    => [
                [
                    '@type'       => 'TouristAttraction',
                    'name'        => $area['name'] . ', Sharm el-Sheikh',
                    'description' => $area['blurb'],
                    'image'       => $area['image'],
                    'address'     => ['@type' => 'PostalAddress', 'addressLocality' => 'Sharm el-Sheikh', 'addressRegion' => 'South Sinai', 'addressCountry' => 'EG'],
                ],
                Seo::itemList('Trips from ' . $area['name'], array_map(function ($tour) {
                    return ['name' => $tour['title'], 'url' => '/tours/' . $tour['slug']];
                }, $trips)),
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'Places', 'url' => '/areas'],
                    ['name' => $area['name'], 'url' => $url],
                ]),
            ],
        ]);
    }
}
