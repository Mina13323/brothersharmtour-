<?php

/**
 * Site-wide configuration.
 *
 * Read through config('site.*') — works identically in the bundled
 * micro-kernel (tools/micro) and in a real Laravel install, because Laravel
 * resolves config('site.x') to this same file.
 */

return [
    'name'        => 'Fitzroy Travel',
    'tagline'     => 'Tailor-made luxury African safaris',
    'description' => 'Bespoke safaris in Kenya, Tanzania, Uganda, Rwanda, Botswana, Namibia and Zimbabwe, planned by people who have stayed at the lodges.',

    /*
    | Asset base
    |----------
    | The clone hot-links the live site's photography so the design reads
    | exactly like the original. Point this at a local folder (e.g. '/img')
    | after downloading the assets, or at your own CDN.
    */
    'asset_base' => env('ASSET_BASE', 'https://fitzroy-travel.com/wp-content'),

    'contact' => [
        'email'   => 'enquiries@fitzroy-travel.com',
        'phone_us' => ['label' => '+1 585 505 6307', 'tel' => '+15855056307'],
        'phone_uk' => ['label' => '+44 1273 074 734', 'tel' => '+441273074734'],
        'address_lines' => [
            'Studio 8, Beaconsfield Studios',
            '25 Ditchling Rise',
            'Brighton, BN1 4QL',
            'United Kingdom',
        ],
        'reviews' => [
            'label' => 'rated five stars by our clients',
            'url'   => 'https://www.reviews.io/company-reviews/store/fitzroy-travel.com',
            'logo'  => '/themes/cbd/img/v2/reviewsio-logo.svg',
        ],
        'social' => [
            ['label' => 'Facebook', 'url' => 'https://www.facebook.com/Fitzroytravel/'],
            ['label' => 'Instagram', 'url' => 'https://www.instagram.com/fitzroytravel/'],
        ],
    ],

    'nav' => [
        [
            'label' => 'Destinations',
            'url'   => '/destinations',
            'children' => [
                ['label' => 'Zimbabwe', 'url' => '/zimbabwe'],
                ['label' => 'Uganda', 'url' => '/uganda'],
                ['label' => 'Rwanda', 'url' => '/rwanda'],
                ['label' => 'Tanzania', 'url' => '/tanzania'],
                ['label' => 'Namibia', 'url' => '/namibia'],
                ['label' => 'Botswana', 'url' => '/botswana'],
                ['label' => 'Kenya', 'url' => '/kenya'],
            ],
        ],
        [
            'label' => 'Ideas & Inspiration',
            'url'   => '/inspiration',
            'children' => [
                ['label' => 'Browse Safaris', 'url' => '/inspiration'],
                ['label' => 'Articles', 'url' => '/stories'],
            ],
        ],
        ['label' => 'Our process', 'url' => '/our-process'],
        ['label' => 'About us', 'url' => '/about-us'],
    ],

    'footer_nav' => [
        'Company' => [
            ['label' => 'About us', 'url' => '/about-us'],
            ['label' => 'Our process', 'url' => '/our-process'],
            ['label' => 'Stories', 'url' => '/stories'],
            ['label' => 'Contact us', 'url' => '/contact-us'],
        ],
        'Destinations' => [
            ['label' => 'Kenya', 'url' => '/kenya'],
            ['label' => 'Tanzania', 'url' => '/tanzania'],
            ['label' => 'Uganda', 'url' => '/uganda'],
            ['label' => 'Rwanda', 'url' => '/rwanda'],
            ['label' => 'Botswana', 'url' => '/botswana'],
            ['label' => 'Namibia', 'url' => '/namibia'],
            ['label' => 'Zimbabwe', 'url' => '/zimbabwe'],
        ],
        'Legal' => [
            ['label' => 'Financial protection', 'url' => '/financial-protection'],
            ['label' => 'Privacy policy', 'url' => '/privacy-policy'],
            ['label' => 'Terms & conditions', 'url' => '/terms-conditions'],
        ],
    ],

    /* Country dialling codes used by the enquiry form. */
    'dial_codes' => [
        ['name' => 'United Kingdom', 'code' => '+44'],
        ['name' => 'United States', 'code' => '+1'],
        ['name' => 'Canada', 'code' => '+1'],
        ['name' => 'Australia', 'code' => '+61'],
        ['name' => 'United Arab Emirates', 'code' => '+971'],
        ['name' => 'Germany', 'code' => '+49'],
        ['name' => 'Switzerland', 'code' => '+41'],
        ['name' => 'Netherlands', 'code' => '+31'],
        ['name' => 'France', 'code' => '+33'],
        ['name' => 'Italy', 'code' => '+39'],
        ['name' => 'Spain', 'code' => '+34'],
        ['name' => 'Kenya', 'code' => '+254'],
        ['name' => 'Tanzania', 'code' => '+255'],
        ['name' => 'Uganda', 'code' => '+256'],
        ['name' => 'Rwanda', 'code' => '+250'],
        ['name' => 'Botswana', 'code' => '+267'],
        ['name' => 'Namibia', 'code' => '+264'],
        ['name' => 'Zimbabwe', 'code' => '+263'],
        ['name' => 'South Africa', 'code' => '+27'],
        ['name' => 'Singapore', 'code' => '+65'],
    ],
];
