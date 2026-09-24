<?php

namespace App\Support;

/**
 * Packages — bundled trips with a single price (a week, a honeymoon, a family
 * fortnight). This file is deliberately EMPTY: the site renders the /packages
 * page with a designed placeholder until rows appear here, and the homepage
 * band stays hidden until then. Nothing else needs touching.
 *
 * ---------------------------------------------------------------------------
 * SHAPE — copy one of these into all() and fill it in.
 * ---------------------------------------------------------------------------
 *   [
 *       'slug'        => 'reef-and-desert-week',      // /packages/reef-and-desert-week
 *       'name'        => 'The Reef & Desert Week',     // headline on the card
 *       'strap'       => 'Seven days, five trips, one price.',   // one line
 *       'lede'        => 'Two reef days, a desert evening, the Colored Canyon and White Island, in the order that suits the weather.',
 *       'days'        => 7,
 *       'nights'      => 6,
 *       'people'      => '2 – 6',        // group size the price assumes
 *       'price'       => 480,            // number, or null for "price on request"
 *       'currency'    => 'USD',
 *       'unit'        => 'person',       // 'person' | 'group' | 'night'
 *       'badge'       => 'best value',   // small pill on the card, optional
 *       'featured'    => true,           // the middle card, sized up on home
 *       'tone'        => 'sand',         // 'sand' | 'ink' | 'clay' — card palette
 *       'trips'       => ['tiran-island-snorkelling', 'bedouin-safari', 'colored-canyon'],  // slugs from Tours.php
 *       'included'    => ['All hotel pick-up from Naama Bay', 'Two reef days with lunch', 'Quad evening with dinner'],
 *       'excluded'    => ['Flights', 'Anything not listed above'],
 *       'notes'       => 'Runs March to November. Swap any day for another at no charge up to 24 hours before.',
 *       'seo_title'       => 'optional — overrides the generated <title>',
 *       'seo_description' => 'optional — overrides the generated meta description',
 *   ]
 *
 * `trips` must be slugs that exist in Tours.php: the package page links them,
 * and structured data lists them as the items of the bundle.
 */
class Packages
{
    /** Every package, in the order they should be shown. */
    public static function all()
    {
        return [];
    }

    /** Is there anything to show at all? Gates the homepage band. */
    public static function has()
    {
        return count(self::all()) > 0;
    }

    /**
     * The cards for the homepage band, falling back to whatever exists so a
     * single package still fills the row sensibly.
     */
    public static function featured($limit = 3)
    {
        $all = self::all();
        $pick = array_values(array_filter($all, function ($p) {
            return ! empty($p['featured']);
        }));

        if (count($pick) < 2) {
            $pick = $all;
        }

        return array_slice($pick, 0, max(1, (int) $limit));
    }

    public static function find($slug)
    {
        foreach (self::all() as $package) {
            if ($package['slug'] === $slug) {
                return $package;
            }
        }

        return null;
    }

    /** Which packages a given trip belongs to — used on the trip page. */
    public static function forTrip($slug)
    {
        return array_values(array_filter(self::all(), function ($package) use ($slug) {
            return in_array($slug, $package['trips'] ?? [], true);
        }));
    }

    /* ------------------------------------------------------------------ text */

    /** Page intro, so the copy lives with the data rather than in a template. */
    public static function intro()
    {
        return [
            'eyebrow' => 'packages',
            'title'   => 'weeks, not just days',
            'lede'    => 'A package is the same set of trips you would book one at a time, arranged so the sea day and the desert day land on the days they suit, at one price for the week.',
        ];
    }

    public static function emptyNote()
    {
        return [
            'title' => 'being written now',
            'body'  => 'The day trips are all bookable today — the bundled weeks are being priced with the boats and the drivers for the coming season, and they will land here as soon as they are settled. In the meantime, send us your dates and the days you want and we will build the week with you and quote it as one number.',
        ];
    }

    /** What a package always contains, listed on the index page. */
    public static function alwaysIncluded()
    {
        return [
            ['t' => 'Hotel pick-up, every day', 'p' => 'From anywhere in Naama Bay, Shark’s Bay, Soho Square or the Old Town, at the hour that suits the boat.'],
            ['t' => 'One price for the week', 'p' => 'Not a trip-by-trip total with a discount word attached to it.'],
            ['t' => 'Days move, free', 'p' => 'If the sea is flat on your reef day and rough on the canyon, we swap them.'],
            ['t' => 'The same people', 'p' => 'The guide who answers your message is the one who collects you.'],
        ];
    }

    /* ----------------------------------------------------------------- money */

    /**
     * "from 480 USD per person" / "1,150 USD for the car" / "price on request" — the same
     *     phrasing Tours.php uses for single trips, so the two never read differently.
     */
    public static function price($package)
    {
        if (empty($package['price'])) {
            return 'Price on request';
        }

        $number = number_format((float) $package['price']);
        $currency = $package['currency'] ?? 'USD';
        $unit = $package['unit'] ?? 'person';

        $per = ['person' => 'per person', 'group' => 'for the group', 'night' => 'per night', 'cabin' => 'per cabin'];
        $label = isset($per[$unit]) ? $per[$unit] : $unit;

        return 'from ' . $number . ' ' . $currency . ' ' . $label;
    }

    /** Short form for a card corner. */
    public static function priceShort($package)
    {
        if (empty($package['price'])) {
            return 'on request';
        }

        return number_format((float) $package['price']) . ' ' . ($package['currency'] ?? 'USD');
    }

    public static function length($package)
    {
        $days = ! empty($package['days']) ? (int) $package['days'] : null;
        $nights = ! empty($package['nights']) ? (int) $package['nights'] : null;

        if ($days && $nights) {
            return $days . ' days / ' . $nights . ' nights';
        }

        if ($days) {
            return $days . ($days === 1 ? ' day' : ' days');
        }

        return '';
    }

    /** Trips inside the package, resolved to full rows for rendering. */
    public static function tripsIn($package)
    {
        $trips = $package['trips'] ?? [];

        /* Accept either shape: a plain list of slugs, or 'slug' => day-number. Both end up
           ordered and keyed from zero, so the day numbers on the package page are right
           whichever way the row is written. */
        $keys = array_keys($trips);
        if ($trips && is_string($keys[0])) {
            $trips = $keys;
        }

        return array_values(Tours::in(array_values($trips)));
    }
}
