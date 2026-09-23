<?php

namespace App\Http\Controllers;

use App\Support\Repo;

/**
 * Base controller: page furniture shared by every view (nav, footer, brand).
 */
class Controller
{
    protected function view($name, array $data = [])
    {
        return view($name, $this->share($data));
    }

    protected function share(array $data)
    {
        return array_merge([
            'site'        => config('site'),
            'nav'         => config('site.nav'),
            'contact'     => config('site.contact'),
            'footerNav'   => config('site.footer_nav'),
            'destinations' => Repo::destinations(),
            'itineraries' => Repo::itineraries(),
            'quote'       => Repo::quote(),
            'approach'    => Repo::approach(),
            'process'     => Repo::process(),
            'bodyClass'   => '',
            'headerTheme' => 'light',
        ], $data);
    }
}
