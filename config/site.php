<?php

/**
 * Site-wide configuration — brand, contact, navigation, media.
 *
 * Read through config('site.*') — works identically in the bundled
 * micro-kernel (tools/micro) and in a real Laravel install, because Laravel
 * resolves config('site.x') to this same file.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  THE SIX THINGS TO FILL IN before the site goes live. Anything left empty
 *  is hidden on the pages rather than shown as a placeholder, so you can ship
 *  with only some of them set:
 *
 *   site.url          your real domain, for canonical + sitemap + JSON-LD
 *   contact.email     booking inbox
 *   contact.phone     the number guests call (also used for WhatsApp)
 *   contact.whatsapp  shown as its own button when set
 *   contact.social    Instagram / Facebook / TikTok handles
 *   contact.address   office address, used in LocalBusiness markup
 * ─────────────────────────────────────────────────────────────────────────
 */

return [
    'name'    => 'Brothers Sharm Tour',
    'legal_name' => env('SITE_LEGAL_NAME', ''),      // e.g. "Brothers Sharm Tour for Tourism"
    'published'  => '2026-09-23',                     // date the media folder was assembled
    'logo_word' => 'BROTHERS',
    'logo_sub'  => 'sharm tour',

    /* Canonical base URL. Empty = derived from the request (local dev). */
    'url' => env('APP_URL', ''),

    'tagline'     => 'Sharm el-Sheikh day trips, reef boats and private transfers',
    /* Meta + og description: kept inside ~155 characters so it is not truncated in SERPs. */
    'description' => 'Twenty day trips out of Sharm el-Sheikh, run by the guides who lead them: reef boats, quads and camels, dolphins, the Colored Canyon, Cairo and private transfers. Pick-up included.',

    /* The longer form, used on the About page and in structured data. */
    'description_long' => 'Twenty day trips run out of Naama Bay by the people who lead them: reef and snorkelling boats to Tiran and Ras Mohammed, White Island, quads and camels in the foothills, the Colored Canyon, dolphins, Cairo by air, and private airport transfers. Hotel pick-up included, free cancellation up to 24 hours.',

    'contact' => [
        'email'    => env('SITE_EMAIL', ''),
        'phone'    => [
            'label' => env('SITE_PHONE_LABEL', ''),   // e.g. "+20 100 000 0000"
            'tel'   => env('SITE_PHONE', ''),         // e.g. "+201000000000"
        ],
        'whatsapp' => env('SITE_WHATSAPP', ''),       // digits only, e.g. "201000000000"
        'hours'    => '7:00 – 23:00, Sharm time (GMT+2/+3)',
        'address_lines' => [
            'Naama Bay',
            'Sharm el-Sheikh',
            'South Sinai, Egypt',
        ],
        'social' => [
            ['label' => 'Instagram', 'url' => env('SITE_INSTAGRAM', '')],
            ['label' => 'Facebook',  'url' => env('SITE_FACEBOOK', '')],
            ['label' => 'WhatsApp',  'url' => env('SITE_WHATSAPP', '') ? 'https://wa.me/' . preg_replace('/\D/', '', env('SITE_WHATSAPP')) : ''],
        ],
        /* Badges are service facts, not review scores — keep them true. */
        'assurances' => [
            'Free cancellation up to 24h before pick-up',
            'Hotel pick-up included on every trip',
            'English & Arabic speaking guides',
            'Pay on the day, nothing charged at booking',
        ],
    ],

    /*
    | Excursion media (Google Drive)
    |------------------------------
    | /tours, /films and every page photograph on this site come from one Drive
    | folder, one sub-folder per trip. In 'drive' mode the files are hot-linked
    | from Drive, which means the folder must be shared as "Anyone with the
    | link — Viewer". Set DRIVE_MODE=local and copy the folder into
    | public/img/tours to self-host it instead.
    */
    'drive' => [
        'mode'       => env('DRIVE_MODE', 'drive'),
        'folder'     => '1xbeKOA-j7HGA3AnxhSKZrFVb2YovoH-Y',
        'folder_url' => 'https://drive.google.com/drive/folders/1xbeKOA-j7HGA3AnxhSKZrFVb2YovoH-Y',
        'local_base' => env('DRIVE_LOCAL_BASE', '/img/tours'),
    ],

    /*
    | Local fallback for non-Drive static files (favicon, og image). Everything
    | photographic lives in Drive, so this only matters if you add your own.
    */
    'asset_base' => env('ASSET_BASE', '/img'),

    'nav' => [
        [
            'label' => 'Day trips',
            'url'   => '/tours',
            'children' => [
                ['label' => 'All 20 trips', 'url' => '/tours'],
                ['label' => 'Sea & reef', 'url' => '/tours?category=sea'],
                ['label' => 'Desert & mountains', 'url' => '/tours?category=desert'],
                ['label' => 'Adrenaline', 'url' => '/tours?category=adrenaline'],
                ['label' => 'Dolphins & family', 'url' => '/tours?category=family'],
                ['label' => 'Cairo & culture', 'url' => '/tours?category=culture'],
                ['label' => 'Private transfers', 'url' => '/tours?category=transfer'],
                ['label' => 'Films', 'url' => '/films'],
            ],
        ],
        /*
         * The Packages item always exists; the dropdown under it only appears
         * once App\Support\Packages::all() has rows, so nothing links to a
         * package that has not been written yet.
         */
        array_merge(
            ['label' => 'Packages', 'url' => '/packages'],
            \App\Support\Packages::has()
                ? ['children' => array_map(function ($package) {
                    return ['label' => $package['name'], 'url' => '/packages/' . $package['slug']];
                }, \App\Support\Packages::featured(4))]
                : []
        ),
        [
            'label' => 'Places',
            'url'   => '/areas',
            'children' => [
                ['label' => 'Naama Bay', 'url' => '/areas/naama-bay'],
                ['label' => 'Ras Mohammed', 'url' => '/areas/ras-mohammed'],
                ['label' => 'Tiran & the strait', 'url' => '/areas/tiran-strait'],
                ['label' => 'Old Town & the souq', 'url' => '/areas/sharm-old-town'],
                ['label' => 'Foothills & canyon', 'url' => '/areas/sinai-backcountry'],
                ['label' => 'Cairo & Giza', 'url' => '/areas/cairo'],
            ],
        ],
        [
            'label' => 'Guides',
            'url'   => '/guides',
            'children' => [
                ['label' => 'Best time to visit', 'url' => '/guides/best-time-to-visit-sharm-el-sheikh'],
                ['label' => 'Sharm with children', 'url' => '/guides/sharm-el-sheikh-with-children'],
                ['label' => 'Ras Mohammed or Tiran', 'url' => '/guides/ras-mohammed-or-tiran'],
                ['label' => 'Cairo in a day', 'url' => '/guides/one-day-in-cairo-from-sharm'],
                ['label' => 'Booking FAQ', 'url' => '/faq'],
            ],
        ],
        ['label' => 'How it works', 'url' => '/how-it-works'],
        ['label' => 'About', 'url' => '/about'],
    ],

    'footer_nav' => [
        'Trips' => [
            ['label' => 'All day trips', 'url' => '/tours'],
            ['label' => 'Sea & reef', 'url' => '/tours?category=sea'],
            ['label' => 'Desert & mountains', 'url' => '/tours?category=desert'],
            ['label' => 'Dolphins & family', 'url' => '/tours?category=family'],
            ['label' => 'Private transfers', 'url' => '/tours?category=transfer'],
            ['label' => 'Trip packages', 'url' => '/packages'],
            ['label' => 'Films', 'url' => '/films'],
        ],
        'Places' => [
            ['label' => 'Naama Bay', 'url' => '/areas/naama-bay'],
            ['label' => 'Ras Mohammed', 'url' => '/areas/ras-mohammed'],
            ['label' => 'Tiran & the strait', 'url' => '/areas/tiran-strait'],
            ['label' => 'Old Town & the souq', 'url' => '/areas/sharm-old-town'],
            ['label' => 'Cairo & Giza', 'url' => '/areas/cairo'],
        ],
        'Know before you go' => [
            ['label' => 'Best time to visit', 'url' => '/guides/best-time-to-visit-sharm-el-sheikh'],
            ['label' => 'Travelling with children', 'url' => '/guides/sharm-el-sheikh-with-children'],
            ['label' => 'What to pack for a boat day', 'url' => '/guides/what-to-pack-for-a-red-sea-boat-day'],
            ['label' => 'Booking FAQ', 'url' => '/faq'],
            ['label' => 'How it works', 'url' => '/how-it-works'],
        ],
        'Company' => [
            ['label' => 'About us', 'url' => '/about'],
            ['label' => 'Contact', 'url' => '/contact'],
            ['label' => 'Booking terms', 'url' => '/booking-terms'],
            ['label' => 'Cancellation & refunds', 'url' => '/cancellation-policy'],
            ['label' => 'Privacy', 'url' => '/privacy-policy'],
        ],
    ],

    /* Dialling codes for the enquiry form: Egypt first, then main source markets. */
    'dial_codes' => [
        ['name' => 'Egypt', 'code' => '+20'],
        ['name' => 'United Kingdom', 'code' => '+44'],
        ['name' => 'Germany', 'code' => '+49'],
        ['name' => 'Italy', 'code' => '+39'],
        ['name' => 'France', 'code' => '+33'],
        ['name' => 'Poland', 'code' => '+48'],
        ['name' => 'Czechia', 'code' => '+420'],
        ['name' => 'Netherlands', 'code' => '+31'],
        ['name' => 'Ukraine', 'code' => '+380'],
        ['name' => 'Türkiye', 'code' => '+90'],
        ['name' => 'Saudi Arabia', 'code' => '+966'],
        ['name' => 'United Arab Emirates', 'code' => '+971'],
        ['name' => 'Kuwait', 'code' => '+965'],
        ['name' => 'United States', 'code' => '+1'],
        ['name' => 'Canada', 'code' => '+1'],
        ['name' => 'Australia', 'code' => '+61'],
    ],
];
