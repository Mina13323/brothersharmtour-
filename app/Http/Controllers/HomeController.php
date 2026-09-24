<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        return $this->view('home.index', [
            'title'       => 'Sharm el-Sheikh day trips & reef boats',
            'description' => config('site.description'),
            'hero'        => Site::hero(),
            'intro'       => Site::intro(),
            'operating'   => Site::operating(),
            'why'         => Site::why(),
            'tours'       => Tours::featured(6),
            'featured'    => array_slice(Tours::all(), 0, 1),
            'headerTheme' => 'transparent',
            'bodyClass'   => 'home',
            'breadcrumb'  => [],
            'seoNodes'    => [
                Seo::website(),
                Seo::itemList('Day trips from Sharm el-Sheikh', array_map(function ($tour) {
                    return ['name' => $tour['title'], 'url' => '/tours/' . $tour['slug']];
                }, Tours::featured(6))),
            ],
        ]);
    }
}
