<?php

namespace App\Http\Controllers;

use App\Support\Repo;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    /** /destinations — the index grid. */
    public function index(Request $request)
    {
        return $this->view('destinations.index', [
            'title'       => 'Destinations | Fitzroy Travel',
            'description' => 'Kenya, Tanzania, Uganda, Rwanda, Botswana, Namibia and Zimbabwe — the countries we plan trips in, and what each one is really like.',
            'hero'        => [
                'eyebrow' => 'our destinations',
                'title'   => 'a world of wonder awaits you',
                'lede'    => 'Discover the destinations we know intimately, each shaped by its own character, culture and landscape. Within every country lies a depth that rewards those willing to look beyond the obvious.',
                'body'    => 'From the Okavango Delta to the northern conservancies of Kenya, the highlands and national parks of Zimbabwe and the remote landscape of Karamoja, we handle the complexity behind the scenes so you can concentrate on the experience.',
                'image'   => Repo::THEME . '/picks/destinations-hero-24cc6a6b-sq-1200.webp',
            ],
            'numberOrder' => ['zimbabwe' => '01', 'uganda' => '02', 'rwanda' => '03', 'tanzania' => '04', 'botswana' => '05', 'namibia' => '06', 'kenya' => '07'],
        ]);
    }

    /** /kenya, /tanzania, … */
    public function show(Request $request, $slug = null)
    {
        $destination = Repo::destination((string) $slug);

        if (!$destination) {
            abort(404, 'That destination does not exist.');
        }

        $index = array_search($slug, array_column(Repo::destinations(), 'slug'), true);
        $all   = Repo::destinations();
        $next  = $all[($index + 1) % count($all)];

        return $this->view('destinations.show', [
            'title'        => ucfirst($destination['name']) . ' luxury safari | Fitzroy Travel',
            'description'  => $destination['intro'],
            'destination'  => $destination,
            'neighbour'    => $next,
            'headerTheme'  => 'transparent',
            'bodyClass'    => 'destination',
            'itinerary'    => $destination['itinerary'] ? Repo::itinerary($destination['itinerary']) : null,
            'months'       => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ]);
    }
}
