<?php

namespace App\Http\Controllers;

use App\Support\Drive;
use App\Support\Tours;
use Illuminate\Http\Request;

/**
 * Day trips and excursions — /tours, /tours/{slug} and /films.
 *
 * Content lives in App\Support\Tours; the media itself stays in Google Drive
 * and is addressed through App\Support\Drive, so every hero/gallery value
 * handed to a view is already a resolvable URL (never a bare Drive id).
 */
class TourController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->get('category');
        $all      = Tours::filtered($category ? (string) $category : null);

        return $this->view('tours.index', [
            'title'       => 'Day trips & excursions | Fitzroy Travel',
            'description' => 'Boat days on the reef, quads and camels in the foothills, dolphin programs and private transfers — every trip we run out of Sharm el-Sheikh, with the photographs our own guides took.',
            'hero'        => [
                'eyebrow' => 'sharm el-sheikh & south sinai',
                'title'   => 'twenty ways to spend a day',
                'lede'    => 'Reef trips, desert evenings, Cairo by air, and the transfers in between. All of them run with people we work with, and all of them can be changed — a private boat, a later start, a guide who speaks your language.',
                'image'   => Drive::img(Tours::cover(), 1800, Tours::ROOT_FOLDER),
                'credit'  => 'Photography from our own trips',
            ],
            'tours'       => $all,
            'categories'  => Tours::categories(),
            'active'      => $category,
            'ogImage'     => Drive::img(Tours::cover(), 1200, Tours::ROOT_FOLDER),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'tours-index',
        ]);
    }

    public function show(Request $request, $slug = null)
    {
        $tour  = Tours::find((string) $slug);
        $shots = $tour ? $tour['gallery'] : [];

        if (!$tour) {
            abort(404, 'That trip does not exist.');
        }

        $folder = $tour['folder'];
        $hero   = $shots ? $shots[0] : Tours::cover(1);

        return $this->view('tours.show', [
            'title'         => $tour['title'] . ' | Fitzroy Travel',
            'description'   => $tour['lede'],
            'tour'          => $tour,
            'folder'        => $folder,
            'heroImage'     => Drive::img($hero, 1800, $shots ? $folder : Tours::ROOT_FOLDER),
            'gallery'       => array_map(function ($shot) use ($folder) {
                return ['src' => Drive::img($shot, 1350, $folder), 'full' => Drive::full($shot, $folder), 'alt' => Drive::label($shot)];
            }, $shots),
            'clips'         => array_map(function ($video) use ($folder) {
                return ['embed' => Drive::embed($video, $folder), 'file' => Drive::file($video, $folder), 'name' => Drive::label($video)];
            }, $tour['video']),
            'related'       => Tours::related($tour['slug'], 3),
            'categoryLabel' => isset(Tours::CATEGORIES[$tour['category']]) ? Tours::CATEGORIES[$tour['category']] : '',
            'ogImage'       => Drive::img($hero, 1200, $shots ? $folder : Tours::ROOT_FOLDER),
            'headerTheme'   => 'transparent',
            'bodyClass'     => 'tour',
        ]);
    }

    /** /films — the promo reel folder, straight from Drive. */
    public function films(Request $request)
    {
        $films = Tours::films();
        $first = isset($films['gallery'][0]) ? $films['gallery'][0] : Tours::cover(1);

        return $this->view('tours.films', [
            'title'       => 'Films | Fitzroy Travel',
            'description' => 'Clips shot on our own trips around Sharm el-Sheikh — the reef, the desert, the canyon and the boats.',
            'hero'        => [
                'eyebrow' => 'watch before you book',
                'title'   => 'films from the trips',
                'lede'    => 'Shot on phones and action cams by the guides who run the days, kept in one folder, and put here without being cut to death.',
                'image'   => Drive::img($first, 1800, $films['folder']),
            ],
            'films'       => [
                'folder'  => $films['folder'],
                'video'   => array_map(function ($clip) use ($films) {
                    return ['embed' => Drive::embed($clip, $films['folder']), 'file' => Drive::file($clip, $films['folder']), 'name' => Drive::label($clip)];
                }, $films['video']),
                'gallery' => array_map(function ($shot) use ($films) {
                    return ['src' => Drive::img($shot, 1350, $films['folder']), 'alt' => Drive::label($shot)];
                }, $films['gallery']),
            ],
            'headerTheme' => 'transparent',
            'bodyClass'   => 'films',
        ]);
    }
}
