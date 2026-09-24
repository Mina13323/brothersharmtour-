<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Guides & practical know-how — /guides, /guides/{slug}.
 * The season guide additionally renders the month chart.
 */
class GuideController extends Controller
{
    public function index(Request $request)
    {
        return $this->view('guides.index', [
            'title'       => 'Sharm el-Sheikh travel guides',
            'description' => 'Written by the people who run the trips: when to go, which reef day suits your group, what to pack for a boat day, and how to do Cairo properly in one day from Sharm.',
            'hero'        => [
                'eyebrow' => 'before you book',
                'title'   => 'what we actually tell people',
                'lede'    => 'No destination fluff. These are the answers we give on WhatsApp every week, written down once so you can read them at your own pace.',
                'image'   => Tours::img('colored-canyon', 0, 1800),
                'alt'     => 'Walking the sandstone slot of the Colored Canyon in South Sinai',
            ],
            'guides'      => Site::guides(),
            'ogImage'     => Tours::img('colored-canyon', 0, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'guides-index',
            'breadcrumb'  => [$this->crumb('Guides', '/guides')],
            'seoNodes'    => [
                Seo::itemList('Sharm el-Sheikh guides', array_map(function ($guide) {
                    return ['name' => $guide['title'], 'url' => '/guides/' . $guide['slug']];
                }, Site::guides())),
            ],
        ]);
    }

    public function show(Request $request, $slug = null)
    {
        $guide = Site::guide((string) $slug);

        if (!$guide) {
            abort(404, 'That guide does not exist.');
        }

        $url   = '/guides/' . $guide['slug'];
        $other = array_values(array_filter(Site::guides(), function ($item) use ($guide) {
            return $item['slug'] !== $guide['slug'];
        }));

        $data = [
            'title'       => $guide['title'],
            'description' => $guide['lede'],
            'guide'       => $guide,
            'trips'       => Tours::in($guide['trips']),
            'others'      => array_slice($other, 0, 3),
            'ogImage'     => $guide['image'],
            'headerTheme' => 'transparent',
            'bodyClass'   => 'guide',
            'breadcrumb'  => [
                $this->crumb('Guides', '/guides'),
                $this->crumb($guide['title'], $url),
            ],
            'seoNodes'    => [
                Seo::article($guide),
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'Guides', 'url' => '/guides'],
                    ['name' => $guide['title'], 'url' => $url],
                ]),
            ],
        ];

        if ($guide['type'] === 'season') {
            $data['months']     = Site::seasonMonths();
            $data['seasonTable'] = Site::seasonTable();
            $data['labels']     = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        return $this->view('guides.' . ($guide['type'] === 'season' ? 'season' : 'show'), $data);
    }
}
