<?php

namespace App\Http\Controllers;

use App\Support\Repo;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function process(Request $request)
    {
        return $this->view('pages.process', [
            'title'       => 'Our process | Fitzroy Travel',
            'description' => 'How a Fitzroy safari is built: a conversation first, then the boring parts handled properly, then someone on call while you travel.',
            'hero'        => [
                'eyebrow' => 'travelling with fitzroy',
                'title'   => 'our process',
                'lede'    => 'Creating the right safari takes time, careful planning and a clear understanding of what matters most to you.',
                'image'   => Repo::THEME . '/ophero-mobile.webp',
            ],
            'bodyClass'   => 'process',
        ]);
    }

    public function about(Request $request)
    {
        return $this->view('pages.about', [
            'title'       => 'About us | Fitzroy Travel',
            'description' => 'A small, completely independent tour operator building immersive journeys into remote parts of Africa.',
            'hero'        => [
                'eyebrow' => 'about fitzroy',
                'title'   => 'the team behind the adventures',
                'image'   => Repo::THEME . '/auteam-paul-2026.webp',
            ],
            'team'        => Repo::team(),
            'bodyClass'   => 'about',
        ]);
    }

    public function team(Request $request, $slug = null)
    {
        $member = Repo::member((string) $slug);

        if (!$member) {
            abort(404, 'No team member at that address.');
        }

        return $this->view('pages.team', [
            'title'       => $member['name'] . ' | Fitzroy Travel',
            'description' => $member['blurb'],
            'member'      => $member,
            'team'        => Repo::team(),
            'bodyClass'   => 'team-member',
        ]);
    }

    public function stories(Request $request)
    {
        return $this->view('pages.stories', [
            'title'       => 'Stories | Fitzroy Travel',
            'description' => 'Field notes, planning guides and logistics explainers from the team.',
            'hero'        => [
                'eyebrow' => 'from the team',
                'title'   => 'stories & field notes',
                'lede'    => 'Notes written between trips: what a season really does to an itinerary, what a bed-night funds, and what to pack for a walk.',
                'image'   => '/uploads/2026/06/african-elephant-b96130-sq.webp',
            ],
            'stories'     => Repo::stories(),
            'bodyClass'   => 'stories',
        ]);
    }

    public function story(Request $request, $slug = null)
    {
        $stories = Repo::stories();
        $story   = $stories[(int) $slug] ?? null;

        if (!$story) {
            abort(404, 'No story at that address.');
        }

        return $this->view('pages.story', [
            'title'       => $story['title'] . ' | Fitzroy Travel',
            'description' => $story['excerpt'],
            'story'       => $story,
            'stories'     => array_values(array_filter($stories, function ($s) use ($story) {
                return $s['title'] !== $story['title'];
            })),
            'bodyClass'   => 'story',
        ]);
    }

    public function legal(Request $request, $slug = null)
    {
        $slug = $slug ?: trim(parse_url($request->url(), PHP_URL_PATH), '/');
        $page = config('site') ? Repo::legal()[$slug] ?? null : null;

        if (!$page) {
            abort(404, 'No policy at that address.');
        }

        return $this->view('pages.legal', [
            'title'       => $page['title'] . ' | Fitzroy Travel',
            'description' => $page['lede'],
            'page'        => $page,
            'slug'        => $slug,
            'bodyClass'   => 'legal',
        ]);
    }
}
