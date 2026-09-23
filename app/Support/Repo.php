<?php

namespace App\Support;

/**
 * Content repository.
 *
 * Everything the views render lives here, so the clone can be driven from
 * flat PHP arrays today and swapped for Eloquent models later without touching
 * a single template.
 */
class Repo
{
    /** Small brand assets, relative to config('site.asset_base'). */
    public const LOGO      = '/uploads/2023/09/logo-gray-black.svg';
    public const THEME     = '/themes/cbd/img/v2';

    /* ---------------------------------------------------------------------
     | Homepage
     |------------------------------------------------------------------ */

    public static function hero(): array
    {
        return [
            'eyebrow'  => 'welcome to fitzroy',
            'title'    => 'journeys to africa',
            'lede'     => 'Our safaris exemplify the qualities of modern adventure travel – remote, exclusive and seamless.',
            'image'    => self::THEME . '/hero-mchenja-desktop-full-1800.webp',
            'credit'   => 'Time + Tide Mchenja',
            'scroll'   => 'scroll to explore',
        ];
    }

    public static function intro(): array
    {
        return [
            'eyebrow' => 'why choose fitzroy?',
            'title'   => 'exclusive journeys and select departures to remote corners of africa',
            'body'    => [
                'We specialise in providing curious travellers with access to regions and communities that would otherwise prove challenging.',
                'We are committed to offering unique travel opportunities, to unusual destinations, that are mutually beneficial to all involved.',
            ],
            'cards' => [
                [
                    'label' => 'Private Safaris',
                    'kicker' => 'tailor made',
                    'image' => self::THEME . '/s2-img1.webp',
                    'alt'   => 'Guide and guests with sundowners at sunset',
                ],
                [
                    'label' => 'Credit: Tawi Lodge',
                    'kicker' => 'lioness in golden grass',
                    'image' => self::THEME . '/s2-img2.webp',
                    'alt'   => 'Lioness yawning in golden grass',
                ],
            ],
        ];
    }

    public static function process(): array
    {
        return [
            'eyebrow' => 'how it works',
            'lede'    => 'Once your journey is underway, we remain on hand to ensure every detail proceeds as planned. Our teams will welcome you at the airport, and accommodations, guides and drivers are briefed on any special requests, interests or occasions.',
            'image'   => self::THEME . '/picks/home-hiw-249efa41-sq-1272.webp',
            'credit'  => 'Olmara Camp',
            'background' => self::THEME . '/hiw-bg-mobile.webp',
            'steps' => [
                [
                    'title' => 'initial consultation',
                    'body'  => 'Our approach begins with a direct conversation. Speaking by phone or meeting in person allows us to explore your travel goals, interests, dates and other considerations on a deeper level.',
                ],
                [
                    'title' => 'preparing for departure',
                    'body'  => 'Once your itinerary is agreed, we handle every arrangement, from flights and permits to transfers and special requests, so that everything is confirmed and in place well before you travel.',
                ],
                [
                    'title' => 'during the journey',
                    'body'  => 'Our teams welcome you on arrival and stay on hand throughout, ensuring accommodations, guides and drivers are briefed and every day unfolds exactly as planned.',
                ],
            ],
        ];
    }

    public static function quote(): array
    {
        return [
            'text'   => 'Fitzroy are true specialists in accessing the wilderness. They know where to go and importantly, when to go there. Highly recommended.',
            'name'   => 'Ed Charles',
            'role'   => 'Bafta & Emmy award winning film producer of BBC’s Planet Earth 2 and A Perfect Planet',
            'badge'  => 'Ed Charles, BBC Producer',
            'image'  => self::THEME . '/quote-ed-mobile.webp',
        ];
    }

    public static function approach(): array
    {
        return [
            'eyebrow' => 'our approach',
            'title'   => 'remote, exclusive & personal',
            'body'    => [
                'Every journey starts with a conversation. We favour a direct, personal approach: understanding your vision before anything else.',
                'Whether by phone or in person, we work with you directly to shape a journey that is both thoughtfully considered and expertly delivered.',
                'Get in touch to start planning yours.',
            ],
            'image'   => self::THEME . '/appr-img-mobile.webp',
        ];
    }

    /* ---------------------------------------------------------------------
     | Destinations
     |------------------------------------------------------------------ */

    public static function destinations(): array
    {
        return [
            [
                'number'  => '01',
                'slug'    => 'kenya',
                'name'    => 'Kenya',
                'strap'   => 'Pioneering tourism models and prolific wildlife, if anywhere were to lay claim of hosting the ‘soul of safari’ it may well be Kenya.',
                'hero'    => '/uploads/2026/06/kicheche-camps-mara-north-conservancy-kenya-activity-dd54c8-scaled.webp',
                'credit'  => 'Kicheche Camps',
                'map'     => '/uploads/2023/09/map-kenya.svg',
                'thumb'   => self::THEME . '/dest-kenya.webp',
                'intro'   => 'Glaciated peaks, open savanna and arid desert inside one country, with the aviation infrastructure and guiding depth to use all of it well.',
                'body'    => [
                    'The Maasai Mara’s grasslands run south into Tanzania without a fence, and well over a million wildebeest follow them; from July to October the herds cross the Mara River in columns. Kenya’s real depth, though, begins north of the reserve.',
                    'In Laikipia and Samburu, community and private conservancies protect reticulated giraffe and Grevy’s zebra found nowhere else. Beyond them, helicopter-portable camps reach the Suguta Valley floor and the jade shoreline of Lake Turkana, while the coast turns to dhow passages between Lamu’s coral-stone alleys.',
                    'More than 160 conservancies now hold land through direct lease payments to the households that live on it, and the model has measurably rebuilt rhino numbers across the country. Where a national reserve gives you a set of tracks open until dusk, an adjacent conservancy gives you night drives, walking safaris and three other vehicles across fifty thousand acres.',
                ],
                'pull'    => 'Perhaps the question is not whether, but which Kenya.',
                'images'  => [
                    '/uploads/2026/06/plains-zebra-e78b92-sq-850x850.webp',
                    '/uploads/2026/09/lewa-wilderness-x-activity-8429a1-sq-850x850.webp',
                    '/uploads/2026/06/people-ddba4b-680x850.webp',
                    '/uploads/2026/06/cheetah-5d4681-1350x844.webp',
                ],
                'months'  => [1, 1, 3, 3, 2, 1, 1, 1, 1, 2, 2, 2],
                'seasons' => 'January and February bring clear skies and tight wildlife viewing before the long rains build from late March. June to October is dry, concentrating animals at water, with the migration filling the Mara from July. November’s short rains green everything and bring migratory birds.',
                'areas' => [
                    ['name' => 'Maasai Mara', 'blurb' => 'A national reserve and the conservancies ringed around it — one ecosystem, two very different sets of rules.', 'image' => '/uploads/2026/07/african-leopard-5b155e-ac-505x850.webp'],
                    ['name' => 'Northern Kenya', 'blurb' => 'An arid frontier of forested sky-islands, community conservancies and the volcanic shores of Lake Turkana.', 'image' => '/uploads/2026/07/kitich-camp-namunyak-conservancy-kenya-activity-5db847-ac-505x850.webp'],
                    ['name' => 'Laikipia Highlands', 'blurb' => 'Private and community conservancies strung across a high plateau north of Mount Kenya.', 'image' => '/uploads/2026/07/white-rhinoceros-5144ab-ac-505x850.webp'],
                    ['name' => 'Kilifi & the North Coast', 'blurb' => 'A quiet, creek-side stretch built around a tidal inlet, mangroves and calm residential beaches.', 'image' => '/uploads/2026/07/activity-6a8db5-ac-505x850.webp'],
                ],
                'itinerary' => 'kenya-pure-wildlife-safari',
            ],
            [
                'number'  => '02',
                'slug'    => 'tanzania',
                'name'    => 'Tanzania',
                'strap'   => 'The Serengeti offers vast savannas, Ruaha boasts rugged wildlife refuges, and Mahale the finest chimpanzee trekking in Africa.',
                'hero'    => '/uploads/2026/06/cheetah-92aa0c-scaled.webp',
                'credit'  => 'Serengeti',
                'map'     => '/uploads/2023/09/map-tanzania.svg',
                'thumb'   => self::THEME . '/dest-tanzania.webp',
                'intro'   => 'Scale is the Tanzanian story: a migration that behaves like weather, and then far quieter country south of the well-trodden northern circuit.',
                'body'    => [
                    'Most itineraries begin in the north, where the Serengeti’s short-grass plains hold the herds for much of the year and the Ngorongoro Crater packs an extraordinary density of wildlife into a single caldera. Fly camping and private concessions on the margins of the ecosystem let you follow the herds without the traffic.',
                    'The great variable is the river. Between July and October the crossings on the Mara and Grumeti are the closest thing safari has to a scheduled event — and still entirely unguaranteed, which is part of the point.',
                    'South of the equator the crowds vanish. Ruaha’s broad riverine forests carry large predator populations and a pace of game viewing that feels exploratory; the Mahale mountains, reached by boat or light aircraft on the eastern shore of Lake Tanganyika, are the place for chimpanzees; and the southern highlands give the whole trip a temperate, agricultural rhythm.',
                ],
                'pull'    => 'Northern Tanzania for the spectacle; the south for the feeling of having the country to yourself.',
                'images'  => [
                    '/uploads/2026/07/blue-wildebeest-ff9044-sq.webp',
                    '/uploads/2026/07/kichaka-expeditions-ruaha-national-park-tanzania-activity-e9d6b5-sq.webp',
                    '/uploads/2026/09/chem-chem-lodge-lodge-lodge-lake-manyara-tanzania-activity-366356-wp.webp',
                    '/uploads/2026/07/nomad-kusini-camp-serengeti-national-park-tanzania-activity-8990da-scaled.webp',
                ],
                'months'  => [1, 1, 3, 3, 2, 1, 1, 1, 1, 2, 2, 2],
                'seasons' => 'The dry months of June to October are the reliable window for the north, with calving season in the southern Serengeti around February. March, April and May bring the long rains, when lodges drop their rates and the landscapes turn green.',
                'areas' => [
                    ['name' => 'Serengeti', 'blurb' => 'An ecosystem of plains, riverine forest and kopjes that the herds move through all year.', 'image' => '/uploads/2026/07/cheetah-b83d43-ac.webp'],
                    ['name' => 'Ngorongoro & the Rift', 'blurb' => 'A volcanic caldera with high densities of big game, plus highland farms and Maasai rangeland on its rim.', 'image' => '/uploads/2026/07/blue-wildebeest-ff9044-sq.webp'],
                    ['name' => 'Ruaha & the South', 'blurb' => 'Rugged, under-visited national parks built around baobab-dotted rivers and large predator populations.', 'image' => '/uploads/2026/07/kichaka-expeditions-ruaha-national-park-tanzania-activity-e9d6b5-sq.webp'],
                    ['name' => 'Mahale', 'blurb' => 'Chimpanzee research country on the shore of Lake Tanganyika, reachable only by boat or air.', 'image' => '/uploads/2026/07/nomad-kusini-camp-serengeti-national-park-tanzania-activity-8990da-scaled.webp'],
                ],
                'itinerary' => 'tanzania-great-migration-safari',
            ],
            [
                'number'  => '03',
                'slug'    => 'uganda',
                'name'    => 'Uganda',
                'strap'   => 'Uganda presents a varied safari offering, characterized by mountain gorillas and an expansive range of experiences.',
                'hero'    => '/uploads/2026/06/mountain-gorilla-17fa1f-scaled.webp',
                'credit'  => 'Bwindi',
                'map'     => '/uploads/2023/09/map-uganda.svg',
                'thumb'   => self::THEME . '/dest-uganda.webp',
                'intro'   => 'Primate tracking in equatorial forest, then savanna, rift-valley lakes and the road to Kidepo — a compact country with an unusually full menu.',
                'body'    => [
                    'Bwindi’s misty ridges hold roughly half of the world’s remaining mountain gorillas, and permits are the gating factor on any Uganda trip: they sell far ahead, and the best families to track are allocated by experience and fitness rather than price alone.',
                    'Kibale Forest, a few hours away, is the chimpanzee capital of East Africa — habituated troops, forest walks at first light and a night-sound you will not forget. Between the two, the Kazinga channel, Queen Elizabeth’s craters and Murchison Falls give the classic big-game and boat-safari beats.',
                    'In the far north, Kidepo Valley is one of the great remote wilderness camps on the continent: acacia-flecked savanna between the Karamojong highlands and the Sudanese border, with species that do not occur in the south at all.',
                ],
                'pull'    => 'Book the gorilla permit first, and let everything else be arranged around it.',
                'images'  => [
                    '/uploads/2026/06/bwindi-lodge-impenetrable-national-park-uganda-aerial-fa50ce-sq.webp',
                    '/uploads/2026/06/apoka-safari-lodge-kidepo-valley-national-park-uganda-game-drive-72506e-sq.webp',
                    '/uploads/2026/06/common-chimpanzee-bd6cf6.webp',
                    '/uploads/2026/06/mountain-gorilla-1cd7d9-scaled.webp',
                ],
                'months'  => [1, 1, 2, 3, 3, 1, 1, 1, 2, 2, 3, 1],
                'seasons' => 'June to August and December to February offer the driest tracking, with shorter grass and clearer forest floors. March to May and October to November are the rainy seasons — muddier, but greener, quieter and better for birds.',
                'areas' => [
                    ['name' => 'Bwindi', 'blurb' => 'The Impenetrable Forest’s montane ridges and the gorilla families habituated for tracking.', 'image' => '/uploads/2026/06/western-lowland-gorilla-263465-ac.webp'],
                    ['name' => 'Kibale Forest', 'blurb' => 'Chimpanzees, forest elephants and the densest primate populations anywhere in Africa.', 'image' => '/uploads/2026/06/common-chimpanzee-bd6cf6.webp'],
                    ['name' => 'Queen Elizabeth & the Rift', 'blurb' => 'Crater lakes, kudos-topped lodges and the boat trip down the Kazinga Channel.', 'image' => '/uploads/2026/06/bwindi-lodge-impenetrable-national-park-uganda-aerial-fa50ce-sq.webp'],
                    ['name' => 'Kidepo Valley', 'blurb' => 'A remote frontier savanna in Karamoja with species found nowhere else in the country.', 'image' => '/uploads/2026/06/apoka-safari-lodge-kidepo-valley-national-park-uganda-game-drive-72506e-sq.webp'],
                ],
                'itinerary' => 'uganda-gorilla-chimp-safari',
            ],
            [
                'number'  => '04',
                'slug'    => 'botswana',
                'name'    => 'Botswana',
                'strap'   => 'Home to one of nature’s great marvels, The Okavango Delta, and some of the finest wildlife viewing in Africa.',
                'hero'    => '/uploads/2026/07/okavango-delta-botswana-game-drive-f8946a.webp',
                'credit'  => 'Okavango Delta',
                'map'     => '/uploads/2023/09/map-botswana.svg',
                'thumb'   => self::THEME . '/dhcard-botswana.webp',
                'intro'   => 'A high-volume, low-footprint model: small camps, private concessions, and water that arrives from a thousand kilometres away in the dry season.',
                'body'    => [
                    'The Okavango floods in the dry. Water that falls as rain on the Angolan Highlands spreads across the sand in June and July, and the Delta’s camps are placed to move with it — mokoro channels one week, flood-recession plains the next.',
                    'Outside the Delta, the Kalahari’s central reserve is a flat expanse of grassland and salt where meerkats habituate to vehicles and the Makgadikgadi pans fill with zebra and flamingo after rain. To the north, the Linyanti and Savuti channels concentrate elephant in numbers that still surprise people.',
                    'Because permits are capped per concession and most camps hold fewer than a dozen beds, the practical craft in Botswana is sequencing: which airstrip, which season, which side of the water — and how to keep flying time short.',
                ],
                'pull'    => 'Botswana rewards a tight plan: fewer camps, longer stays, and the concessions nobody else has.',
                'images'  => [
                    '/uploads/2026/07/african-wild-dog-d15ee2-1350x844.webp',
                    '/uploads/2026/07/gomoti-plains-camp-okavango-delta-botswana-dining-food-f8c335-sq.webp',
                    '/uploads/2026/06/african-lion-c1e3ff-scaled.webp',
                    '/uploads/2026/07/common-hippopotamus-45486f-sq.webp',
                ],
                'months'  => [2, 2, 3, 2, 1, 1, 1, 1, 1, 1, 2, 2],
                'seasons' => 'May to September is dry, mild and reliable, with the Delta at its most aquatic from July. The November to March rains green the plains and bring foaling and migratory birds, with January and February the hottest months.',
                'areas' => [
                    ['name' => 'Okavango Delta', 'blurb' => 'Seasonal water, island camps and a mosaic of concessions, each with its own game rules.', 'image' => '/uploads/2026/08/okavango-delta-botswana-lodge-exterior-eddf4c-1350x844.webp'],
                    ['name' => 'Moremi & Khwai', 'blurb' => 'The Delta’s eastern tongue: predator-dense, accessible and endlessly productive in the dry.', 'image' => '/uploads/2026/06/african-lion-c1e3ff-scaled.webp'],
                    ['name' => 'Makgadikgadi & the Kalahari', 'blurb' => 'Salt pans and sand veld, where the pans flood after rain and meerkats run the camps.', 'image' => '/uploads/2026/07/jack-s-camp-makgadikgadi-pans-botswana-lodge-exterior-14727a-1350x844.webp'],
                    ['name' => 'Linyanti & Savuti', 'blurb' => 'Channel and floodplain country in the north-east, built around big elephant herds.', 'image' => '/uploads/2026/07/chitabe-camp-okavango-delta-botswana-pool-b747ff-1350x844.webp'],
                ],
                'itinerary' => 'botswana-helicopters-through-the-delta',
            ],
            [
                'number'  => '05',
                'slug'    => 'namibia',
                'name'    => 'Namibia',
                'strap'   => 'Otherworldly landscapes and desert-adapted wildlife in this most unique of safari destinations.',
                'hero'    => '/uploads/2026/07/landscape-72cd9e-scaled.webp',
                'credit'  => 'Namib',
                'map'     => '/uploads/2023/09/map-namibia.svg',
                'thumb'   => self::THEME . '/dhcard-namibia.webp',
                'intro'   => 'Empty by default: red dunes, fog-belt coast, and a driving country where the distances are the point and self-reliance pays.',
                'body'    => [
                    'Namibia is the one African destination where the landscape, rather than the game, leads. The Namib’s star dunes at Sossusvlei, the shipwreck and fog coast at Swakopmund, and the Damaraland plains where desert-adapted elephant move between dry riverbeds all reward a slow itinerary with long stays rather than a tick-list loop.',
                    'Etosha does the wildlife: a salt pan ringed by waterholes that draw black rhino, lion and hundreds of thousands of springbok in the dry months. In the north, the Kunene region and the Caprivi wetlands offer the counterweight — community conservancies and birding, respectively.',
                    'Practically, it is a fly-in or drive-it country. Charter pilots and ground teams matter more here than almost anywhere, and the right vehicle, fuel plan and rest schedule are worth as much attention as the lodges.',
                ],
                'pull'    => 'Give yourself two nights everywhere; the light changes more than the map does.',
                'images'  => [
                    '/uploads/2026/07/landscape-24cc6a-ac.webp',
                    '/uploads/2026/07/game-drive-6767a8-sq.webp',
                    '/uploads/2026/07/tok-tokkie-trails-namibrand-nature-reserve-namibia-activity-fa7b50-sq.webp',
                    '/uploads/2026/07/namib-web-footed-gecko-a6a8a0-scaled.webp',
                ],
                'months'  => [3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2],
                'seasons' => 'April to October is dry and cool, with the best wildlife viewing at Etosha’s waterholes from June. The November to March rains bring greenery, newborn game and thunderstorms on the central plateau, along with heat in the Namib.',
                'areas' => [
                    ['name' => 'Sossusvlei & the Namib', 'blurb' => 'Star dunes, dead camelthorn pans and the fog that rolls in off the Atlantic at dawn.', 'image' => '/uploads/2026/07/landscape-24cc6a-ac.webp'],
                    ['name' => 'Damaraland & Kunene', 'blurb' => 'Desert-adapted elephant and rhino across dry riverbeds, in community-run conservancy country.', 'image' => '/uploads/2026/07/game-drive-6767a8-sq.webp'],
                    ['name' => 'Etosha', 'blurb' => 'A vast white pan fringed by floodlit waterholes — the most reliable game viewing in the country.', 'image' => '/uploads/2026/07/landscape-72cd9e-scaled.webp'],
                    ['name' => 'Skeleton Coast', 'blurb' => 'Fly-in only: shipwrecks, seal colonies and a landing strip on the beach.', 'image' => '/uploads/2026/07/aerial-da4cb3-wp.webp'],
                ],
                'itinerary' => null,
            ],
            [
                'number'  => '06',
                'slug'    => 'zimbabwe',
                'name'    => 'Zimbabwe',
                'strap'   => 'Home of the highest guiding standards in Africa, and exceptional walking safaris.',
                'hero'    => '/uploads/2026/06/aerial-6b9069-scaled.webp',
                'credit'  => 'Mana Pools',
                'map'     => '/uploads/2023/09/map-zimbabwe.svg',
                'thumb'   => self::THEME . '/dhcard-zimbabwe.webp',
                'intro'   => 'Guides first: low-density parks, unhurried ranges, and the best walking country on the continent.',
                'body'    => [
                    'Zimbabwe’s professional guiding standard is the country’s real infrastructure, and it shows in the field: ranges walk, track on foot, and work riverine ecosystems with an ease that changes what a safari feels like.',
                    'Along the Zambezi, Mana Pools’ floodplain forest keeps elephant, wild dog and lion moving between the pools and the escarpment, while Matusadona’s drowned forest and lake shore give a water-based safari of a different character. Hwange, in the south-west, holds enormous elephant herds and a wild dog population worth building a trip around.',
                    'Victoria Falls is the natural entry point — and increasingly a place to spend real time, with two banks, gorge activities and riverside lodges in the surrounding forest.',
                ],
                'pull'    => 'Few beds, big ranges, and guides who can read a spoor line at dawn.',
                'images'  => [
                    '/uploads/2026/06/african-elephant-b96130-sq.webp',
                    '/uploads/2026/06/white-rhinoceros-4572b8-sq.webp',
                    '/uploads/2026/09/mana-pools-national-park-zimbabwe-lodge-exterior-4d8187-wp.webp',
                    '/uploads/2026/06/african-wild-dog-4b5118-scaled.webp',
                ],
                'months'  => [3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2],
                'seasons' => 'April to October is dry: shrinking waterholes make Hwange and Mana Pools superb from August. The November to March rains bring green flush, migratory birds and thunderstorms, with the Falls at their most violent in April.',
                'areas' => [
                    ['name' => 'Victoria Falls', 'blurb' => 'The greatest sheet of water in Africa, with national park forest on both banks of the Zambezi.', 'image' => '/uploads/2026/07/victoria-falls-river-lodge-zambezi-valley-zambia-exterior-e65c14-1350x844.webp'],
                    ['name' => 'Mana Pools', 'blurb' => 'A World Heritage floodplain where elephants stand in the river and walking safaris are the norm.', 'image' => '/uploads/2026/07/little-vundu-mana-pools-national-park-zimbabwe-lodge-exterior-98682e-1350x844.webp'],
                    ['name' => 'Hwange', 'blurb' => 'Elephant country in the south-west, with wild dog recovery programmes and hide-dotted waterholes.', 'image' => '/uploads/2026/07/hwange-bush-camp-national-park-zimbabwe-lodge-exterior-8935d4-1350x844.webp'],
                    ['name' => 'Matusadona & Matobo', 'blurb' => 'Lake safaris in a drowned forest, then granite rholo-boulders and rhino sanctuaries in the south.', 'image' => '/uploads/2026/06/bumi-hills-safari-lodge-matusadona-national-park-zimbabwe-deck-view-1956ec-1350x844.webp'],
                ],
                'itinerary' => 'zimbabwe-walking-with-elephants',
            ],
            [
                'number'  => '07',
                'slug'    => 'rwanda',
                'name'    => 'Rwanda',
                'strap'   => 'Mountain gorillas and big five safaris in ‘The Land of a Thousand Hills’.',
                'hero'    => '/uploads/2026/06/eastern-mountain-gorilla-42fc66-scaled.webp',
                'credit'  => 'Volcanoes National Park',
                'map'     => '/uploads/2023/09/map-rwanda.svg',
                'thumb'   => self::THEME . '/dest-rwanda.webp',
                'intro'   => 'Short transfer times, high-standard guiding and the easiest gorilla tracking in East Africa — with savanna and rainforest close behind.',
                'body'    => [
                    'Rwanda’s advantage is logistics: an hour or two from Kigali to the Virunga volcanoes, and a well-run park system that keeps the gorilla experience calm, capped and properly guided. Nyungwe’s canopy walk and chimpanzee tracking sit in the south-west, joined by good road and air links.',
                    'Akagera, on the Tanzanian border, completed the country’s big-five circuit after a landmark restoration of its lion and rhino populations, and now delivers classic savanna game in a compact, drivable park.',
                    'Because the country is small, Rwanda pairs naturally with Tanzania or Kenya for a combined itinerary, or stands alone as a primate-focused trip with one lodge per landscape.',
                ],
                'pull'    => 'The least strenuous way to spend an hour with a mountain gorilla family.',
                'images'  => [
                    '/uploads/2026/06/african-lion-2604d8-sq.webp',
                    '/uploads/2026/06/rwanda-aerial-5983a6-sq.webp',
                    '/uploads/2026/06/magashi-camp-akagera-national-park-rwanda-people-6cc293-wp.webp',
                    '/uploads/2026/06/singita-kwitonda-lodge-volcanoes-national-park-rwanda-exterior-c1ca42-1350x843.webp',
                ],
                'months'  => [1, 1, 2, 3, 3, 1, 1, 1, 2, 2, 3, 1],
                'seasons' => 'June to September and December to February are the driest tracking months. Long rains from March to May and shorter rains in October to November still allow gorilla permits, but the forest is wetter and the trails steeper.',
                'areas' => [
                    ['name' => 'Volcanoes National Park', 'blurb' => 'Bamboo and hagenia slopes of the Virungas, and the habituated gorilla families tracked from Kinigi.', 'image' => '/uploads/2026/06/eastern-mountain-gorilla-42fc66-ac.webp'],
                    ['name' => 'Akagera', 'blurb' => 'Lake-dotted savanna on the Akagera river, home to the country’s recovered lion and rhino populations.', 'image' => '/uploads/2026/06/magashi-camp-akagera-national-park-rwanda-people-6cc293-wp.webp'],
                    ['name' => 'Nyungwe Forest', 'blurb' => 'Montane rainforest, habituated chimpanzees and a canopy walkway above the ridgeline.', 'image' => '/uploads/2026/06/one-only-nyungwe-house-forest-national-park-rwanda-aerial-ac97fc-1350x844.webp'],
                    ['name' => 'Kigali', 'blurb' => 'A hillside capital of markets, memorials and design hotels — well worth an extra night.', 'image' => '/uploads/2026/07/villa-kigali-rwanda-pool-71a3a2-1350x844.webp'],
                ],
                'itinerary' => 'rwanda-luxury-primate-rhino-safari',
            ],
        ];
    }

    public static function destination(string $slug): ?array
    {
        foreach (static::destinations() as $d) {
            if ($d['slug'] === $slug) {
                return $d;
            }
        }

        return null;
    }

    /* ---------------------------------------------------------------------
     | Sample itineraries
     |------------------------------------------------------------------ */

    public static function itineraries(): array
    {
        return [
            [
                'slug'    => 'botswana-helicopters-through-the-delta',
                'country' => 'Botswana',
                'title'   => 'Helicopters through The Delta',
                'summary' => 'Wild dog country at Chitabe, a walking safari in the western Delta and the Makgadikgadi salt pans over 11 nights.',
                'style'   => 'Private Safari',
                'price'   => '$19,824 pp',
                'guests'  => 4,
                'nights'  => 11,
                'image'   => '/uploads/2026/07/okavango-delta-botswana-activity-70c390-sq-850x850.webp',
                'credit'  => 'Okavango Delta',
                'gallery' => [
                    '/uploads/2026/07/okavango-delta-botswana-activity-70c390-1350x844.webp',
                    '/uploads/2026/07/chitabe-camp-okavango-delta-botswana-lodge-exterior-776cdb-1350x844.webp',
                    '/uploads/2026/07/jack-s-camp-makgadikgadi-pans-botswana-lodge-exterior-14727a-1350x844.webp',
                    '/uploads/2026/06/african-wild-dog-d15ee2-1350x844.webp',
                    '/uploads/2026/08/okavango-delta-botswana-lodge-exterior-eddf4c-1350x844.webp',
                    '/uploads/2026/07/chitabe-camp-okavango-delta-botswana-pool-b747ff-1350x844.webp',
                    '/uploads/2026/07/kweene-trails-okavango-delta-botswana-guest-room-4b50b0-1350x844.webp',
                    '/uploads/2026/07/jack-s-camp-makgadikgadi-pans-botswana-deck-view-210cc4-1350x844.webp',
                    '/uploads/2026/07/chitabe-camp-okavango-delta-botswana-guest-room-b6d0cf-1350x844.webp',
                    '/uploads/2026/07/kweene-trails-okavango-delta-botswana-guest-room-77d0ac-1350x844.webp',
                    '/uploads/2026/07/jack-s-camp-makgadikgadi-pans-botswana-guest-room-ea91f0-1350x844.webp',
                ],
                'lodge'   => 'Chitabe Camp',
                'days' => [
                    ['day' => 'Day 1', 'title' => 'Arrive in Maun', 'body' => 'Met on arrival and transferred to a riverside lodge for the night. Briefing on the week ahead and a final look at permits and charter slots.'],
                    ['day' => 'Days 2–4', 'title' => 'Chitabe Camp, The Okavango', 'body' => 'Fly into a private concession in the south-east Delta. Game drives by vehicle and on foot, night drives for leopard and wild dog, and mokoro work through the papyrus channels when the flood is high.'],
                    ['day' => 'Days 5–7', 'title' => 'Helicopter to the western Delta', 'body' => 'A short charter hops you west, where the camps sit on wide flood-recession plains. Morning walks with a range, afternoons spent tracking by boat through islands of sausage tree.'],
                    ['day' => 'Days 8–10', 'title' => 'Kweene Trails, mobile under canvas', 'body' => 'A low-impact mobile tented camp that shifts camp with the wildlife. No fences, no other vehicles, and a walking programme as the centrepiece.'],
                    ['day' => 'Day 11', 'title' => 'The Makgadikgadi pans', 'body' => 'A final leg north to Jack’s Camp on the edge of the salt pans — dunes, baobabs and quad-biking across the pan floor before the return flight home.'],
                ],
            ],
            [
                'slug'    => 'tanzania-great-migration-safari',
                'country' => 'Tanzania',
                'title'   => 'Great Migration Safari',
                'summary' => 'Twelve nights across northern Tanzania, from the Serengeti and a private granite reserve to the Ngorongoro Highlands and the Rift.',
                'style'   => 'Private Safari',
                'price'   => '$23,925 pp',
                'guests'  => 2,
                'nights'  => 12,
                'image'   => '/uploads/2026/07/chem-chem-lodge-lodge-lodge-lake-manyara-tanzania-activity-366356-sq-850x850.webp',
                'credit'  => 'Chem Chem Lodge',
                'gallery' => [
                    '/uploads/2026/07/chem-chem-lodge-lodge-lodge-lake-manyara-tanzania-activity-366356-1350x844.webp',
                    '/uploads/2026/06/blue-wildebeest-50778c-1350x844.webp',
                    '/uploads/2026/07/legendary-lodge-arusha-tanzania-exterior-ee0869-1350x844.webp',
                    '/uploads/2026/07/lamai-wedge-tanzania-lodge-exterior-a27d7c-1350x844.webp',
                    '/uploads/2026/07/mwiba-lodge-wildlife-reserve-tanzania-exterior-73a8de-1350x844.webp',
                    '/uploads/2026/07/gibb-s-farm-ngorongoro-crater-tanzania-lodge-exterior-e7bdc5-1350x844.webp',
                    '/uploads/2026/07/chem-chem-lodge-lodge-lodge-lake-manyara-tanzania-pool-1c4bf9-1350x844.webp',
                    '/uploads/2026/07/legendary-lodge-arusha-tanzania-pool-5b5037-1350x844.webp',
                    '/uploads/2026/07/lamai-wedge-tanzania-deck-view-b38521-1350x844.webp',
                    '/uploads/2026/07/mwiba-lodge-wildlife-reserve-tanzania-deck-view-1f82b3-1350x844.webp',
                    '/uploads/2026/07/gibb-s-farm-ngorongoro-crater-tanzania-pool-d36739-1350x844.webp',
                    '/uploads/2026/07/legendary-lodge-arusha-tanzania-guest-room-228097-1350x844.webp',
                ],
                'lodge'   => 'Nyasi Tented Camp',
                'days' => [
                    ['day' => 'Day 1', 'title' => 'Kilimanjaro to Arusha', 'body' => 'Cleared on arrival and driven to a garden lodge in the hills above the city, with views across to Meru and a late dinner together.'],
                    ['day' => 'Days 2–4', 'title' => 'Lake Manyara’s ridge', 'body' => 'Two nights at Chem Chem, above the lake and its elephant herds. Day and night drives, an exclusive-use children’s programme, and a walk on the escarpment.'],
                    ['day' => 'Days 5–8', 'title' => 'Serengeti, following the herds', 'body' => 'A short flight to a semi-permanent camp positioned for the season. Four nights of drives across the plains and riverine forest, with picnic breaks rather than rushed returns.'],
                    ['day' => 'Days 9–10', 'title' => 'Ngorongoro Highlands', 'body' => 'Down to Gibbs’ Farm, a coffee-shaded lodge on the crater rim, then the descent into the caldera itself for a full day of game viewing.'],
                    ['day' => 'Days 11–12', 'title' => 'The Rift and home', 'body' => 'A final night in a private reserve near Arusha — giraffe at breakfast, an easy walk before lunch — then transfers to Kilimanjaro and the overnight flight.'],
                ],
            ],
            [
                'slug'    => 'uganda-gorilla-chimp-safari',
                'country' => 'Uganda',
                'title'   => 'Gorilla & Chimp Safari',
                'summary' => 'Nine nights across western Uganda, tracking chimpanzees at Kibale and mountain gorillas at Bwindi and Mgahinga.',
                'style'   => 'Private Safari',
                'price'   => '$11,326 pp',
                'guests'  => 2,
                'nights'  => 9,
                'image'   => '/uploads/2026/08/common-chimpanzee-d6f491-sq-850x850.webp',
                'credit'  => 'Kibale Forest',
                'gallery' => [
                    '/uploads/2026/06/common-chimpanzee-d6f491-1350x844.webp',
                    '/uploads/2026/06/mountain-gorilla-fda4c9-1350x844.webp',
                    '/uploads/2026/07/no-5-boutique-hotel-entebbe-uganda-lodge-exterior-e98c24-1350x844.webp',
                    '/uploads/2026/06/kibale-lodge-forest-national-park-uganda-exterior-f649ae-1350x844.webp',
                    '/uploads/2026/06/clouds-mountain-gorilla-lodge-bwindi-impenetrable-national-park-uganda-exterior-d375dc-1350x844.webp',
                    '/uploads/2026/06/mount-gahinga-lodge-mgahinga-gorilla-national-park-uganda-exterior-3486f7-1350x844.webp',
                    '/uploads/2026/07/no-5-boutique-hotel-entebbe-uganda-lodge-exterior-c1502c-1350x844.webp',
                    '/uploads/2026/06/kibale-lodge-forest-national-park-uganda-aerial-fe6340-1350x844.webp',
                    '/uploads/2026/06/clouds-mountain-gorilla-lodge-bwindi-impenetrable-national-park-uganda-landscape-65f5cd-1350x844.webp',
                    '/uploads/2026/06/mount-gahinga-lodge-mgahinga-gorilla-national-park-uganda-guest-room-9f5ea4-1350x844.webp',
                    '/uploads/2026/06/clouds-mountain-gorilla-lodge-bwindi-impenetrable-national-park-uganda-deck-view-f4947c-1350x844.webp',
                ],
                'lodge'   => 'Mount Gahinga Lodge',
                'days' => [
                    ['day' => 'Day 1', 'title' => 'Entebbe and Lake Victoria', 'body' => 'A night by the water to absorb the journey, with an easy afternoon walk on the peninsula and an early night.'],
                    ['day' => 'Days 2–3', 'title' => 'Kibale Forest', 'body' => 'Drive to the forest edge, then two mornings in the company of habituated chimpanzee troops — one tracking at dawn, the second a guided nature walk between the calls.'],
                    ['day' => 'Days 4–6', 'title' => 'Queen Elizabeth National Park', 'body' => 'Across the crater-lake landscape to the Kazinga Channel for boat trips, tree-climbing lion country at Ishasha, and an evening with a conservation research team.'],
                    ['day' => 'Days 7–8', 'title' => 'Bwindi: gorilla tracking', 'body' => 'Briefing at Kinigi-style park headquarters, then an hour with a mountain gorilla family in the Impenetrable Forest. A second permit at Mgahinga is possible for the Virunga slopes.'],
                    ['day' => 'Day 9', 'title' => 'Kampala and departure', 'body' => 'Back north for the airport via the highway through the terraced hills, with a stop at the Equator if the flight is late.'],
                ],
            ],
            [
                'slug'    => 'rwanda-luxury-primate-rhino-safari',
                'country' => 'Rwanda',
                'title'   => 'Luxury Primate & Rhino Safari',
                'summary' => 'Ten nights across Rwanda, linking Kigali, the savannah of Akagera, the gorillas of Volcanoes and the rainforest of Nyungwe.',
                'style'   => 'Private Safari',
                'price'   => '$24,890 pp',
                'guests'  => 2,
                'nights'  => 10,
                'image'   => '/uploads/2026/07/southern-white-rhinoceros-5e3a92-sq-850x850.webp',
                'credit'  => 'Akagera',
                'gallery' => [
                    '/uploads/2026/06/southern-white-rhinoceros-5e3a92-1350x844.webp',
                    '/uploads/2026/07/villa-kigali-rwanda-pool-71a3a2-1350x844.webp',
                    '/uploads/2026/06/magashi-camp-akagera-national-park-rwanda-lodge-exterior-e3fd5f-1350x844.webp',
                    '/uploads/2026/06/singita-kwitonda-lodge-volcanoes-national-park-rwanda-exterior-c1ca42-1350x843.webp',
                    '/uploads/2026/06/one-only-nyungwe-house-forest-national-park-rwanda-aerial-ac97fc-1350x844.webp',
                    '/uploads/2026/07/villa-kigali-rwanda-pool-58d73d-1350x844.webp',
                    '/uploads/2026/06/magashi-camp-lake-rwanyakazinga-rwanda-deck-view-c1dce9-1350x844.webp',
                    '/uploads/2026/06/singita-kwitonda-lodge-volcanoes-national-park-rwanda-exterior-4be8fc-1350x844.webp',
                    '/uploads/2026/06/one-only-nyungwe-house-forest-national-park-rwanda-deck-view-30258c-1350x844.webp',
                    '/uploads/2026/07/villa-kigali-rwanda-deck-view-c1c554-1350x844.webp',
                    '/uploads/2026/06/white-rhinoceros-d51067-1350x844.webp',
                ],
                'lodge'   => 'Singita Kwitonda Lodge',
                'days' => [
                    ['day' => 'Day 1', 'title' => 'Kigali', 'body' => 'Two nights in a garden guesthouse on the hills: the memorial and markets on the first afternoon, coffee and design studios on the second morning.'],
                    ['day' => 'Days 2–4', 'title' => 'Akagera National Park', 'body' => 'Drive east to the lakes and papyrus of Akagera for three nights of savanna game viewing — black rhino, lion, hippo and shoebill on the same day.'],
                    ['day' => 'Days 5–7', 'title' => 'Volcanoes National Park', 'body' => 'North to the Virunga foothills and a lodge built at the foot of the range. Gorilla tracking on day two of the stay, with golden monkeys and a visit to the Senkwekwe centre for the rest.'],
                    ['day' => 'Days 8–10', 'title' => 'Nyungwe Forest', 'body' => 'Fly or drive south-west to the montane rainforest for chimpanzee tracking and the canopy walkway, then return to Kigali for the connection home.'],
                ],
            ],
            [
                'slug'    => 'zimbabwe-walking-with-elephants',
                'country' => 'Zimbabwe',
                'title'   => 'Walking With Elephants',
                'summary' => 'Twelve nights across Zimbabwe, from Victoria Falls and Mana Pools to Lake Kariba, Hwange and the granite of Matobo.',
                'style' => 'Private Safari',
                'price'   => '$9,986 pp',
                'guests'  => 2,
                'nights'  => 12,
                'image'   => '/uploads/2026/08/african-bush-elephant-44011a-sq-850x850.webp',
                'credit'  => 'Mana Pools',
                'gallery' => [
                    '/uploads/2026/08/african-bush-elephant-44011a-1350x844.webp',
                    '/uploads/2026/07/victoria-falls-river-lodge-zambia-exterior-67f2d1.webp',
                    '/uploads/2026/07/little-vundu-mana-pools-national-park-zimbabwe-lodge-exterior-98682e-1350x844.webp',
                    '/uploads/2026/06/bumi-hills-safari-lodge-matusadona-national-park-zimbabwe-deck-view-1956ec-1350x844.webp',
                    '/uploads/2026/07/hwange-bush-camp-national-park-zimbabwe-lodge-exterior-8935d4-1350x844.webp',
                    '/uploads/2026/07/amalinda-lodge-matobo-national-park-zimbabwe-deck-view-48dd0a-1350x844.webp',
                    '/uploads/2026/07/victoria-falls-river-lodge-zambia-deck-8054b6.webp',
                    '/uploads/2026/07/little-vundu-mana-pools-national-park-zimbabwe-guest-room-690640-1350x844.webp',
                    '/uploads/2026/07/hwange-bush-camp-national-park-zimbabwe-guest-room-5091ad-1350x844.webp',
                    '/uploads/2026/07/amalinda-lodge-matobo-national-park-zimbabwe-guest-room-ae06ea-1350x844.webp',
                    '/uploads/2026/08/african-elephant-4c2fb4-1350x844.webp',
                ],
                'lodge'   => 'Bumi Hills Safari Lodge',
                'days' => [
                    ['day' => 'Days 1–2', 'title' => 'Victoria Falls', 'body' => 'Two nights on the river above the Falls, with a walk through the rainforest to the gorge rim and, if the water allows, a dip on the knife-edge pool.'],
                    ['day' => 'Days 3–5', 'title' => 'Mana Pools', 'body' => 'A bush flight north to the Zambezi floodplain. Three nights in an unhurried tented camp: walking safaris at first light, and afternoons between the pools while elephant move past the tent line.'],
                    ['day' => 'Days 6–7', 'title' => 'Lake Kariba', 'body' => 'South to Matusadona across the drowned forest — boat and canoe safari, fish eagle at breakfast, and a night drive on the lakeshore.'],
                    ['day' => 'Days 8–10', 'title' => 'Hwange', 'body' => 'A short hop to the big southern park for elephant, wild dog and a hide built to their eye level, with two full days of driving in the dry-season grass.'],
                    ['day' => 'Days 11–12', 'title' => 'Matobo and home', 'body' => 'Two nights among the granite rholos with rhino tracking on foot, then a transfer back to Victoria Falls for the flight out.'],
                ],
            ],
            [
                'slug'    => 'kenya-pure-wildlife-safari',
                'country' => 'Kenya',
                'title'   => 'Big Tuskers Safari',
                'summary' => 'Thirteen nights across Kenya, linking Amboseli under Kilimanjaro, the Mara North plains and Borana’s rhino country.',
                'style'   => 'Private Safari',
                'price'   => '$14,820 pp',
                'guests'  => 4,
                'nights'  => 13,
                'image'   => '/uploads/2026/07/african-bush-elephant-351857-sq-850x850.webp',
                'credit'  => 'Amboseli',
                'gallery' => [
                    '/uploads/2026/07/african-bush-elephant-351857-1350x844.webp',
                    '/uploads/2026/07/manzili-house-karen-kenya-pool-150210-1350x844.webp',
                    '/uploads/2026/07/tawi-lodge-amboseli-conservancy-kenya-deck-view-6c1400-1350x844.webp',
                    '/uploads/2026/07/kicheche-mara-north-north-conservancy-kenya-lodge-exterior-e7e5c0-1350x844.webp',
                    '/uploads/2026/07/borana-lodge-conservancy-kenya-deck-view-e8c8d4-1350x844.webp',
                    '/uploads/2026/07/manzili-house-karen-kenya-pool-0a567e-1350x844.webp',
                    '/uploads/2026/07/tawi-lodge-amboseli-conservancy-kenya-activity-87cbb2-1350x844.webp',
                    '/uploads/2026/07/kicheche-mara-north-north-conservancy-kenya-lodge-exterior-1894a1-1350x844.webp',
                    '/uploads/2026/07/borana-lodge-conservancy-kenya-deck-view-77c2b2-1350x844.webp',
                    '/uploads/2026/07/tawi-lodge-amboseli-conservancy-kenya-guest-room-574523-1350x844.webp',
                    '/uploads/2026/07/kicheche-mara-north-north-conservancy-kenya-guest-room-7a6e1e-1350x844.webp',
                ],
                'lodge'   => 'Borana Lodge',
                'days' => [
                    ['day' => 'Day 1', 'title' => 'Nairobi', 'body' => 'A first night in Karen, minutes from the national park but a world from the airport, with a museum garden walk and an early dinner.'],
                    ['day' => 'Days 2–4', 'title' => 'Amboseli under Kilimanjaro', 'body' => 'Three nights at Tawi on a private conservancy bordering the park: big-tusker elephant framed by the mountain, plus night drives and walks the reserve itself does not allow.'],
                    ['day' => 'Days 5–8', 'title' => 'Maasai Mara North', 'body' => 'Fly northwest into a low-density conservancy camp. Four nights of game drives, a morning walk with a Maasai ranger, and an evening in a boma on the ridge.'],
                    ['day' => 'Days 9–12', 'title' => 'Laikipia: Borana', 'body' => 'North to the highland ranches for rhino tracking on foot, camel and horse days, and a night pitched in a fly-camp under open sky.'],
                    ['day' => 'Day 13', 'title' => 'Home', 'body' => 'A short flight back to Nairobi and the overnight connection out.'],
                ],
            ],
        ];
    }

    public static function itinerary(string $slug): ?array
    {
        foreach (static::itineraries() as $i) {
            if ($i['slug'] === $slug) {
                return $i;
            }
        }

        return null;
    }

    /* ---------------------------------------------------------------------
     | Team, stories, other pages
     |------------------------------------------------------------------ */

    public static function team(): array
    {
        return [
            [
                'slug'  => 'paul-callcutt',
                'name'  => 'Paul Callcutt',
                'role'  => 'managing director',
                'image' => self::THEME . '/auteam-paul-2026.webp',
                'blurb' => 'Paul’s background as a guide in Africa and South America is the foundation of how Fitzroy designs trips. His journey began in Zambia as a teenager, helping revive a key wildlife centre.',
                'bio'   => [
                    'Two decades of guiding on both continents turned into an obsession with the practical craft of a journey: who meets you at the airstrip, where the vehicle stops for lunch, which camp is right in the second week rather than the first.',
                    'Paul still leads a handful of trips each year, and personally vet-checks every guide, camp manager and pilot we work with before a client arrives.',
                ],
            ],
            [
                'slug'  => 'carina-hibbitt',
                'name'  => 'Carina Hibbitt',
                'role'  => 'destination specialist',
                'image' => self::THEME . '/auteam-carina-2026.webp',
                'blurb' => 'Carina’s two decades in the travel industry, largely within Africa, bring an in-depth read of the region’s options and how they fit together.',
                'bio' => [
                    'She handles most of the first conversations: listening for what a traveller actually wants rather than the destination they assumed they should want, then pressure-testing the plan against seasons, permits and driving times.',
                    'Clients return to her year after year, and she keeps a running note of what each of them liked, hated and promised themselves next time.',
                ],
            ],
            [
                'slug'  => 'jon-spinks',
                'name'  => 'Jon Spinks',
                'role'  => 'systems engineer',
                'image' => self::THEME . '/auteam-jon-2026.webp',
                'blurb' => 'Jon’s approach to systems architecture and problem-solving keeps the operation’s mechanics invisible to clients.',
                'bio' => [
                    'He builds the quiet plumbing behind the trips — document handling, payment protection records, the itineraries that sync to a traveller’s phone the morning a charter time changes.',
                    'When something moves at 40,000 feet, Jon is the reason the ground team already knows about it.',
                ],
            ],
        ];
    }

    public static function member(string $slug): ?array
    {
        foreach (static::team() as $m) {
            if ($m['slug'] === $slug) {
                return $m;
            }
        }

        return null;
    }

    public static function stories(): array
    {
        return [
            [
                'title'   => 'How the Okavango flood arrives in the dry season',
                'kicker'  => 'Field notes',
                'date'    => 'August 2026',
                'image'   => '/uploads/2026/07/okavango-delta-botswana-game-drive-f8946a.webp',
                'excerpt' => 'Two thousand kilometres of river, a fan of sand, and why June is the month the Delta fills while everything around it dries out.',
                'read'    => '6 min',
                'body'    => [
                    ['p' => 'The Delta is an inland river system with no outlet: roughly eleven cubic kilometres of water arrives from the Angolan Highlands each year and is lost to evaporation, transpiration and sand long before it reaches the sea. That journey takes months, which is why rain in Angola in January becomes flood in Maun in July.'],
['p' => 'For a traveller the consequence is counter-intuitive but simple: the best months in the Delta are the driest months everywhere else. Game concentrates on the islands, the channels are navigable, and camps plan activities against a flood line rather than a guess.'],
['p' => 'Ask about the concession you are visiting, not the region. Camps on the western edge run a fortnight behind the eastern ones, and a good year puts a boat route back on the map that was walkable in March.'],
                ],
                'pull'  => 'The only place we plan where the best weather and the best water arrive at the same time.',
            ],
            [
                'title'   => 'Conservancy maths: what a bed-night actually funds',
                'kicker'  => 'Responsible travel',
                'date'    => 'July 2026',
                'image'   => '/uploads/2026/06/kicheche-camps-mara-north-conservancy-kenya-activity-dd54c8-ac.webp',
                'excerpt' => 'Lease payments, ranger salaries, and the reason community-owned camps outlast fences.',
                'read'    => '9 min',
                'body'    => [
                    ['p' => 'In most East African conservancies the land is still owned by families who lease it to an operator for wildlife use. That payment is the difference between a rhino surviving a bad drought and not, because it makes a live animal worth more per acre than a grazed one.'],
['p' => 'Permits, vehicle caps and community employment sit on top of the lease. Counted together, a camp with a dozen beds can fund full-time ranger posts, a bursary programme and a water-point schedule that keeps livestock out of the core area.'],
['p' => 'Three questions separate marketing from practice: who owns the land, what share of the bed rate reaches them, and when the last payment was made. Any camp worth staying at answers all three without hedging.'],
                ],
                'pull'  => 'Conservation that relies on goodwill fails in a bad year. Conservation that pays rent does not.',
            ],
            [
                'title'   => 'Walking safaris: what to pack and what to expect',
                'kicker'  => 'Planning',
                'date'    => 'June 2026',
                'image'   => '/uploads/2026/06/people-ddba4b-680x850.webp',
                'excerpt' => 'The five things people get wrong before their first range-led walk.',
                'read'    => '5 min',
                'body'    => [
                    ['p' => 'A walking safari is not a hike with animals in it. Ranges choose the route at whatever time of day the animals allow, and the walk ends when the spoor goes cold or the wind turns. The most useful item you carry is a shoe you have already blistered in.'],
['p' => 'Colour matters more than people expect: neutral, non-reflective, nothing that rustles. Leave the bright phone case at camp and take a light layer you can tie off, because the swing between a pre-dawn start and midday is real.'],
['p' => 'Two to four hours over soft sand is genuine effort even for fit travellers. Camps will happily split a group into a short loop that returns for breakfast and a long one that goes out all morning — describe a normal week of your own fitness and the plan will be right.'],
                ],
                'pull'  => 'Being able to stand still, quietly, for ten minutes is the skill that makes a walk.',
            ],
            [
                'title'   => 'Gorilla permits: a realistic timeline',
                'kicker'  => 'Uganda & Rwanda',
                'date'    => 'May 2026',
                'image'   => '/uploads/2026/06/mountain-gorilla-17fa1f-scaled.webp',
                'excerpt' => 'How far ahead families and seasons are booked out, and what happens if your flight moves.',
                'read'    => '7 min',
                'body'    => [
                    ['p' => 'Daily public allocations in the Virunga sector are capped, so the reliable months — June to September, plus the dry weeks of December and January — are effectively spoken for a year ahead on the well-known families. Shoulder months are easier to secure and often better to look at, with softer light and no queue at the briefing.'],
['p' => 'What changes after you book is rarely the permit; it is the flight. Because the parks sit two hours from Kigali, an airline schedule change can be absorbed. Arriving via Entebbe it cannot, which is why we build in a buffer night.'],
['p' => 'If your dates are fixed, secure the permit first and shape the flights around it. Inverting that order is the most common and most expensive mistake on a primate trip: the permit is the scarce item, and everything else has substitutes.'],
                ],
                'pull'  => 'Hold the permit for a month and move a flight, never the other way round.',
            ],
            [
                'title'   => 'Helicopter country: when a charter beats a light aircraft',
                'kicker'  => 'Logistics',
                'date'    => 'April 2026',
                'image'   => '/uploads/2026/07/okavango-delta-botswana-activity-70c390-1350x844.webp',
                'excerpt' => 'Payload, noise, low-level routing, and the places with no runway to land at.',
                'read'    => '8 min',
                'body'    => [
                    ['p' => 'A turbine bush plane carries more bags, more people and covers ground faster. A helicopter lands where there is no strip, flies low enough for passengers to read the behaviour of what they are seeing, and works in crosswinds that would delay a fixed-wing operator. On a dry valley floor or a sandbank camp, that decides whether the leg happens at all.'],
['p' => 'The trade-offs are cost and range: rotor time is expensive, baggage is counted in kilograms rather than pieces, and past a certain distance you are buying two fuel stops instead of one flight.'],
['p' => 'Our rule of thumb is blunt — if the camp has a defined strip, use the aircraft. If the plan depends on landing off-airfield, moving a camp mid-wet, or reaching a fly-camp that will have shifted by the time you fly, budget for the helicopter and book the fuel stops with the operator.'],
                ],
                'pull'  => 'Half of a good Africa itinerary is knowing which aircraft the last hundred kilometres needs.',
            ],
            [
                'title'   => 'The guiding standard, explained',
                'kicker'  => 'Guides',
                'date'    => 'March 2026',
                'image'   => '/uploads/2026/06/african-elephant-b96130-sq.webp',
                'excerpt' => 'Why a long training pipeline changes what a morning on foot feels like.',
                'read'    => '6 min',
                'body'    => [
                    ['p' => 'Southern Africa’s professional guiding bodies examine candidates on natural history, tracking, firearm handling and group management across several years of logged field time — not a weekend certificate. It is why a good range can tell you what crossed the camp at three in the morning and what it was chasing.'],
['p' => 'For a client the visible effect is pacing. A trained guide reads weather, behaviour and the mood of the vehicle, will happily drive forty minutes for one cat, and then turn for camp at dusk because the light is finished.'],
['p' => 'Instead of asking whether guides are qualified, ask who your guide will be and how many seasons they have spent in that particular park. Camps with stable teams outperform camps with prestige on almost every measure that touches a trip.'],
                ],
                'pull'  => 'The gap between a good day and a memorable one is usually the person holding the radio.',
            ],
        ];
    }

    public static function story(int $index): ?array
    {
        $stories = static::stories();

        return $stories[$index] ?? null;
    }

    public static function operatingLede(): array
    {
        return [
            'Fitzroy Travel works across seven countries, providing seamless experiences in some of the continent’s most extraordinary places.',
            'From the dynamic wilderness of Botswana to the forests of Uganda and the desert isolation of Namibia, our safaris are as varied as the landscapes they move through.',
        ];
    }

    public static function whyFitzroy(): array
    {
        return [
            'Our independence lets us stay dedicated to bespoke planning: trips shaped around what each client actually wants, with no shareholder expecting volume.',
            'That personal approach rests on long-standing relationships with local partners — connections built over decades, which is what makes an unusually good day possible.',
        ];
    }

    public static function commitment(): array
    {
        return [
            'We are committed to ensuring our presence is a positive one, acting as a bridge to foster cross-cultural understanding rather than a source of entertainment.',
            'We believe in empowering communities to invite guests into their world on their own terms, rather than treating them as part of the scenery.',
        ];
    }

    public static function legal(): array
    {
        return [
            'financial-protection' => [
                'title' => 'Financial protection',
                'lede'  => 'Client money is protected so that, in the unlikely event of a failure, you are either refunded or repatriated.',
                'body' => [
                    'Fitzroy Travel Ltd operates under a bond approved by an accredited body, which covers every payment made to us for services not yet delivered.',
                    'Where a trip is sold from the United Kingdom, our Air Travel Protection arrangements cover the cost of completing your holiday and of returning you home. Details of the scheme, and how to contact them, are sent with your booking confirmation.',
                    'We are happy to talk through exactly how your payments are protected before you commit anything. Ask and we will send the certificate.',
                ],
            ],
            'privacy-policy' => [
                'title' => 'Privacy policy',
                'lede'  => 'What we collect, why we collect it, and how to make it stop.',
                'body' => [
                    'We hold only what a bespoke trip requires: names and passports for flight and permit bookings, dietary and medical notes for the camps that need them, and a record of the conversation we had about what you want from the journey.',
                    'We do not sell that information, and we share it only with the specific lodge, pilot or guide who needs it to look after you. Payments are taken through an accredited processor and we never see card details.',
                    'Analytics and session-recording scripts on the site can be switched off for your browser; if you would like a copy of what we hold, or would like it deleted, email us and it will be done within a month.',
                ],
            ],
            'terms-conditions' => [
                'title' => 'Terms & conditions',
                'lede'  => 'The booking terms in plain English, plus the points most worth reading carefully.',
                'body' => [
                    'A quotation is an outline, not a contract: places, permits and flight schedules are confirmed only when you instruct us to book, at which point a deposit becomes due.',
                    'International flight and permit costs are outside our control and are always shown separately. Prices quoted are per person, based on two people sharing, and are confirmed in writing at the point of booking.',
                    'If you need to cancel, our cancellation charges are designed to recover only what we have already committed to third parties. We strongly recommend insurance that covers curtailment and medical evacuation, and are glad to advise on what to look for.',
                ],
            ],
        ];
    }
}
