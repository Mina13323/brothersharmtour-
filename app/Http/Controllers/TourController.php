<?php

namespace App\Http\Controllers;

use App\Support\Drive;
use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Day trips and excursions — /tours, /tours/{slug} and /films.
 *
 * Content lives in App\Support\Tours; media stays in Google Drive and is
 * addressed through App\Support\Drive, so every hero/gallery value handed to a
 * view is already a resolvable URL (never a bare Drive id).
 */
class TourController extends Controller
{
    public function index(Request $request)
    {
        $category = (string) $request->get('category');
        $all      = Tours::filtered($category !== '' ? $category : null);
        $label    = isset(Tours::CATEGORIES[$category]) ? Tours::CATEGORIES[$category] : null;

        $title = $label
            ? $label . ' day trips in Sharm'
            : 'Day trips & excursions in Sharm el-Sheikh';

        $description = $label
            ? $label . ' day trips out of Sharm el-Sheikh — hotel pick-up included, free cancellation up to 24h before, priced per person before you book.'
            : config('site.description');

        return $this->view('tours.index', [
            'title'       => $title,
            'description' => $description,
            'hero'        => [
                'eyebrow' => 'sharm el-sheikh & south sinai',
                'title'   => 'twenty ways to spend a day',
                'lede'    => 'Reef trips, desert evenings, Cairo by air, and the transfers in between. All of them run by the people who lead them, and all of them can be changed — a private boat, a later start, a guide who speaks your language.',
                'image'   => Tours::img('white-island', 1, 1800),
                'alt'     => 'Boat moored off the White Island sandbar in the Gulf of Aqaba',
                'credit'  => 'Photographed on our own trips',
            ],
            'tours'       => $all,
            'active'      => $category !== '' ? $category : null,
            'faq'         => array_slice(Site::faq(), 0, 4),
            'ogImage'     => Tours::img('white-island', 1, 1200),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'tours-index',
            'breadcrumb'  => [$this->crumb('Day trips', '/tours')],
            'seoNodes'    => [
                Seo::itemList('Day trips from Sharm el-Sheikh', array_map(function ($tour) {
                    return ['name' => $tour['title'], 'url' => '/tours/' . $tour['slug']];
                }, $all)),
                Seo::faq(Site::faq()),
            ],
        ]);
    }

    public function show(Request $request, $slug = null)
    {
        $tour  = Tours::find((string) $slug);

        if (!$tour) {
            abort(404, 'That trip does not exist.');
        }

        $shots  = $tour['gallery'];
        $folder = $tour['folder'];
        $hero   = $shots ? $shots[0] : Tours::cover(1);
        $url    = '/tours/' . $tour['slug'];
        $type   = $tour['category'] === 'transfer' ? 'transfer' : 'day trip';

        $seoTitle = isset($tour['seo_title']) && $tour['seo_title']
            ? $tour['seo_title']
            : sprintf('%s — %s in Sharm el-Sheikh', $tour['title'], $type === 'transfer' ? 'transfer' : 'day trip');

        $seoDescription = isset($tour['seo_description']) && $tour['seo_description']
            ? $tour['seo_description']
            : sprintf('%s %s. %s %s. Hotel pick-up included; free cancellation up to 24 hours.',
                $tour['strap'], $type, $tour['title'], strtolower($tour['duration']));

        return $this->view('tours.show', [
            'title'         => $seoTitle,
            'description'   => $seoDescription,
            'tour'          => $tour,
            'folder'        => $folder,
            'heroImage'     => Drive::img($hero, 1800, $shots ? $folder : Tours::ROOT_FOLDER),
            'heroAlt'       => $shots ? Tours::alt($tour['slug'], 0) : 'The Gulf of Aqaba from a Sharm el-Sheikh boat',
            'clips'         => array_map(function ($video) use ($folder, $tour) {
                return [
                    'embed' => Drive::embed($video, $folder),
                    'file'  => Drive::file($video, $folder),
                    'name'  => Drive::label($video),
                    'raw'   => $video,
                    'alt'   => $tour['title'] . ' film',
                ];
            }, $tour['video']),
            'gallery'       => array_map(function ($shot) use ($folder, $tour) {
                $index = array_search($shot, $tour['gallery'], true);

                return [
                    'src'  => Drive::img($shot, 1350, $folder),
                    'full' => Drive::full($shot, $folder),
                    'alt'  => Tours::alt($tour['slug'], (int) $index),
                ];
            }, $shots),
            'related'       => Tours::related($tour['slug'], 3),
            'categoryLabel' => isset(Tours::CATEGORIES[$tour['category']]) ? Tours::CATEGORIES[$tour['category']] : '',
            'ogImage'       => Drive::img($hero, 1200, $shots ? $folder : Tours::ROOT_FOLDER),
            'headerTheme'   => 'transparent',
            'bodyClass'     => 'tour',
            'breadcrumb'    => [
                $this->crumb('Day trips', '/tours'),
                $this->crumb($tour['title'], $url),
            ],
            'seoNodes'      => array_merge(
                [
                    Seo::trip($tour),
                    Seo::breadcrumb(array_merge(
                        [['name' => 'Home', 'url' => '/'], ['name' => 'Day trips', 'url' => '/tours']],
                        [['name' => $tour['title'], 'url' => $url]]
                    )),
                ],
                $tour['video'] ? Seo::videos($tour['video'], $folder, $tour['title']) : []
            ),
        ]);
    }

    /** /films — the promo reel folder, straight from Drive. */
    public function films(Request $request)
    {
        $films = Tours::films();
        $first = isset($films['gallery'][0]) ? $films['gallery'][0] : Tours::cover(1);

        return $this->view('tours.films', [
            'title'       => 'Trip films from Sharm el-Sheikh',
            'description' => 'Films shot on our own days out of Sharm el-Sheikh — reef boats and snorkelling, quads and camels in the foothills, dolphins and the Colored Canyon.',
            'hero'        => [
                'eyebrow' => 'watch before you book',
                'title'   => 'films from the trips',
                'lede'    => 'Shot on phones and action cams by the guides who run the days, kept in one folder, and put here without being cut to death.',
                'image'   => Drive::img($first, 1800, $films['folder']),
                'alt'     => 'Still from a Sharm el-Sheikh trip film',
            ],
            'films'       => [
                'folder'  => $films['folder'],
                'video'   => array_map(function ($clip) use ($films) {
                    return [
                        'embed' => Drive::embed($clip, $films['folder']),
                        'file'  => Drive::file($clip, $films['folder']),
                        'name'  => Drive::label($clip),
                        'raw'   => $clip,
                    ];
                }, $films['video']),
                'gallery' => array_map(function ($shot) use ($films) {
                    return ['src' => Drive::img($shot, 1350, $films['folder']), 'alt' => Drive::label($shot) ?: 'Sharm el-Sheikh'];
                }, $films['gallery']),
            ],
            'ogImage'     => Drive::img($first, 1200, $films['folder']),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'films',
            'breadcrumb'  => [$this->crumb('Films', '/films')],
            'seoNodes'    => array_merge(
                [Seo::breadcrumb([['name' => 'Home', 'url' => '/'], ['name' => 'Films', 'url' => '/films']])],
                Seo::videos($films['video'], $films['folder'], 'Sharm el-Sheikh trip')
            ),
        ]);
    }
}
