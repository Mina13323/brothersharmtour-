<?php

namespace App\Http\Controllers;

use App\Support\Repo;
use Illuminate\Http\Request;

class ItineraryController extends Controller
{
    /** /inspiration — the browseable list of sample safaris. */
    public function index(Request $request)
    {
        $country = $request->get('country');
        $all     = Repo::itineraries();

        if ($country) {
            $all = array_values(array_filter($all, function ($i) use ($country) {
                return strcasecmp($i['country'], $country) === 0;
            }));
        }

        return $this->view('itineraries.index', [
            'title'       => 'Ideas & inspiration | Fitzroy Travel',
            'description' => 'Sample safaris, priced and paced the way we would plan them: who meets you, where you sleep, and how long each leg really takes.',
            'hero'        => [
                'eyebrow' => 'ideas & inspiration',
                'title'   => 'six journeys to start from',
                'lede'    => 'Every one of these has been walked, driven and slept in by someone on our team. Use one as a blueprint, or as a list of things to change.',
                'image'   => Repo::THEME . '/picks/home-hiw-249efa41-sq-1272.webp',
            ],
            'itineraries' => $all,
            'countries'   => array_values(array_unique(array_column(Repo::itineraries(), 'country'))),
            'active'      => $country,
        ]);
    }

    /** /sample-itineraries/{slug} */
    public function show(Request $request, $slug = null)
    {
        $itinerary = Repo::itinerary((string) $slug);

        if (!$itinerary) {
            abort(404, 'That safari does not exist.');
        }

        $destination = Repo::destination(strtolower($itinerary['country']));

        return $this->view('itineraries.show', [
            'title'       => $itinerary['country'] . ': ' . $itinerary['title'] . ' | Fitzroy Travel',
            'description' => $itinerary['summary'],
            'itinerary'   => $itinerary,
            'destination' => $destination,
            'related'     => array_values(array_filter(Repo::itineraries(), function ($i) use ($itinerary) {
                return $i['slug'] !== $itinerary['slug'];
            })),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'itinerary',
        ]);
    }
}
