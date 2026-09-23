<?php

namespace App\Http\Controllers;

use App\Support\Repo;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        return $this->view('home.index', [
            'title'        => 'Tailor-made luxury African safaris | Fitzroy Travel',
            'description' => config('site.description'),
            'bodyClass'    => 'home',
            'headerTheme'  => 'transparent',
            'hero'         => Repo::hero(),
            'intro'        => Repo::intro(),
            'operating'    => Repo::operatingLede(),
            'why'          => Repo::whyFitzroy(),
            'featured'     => array_values(array_filter(Repo::itineraries(), function ($i) {
                return $i['slug'] === 'botswana-helicopters-through-the-delta';
            })),
        ]);
    }
}
