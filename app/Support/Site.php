<?php

namespace App\Support;

/**
 * Everything that is not a trip page: the homepage blocks, the place pages,
 * the guides, the promise, the FAQ and the policy text.
 *
 * All photography referenced here comes out of the "bro tour" Drive folder via
 * Tours::img(), so the site has exactly one source of images: the client's own.
 *
 * Places where a real-world fact is needed but not yet supplied are written as
 * square-bracket fields (e.g. [company legal name]) and listed in the README.
 */
class Site
{
    public static function hero(): array
    {
        return [
            'eyebrow' => 'sharm el-sheikh · south sinai',
            'title'   => 'the reef, the mountains, and one day that does both',
            'lede'    => 'Twenty trips we run ourselves out of Naama Bay — boat days on the reef, quads and camels in the foothills, dolphins for the children, Cairo by air when you want the pyramids. Pick-up from your hotel, price before you pay, nothing hidden at the end of the day.',
            'scroll'  => 'scroll for the trips',
            'credit'  => 'Photographed on our own trips',
            'image'   => Tours::img('tiran-island-snorkelling', 2, 1800),
            'alt'     => 'Snorkellers over the reef shelf at Tiran Island, Sharm el-Sheikh',
        ];
    }

    public static function intro(): array
    {
        return [
            'eyebrow' => 'who you are booking with',
            'title'   => 'a small outfit in Naama Bay, not a call centre',
            'body'    => [
                'We are a handful of guides, boat captains and drivers working out of Sharm el-Sheikh. When you send an enquiry it lands with one of us, and the same person who quoted you is the one waiting at your hotel gate with a sign and a bottle of cold water.',
                'The trips on this site are the ones we actually run: the boats we know the crews of, the canyon we have walked in every season, the camp where we eat rather than the one we are paid to drop at. If a day does not suit your group, we say so, and suggest the one that does.',
            ],
            'cards'   => [
                [
                    'image'  => Tours::img('white-island', 2, 900),
                    'alt'    => 'White Island sandbar seen from the boat at low tide',
                    'kicker' => 'on the water',
                    'label'  => 'Reef boats & sandbars',
                ],
                [
                    'image'  => Tours::img('super-safari', 1, 900),
                    'alt'    => 'Quad bikes stopped on the desert plateau above Naama Bay',
                    'kicker' => 'in the desert',
                    'label'  => 'Quads, camels & bedouin camps',
                ],
                [
                    'image'  => Tours::img('new-cairo-giza-museum', 0, 900),
                    'alt'    => 'The pyramids of Giza seen from the causeway',
                    'kicker' => 'further afield',
                    'label'  => 'Cairo, pyramids & the canyon',
                ],
            ],
        ];
    }

    public static function operating(): array
    {
        return [
            'Everything starts from the bay in front of the marina and works outwards: the reef shelf a few minutes offshore, Ras Mohammed and Tiran to the south, the foothills behind the town, the canyon over the mountains, and Cairo when you have the appetite for a very long, very good day.',
        ];
    }

    public static function why(): array
    {
        return [
            'No marketplace, no broker, no second-hand booking. The person who answers your message is the person who runs the day, so changes are made in one conversation instead of a chain of forwarded emails.',
            'Boat days are the ones that go wrong elsewhere: a crowded deck, a snorkelling stop cut short, a lunch that is a plastic-wrapped sandwich. We only put you on boats we have been on, at a size the boat is rated for, and we would rather move your date than squeeze you on.',
            'Prices are given before you pay and do not move afterwards. A trip cancelled more than 24 hours ahead is refunded in full, and if the sea cancels the trip on us, you choose between another day or your money back — we do not offer a voucher and hope you forget about it.',
        ];
    }

    public static function promise(): array
    {
        return [
            'image' => Tours::img('bedouin-safari', 4, 1100),
            'badge' => 'every trip, every time',
            'text'  => 'You will never be handed to a stranger. The guide who meets you at the gate stays with you for the whole day, and the number you messaged that morning still answers at nine at night when the boat is late coming back.',
            'name'  => 'the house rule',
            'role'  => 'written on the wall by the office door',
        ];
    }

    public static function process(): array
    {
        return [
            'eyebrow'   => 'how a booking works',
            'lede'      => 'Four steps, usually inside a day. Nothing is charged until the trip is confirmed, and the plan is written down where you can read it back to us.',
            'steps'     => [
                [
                    'title' => 'Tell us the day',
                    'body'  => 'Dates, how many of you, the hotel, and what you want out of it. A sentence is enough to start — the form on the contact page or a WhatsApp message.',
                ],
                [
                    'title' => 'We price it honestly',
                    'body'  => 'You get a per-person price for the trip as it will actually run, including pick-up and what is on it, plus the private version if a shared boat is not your thing.',
                ],
                [
                    'title' => 'Confirm and we hold it',
                    'body'  => 'We book the boat, the guide and the car. You get the pick-up time the evening before, by message, from the driver who is coming.',
                ],
                [
                    'title' => 'Pay on the day, or before',
                    'body'  => 'Card, cash or transfer — your choice, and the balance is settled at the end of the day, not at a desk in a lobby.',
                ],
            ],
            'background' => Tours::img('ras-mohammed-bus-trip', 3, 1600),
            'image'      => Tours::img('parasailing', 1, 1272),
            'credit'     => 'Between trips, over the bay',
        ];
    }

    public static function approach(): array
    {
        return [
            'eyebrow' => 'how the days are built',
            'title'   => 'one group, one guide, no shopping stops',
            'body'    => [
                'Every trip on this site has a maximum group size and a fixed shape: when you leave, how long you are on the water, where you eat. If something changes — wind, a late boat, an illness in the group — the guide decides on the day, not a dispatcher three kilometres away.',
                'There is no jewellery shop, no papyrus institute, no forced tea stop on any itinerary we run. If you want to buy saffron in the old souq we will drop you there and come back for you, but it is never bolted onto the end of a boat day to make somebody else a commission.',
            ],
            'image'   => Tours::img('colored-canyon', 5, 1200),
            'alt'     => 'Walking out of the Colored Canyon across the sandy wadi floor',
        ];
    }

    public static function stats(): array
    {
        return [
            ['value' => (string) count(Tours::all()), 'label' => 'trips & transfers we run'],
            ['value' => '24h', 'label' => 'free cancellation on everything'],
            ['value' => '2', 'label' => 'languages on every trip — English and Arabic'],
            ['value' => '1', 'label' => 'number you message, start to finish'],
        ];
    }

    /**
     * Places, each one a silo into the trips that start there.
     */
    public static function areas(): array
    {
        return [
            [
                'slug'  => 'naama-bay',
                'name'  => 'Naama Bay',
                'strap' => 'Where every boat day starts',
                'blurb' => 'The marina, the promenade and the point of departure for almost everything on this site — snorkelling boats, speed boats, the submarine and the parasailing winch.',
                'image' => Tours::img('speed-boat', 1, 900),
                'alt'   => 'Speed boat leaving the pier at Naama Bay',
                'trips' => ['speed-boat', 'parasailing', 'submarine', 'glass-bottom-boat', 'soho-square-transfer', 'naama-bay-transfer'],
            ],
            [
                'slug'  => 'ras-mohammed',
                'name'  => 'Ras Mohammed',
                'strap' => 'Egypt’s oldest marine park',
                'blurb' => 'Eighty square kilometres of coral, salt lakes and raised reef at the very tip of the peninsula, with the drop-off at Shark Bay within a swim of the beach.',
                'image' => Tours::img('ras-mohammed-bus-trip', 0, 900),
                'alt'   => 'Snorkellers over the reef wall at Ras Mohammed',
                'trips' => ['ras-mohammed-bus-trip', 'white-island', 'tiran-island-snorkelling'],
            ],
            [
                'slug'  => 'tiran-strait',
                'name'  => 'Tiran & the strait',
                'strap' => 'Four named reefs, one island',
                'blurb' => 'A protected island at the mouth of the gulf, ringed with reef that has never been fished or picked, and close enough to reach by boat before the wind comes up.',
                'image' => Tours::img('tiran-island-snorkelling', 5, 900),
                'alt'   => 'Coral and fish on the reef slope at Tiran Island',
                'trips' => ['tiran-island-snorkelling', 'white-island', 'glass-bottom-boat'],
            ],
            [
                'slug'  => 'sharm-old-town',
                'name'  => 'Old Town & the souq',
                'strap' => 'Spices, alabaster and the fish market',
                'blurb' => 'The original fishing village the resort grew around. Go in the evening, walk the souq from the mosque to the corniche, and eat whatever came off the boats that afternoon.',
                'image' => Tours::img('old-town-transfer', 0, 900),
                'alt'   => 'Sharm el-Sheikh old market at dusk',
                'trips' => ['old-town-transfer', 'farsha-cafe-transfer', 'private-airport-transfer'],
            ],
            [
                'slug'  => 'sinai-backcountry',
                'name'  => 'The foothills & the canyon',
                'strap' => 'Quads by dusk, sandstone by day',
                'blurb' => 'Immediately behind the town the ground goes up into wadis and coloured sandstone. Half of our desert trips start at a hotel gate and finish on a plateau watching the lights come on below.',
                'image' => Tours::img('colored-canyon', 0, 900),
                'alt'   => 'Walking the slot of the Colored Canyon in South Sinai',
                'trips' => ['super-safari', 'bedouin-safari', 'colored-canyon', 'horse-riding'],
            ],
            [
                'slug'  => 'cairo',
                'name'  => 'Cairo & Giza',
                'strap' => 'A very long, very good day',
                'blurb' => 'Six hours by road or an early flight, and by dinner you have seen the plateau, the museums and a city of twenty million people that has never once stopped being busy.',
                'image' => Tours::img('new-cairo-giza-museum', 3, 900),
                'alt'   => 'The Grand Egyptian Museum with the pyramids beyond',
                'trips' => ['new-cairo-giza-museum', 'old-cairo'],
            ],
        ];
    }

    public static function area(string $slug): ?array
    {
        foreach (self::areas() as $area) {
            if ($area['slug'] === $slug) {
                return $area;
            }
        }

        return null;
    }

    public static function faq(): array
    {
        return [
            [
                'q' => 'How far ahead should I book a trip?',
                'a' => 'Two or three days is usually plenty outside the Egyptian school holidays and the last two weeks of December. Boat days are the exception — good weekends sell out the size of boat that has shade and a proper ladder, so send the date as soon as you have it.',
            ],
            [
                'q' => 'Is hotel pick-up included in the price?',
                'a' => 'Yes, on every trip except where the page says otherwise. Pick-up is from your hotel gate, and the price is the same whether you are staying in Naama Bay, Haab Street, the Sharm bays to the north, or the old town.',
            ],
            [
                'q' => 'Can we have a private boat or a private car instead of a group?',
                'a' => 'Almost always. Private versions cost more per head, and on the reef days they are usually the better buy: you choose the stop order, how long you stay, and whether lunch is on the boat or on the sand. Ask for the number of people you have and we will price both.',
            ],
            [
                'q' => 'What happens if the wind is up?',
                'a' => 'The captain makes that call, usually at dawn, and we message you before anyone is dressed. You then pick another day or take a full refund. Two of the trips on this site run in most weather — the submarine and the glass boat — because neither leaves the bay.',
            ],
            [
                'q' => 'Do I need to be able to swim to go snorkelling?',
                'a' => 'No, and we will make sure you are not asked to. A lifejacket keeps you up without any effort, the guides stay in the water beside the group, and the shallow stops at Tiran and Ras Mohammed have coral in a metre of water.',
            ],
            [
                'q' => 'Is alcohol served on the boats?',
                'a' => 'Not on our boats. Soft drinks, water, tea and coffee are included, and the cafés and bars in Naama Bay and Soho Square are where that part of the evening happens — a transfer can be added to either.',
            ],
            [
                'q' => 'How and when do I pay?',
                'a' => 'Nothing is charged when you book; a deposit only applies to the Cairo days, where flight seats are bought, and to private boats. On everything else you settle at the end of the day by card, cash or transfer, and you get a receipt either way.',
            ],
            [
                'q' => 'What if my flight is delayed or cancelled?',
                'a' => 'Send us the flight number. Airport transfers are tracked and the driver waits; for a trip on the day you land, book the afternoon slot and we will move it at no cost if the aircraft does not turn up.',
            ],
        ];
    }

    /**
     * Practical guides. Written for this site, from the trips themselves.
     */
    public static function guides(): array
    {
        return [
            [
                'slug'  => 'best-time-to-visit-sharm-el-sheikh',
                'title' => 'When to go: Sharm month by month',
                'strap' => 'Heat, wind, sea temperature and what each month is actually good for',
                'type'  => 'season',
                'lede'  => 'Sharm is a winter sun destination first and a summer one second. Here is the honest month-by-month version, with the water temperature at the reef rather than the brochure number.',
                'body'  => [
                    'The short answer: March to May and September to November. The air is in the high twenties, the sea is between 22° and 26°, the wind is usually a morning calm and an afternoon breeze, and the boats can stick to a schedule. If you are coming to be in the water rather than beside it, those are the months.',
                    'December to February is the reason half of Europe lands here. High temperatures of 21° to 23° sound unremarkable until you have spent a January in the shade of a boat awning with 21° water around you, which feels warm because the air is cooler. Evenings need a fleece, the wind can close a small boat, and the open-water stops are chosen for shelter. Sea temperature stays swimmable all winter.',
                    'June to August is hot in the way the brochures understate: 36° to 38° most days, dry, with the heat stored in the rocks all night. The sea is 27° to 29° and needs no wetsuit at all, and the reef is quietest at 7am. Plan water in the morning, shade at midday, desert after sunset — which is exactly when we run the quad and camel evenings in summer.',
                    'Two things that do not exist here: rain, and a bad season that shuts the place down. The whole year brings a handful of millimetres, usually in one or two winter bursts, so nothing here is weather-dependent except the wind. What actually ruins a boat day is the wind, and what makes a desert day miserable is August at 2pm. Everything else is a question of which side of the peninsula you sleep on.',
                ],
                'bullets' => [
                    'Best overall: March to early June and late September to November',
                    'Warmest water: August at 29°, and it feels it',
                    'Wetsuit? January to March a shorty is plenty; May to September nobody wants one',
                    'Wind, not rain, is what moves a boat day — the afternoons are breezier than the mornings',
                    'Book boats two or three days ahead outside the December peak and Egyptian school holidays',
                ],
                'image' => Tours::img('white-island', 5, 1400),
                'trips' => ['white-island', 'tiran-island-snorkelling', 'colored-canyon', 'super-safari'],
            ],
            [
                'slug'  => 'sharm-el-sheikh-with-children',
                'title' => 'Sharm el-Sheikh with children',
                'strap' => 'What works at three, seven and thirteen',
                'type'  => 'guide',
                'lede'  => 'A beach resort is easy; the trips are where it gets decided. What follows is what we see on the days themselves — which ages cope with a boat, which get bored in a museum, and what to book so nobody spends a full day miserable.',
                'body'  => [
                    'Under five: the submarine and the glass-bottom boat. Both are short, both are seated, neither needs a child to do anything except look, and both finish before the nap window closes. The dolphin show works too if you can get a front-row seat, which means accepting the splash.',
                    'Six to eleven: the swim-with-dolphins program is the day they will remember, and the shallows at Ras Mohammed and Tiran are kind to a child in a vest who can kick but not swim. Book the smaller boat. Quad bikes have an age limit for riding but not for sitting behind the guide on the safari jeeps, which is usually the better fit.',
                    'Twelve and up: the desert evenings. A super safari at their pace, or the Colored Canyon if there is a teenager in the group who needs to be given something slightly difficult to do. Parasailing is the one that gets argued about and then thanked for.',
                ],
                'bullets' => [
                    'Long boat days break before eleven — ask for the half-day or the two-stop version',
                    'Sun protection on a reef boat is a re-application job, not a morning one',
                    'The early 5am start on the Cairo days is the hard part, not the walking',
                    'Book the child seat in transfers at the same time as the car, not at the kerb',
                ],
                'image' => Tours::img('swim-with-dolphins', 2, 1400),
                'trips' => ['swim-with-dolphins', 'dolphin-show', 'submarine', 'glass-bottom-boat', 'super-safari'],
            ],
            [
                'slug'  => 'ras-mohammed-or-tiran',
                'title' => 'Ras Mohammed or Tiran: which reef day',
                'strap' => 'Two famous reefs, two different days',
                'type'  => 'guide',
                'lede'  => 'Both are protected, both have coral that starts within a few metres of the surface, and both are excellent. They are also completely different days, and choosing between them is mostly about how you like to travel.',
                'body'  => [
                    'Ras Mohammed is reached by road and bus, which means an early start, a long seat, and then a beach where you walk into the water over the reef flat. The drop at Shark Bay is dramatic — a wall straight down into blue with fish stacked along it — and the park interior (the salt lakes, the raised coral terrace) gives the day something for the person who is not swimming.',
                    'Tiran is a boat day: you leave the marina, the reefs are chosen for the conditions that morning, and lunch happens on board in the shade. You snorkel more often for less time each stop, and you see more coral, because you can be taken to four different reef faces instead of walking off one beach.',
                    'Our answer, when people ask: Tiran if you want to be in the water a lot and are happy on a boat; Ras Mohammed if you prefer your own timing on a beach, want the walk-about, or have someone in the group who would rather sit in the shade of the park than on a deck.',
                ],
                'bullets' => [
                    'Tiran: 3–4 stops, guided in the water, all from one boat',
                    'Ras Mohammed: one beach, walk in whenever, plus the park sightseeing',
                    'Neither needs experience; both need a mask that fits',
                    'December to February the boat day depends on the wind, the bus day does not',
                ],
                'image' => Tours::img('tiran-island-snorkelling', 7, 1400),
                'trips' => ['tiran-island-snorkelling', 'ras-mohammed-bus-trip', 'white-island'],
            ],
            [
                'slug'  => 'one-day-in-cairo-from-sharm',
                'title' => 'Cairo from Sharm in a day: fly or drive',
                'strap' => 'The two ways to do it, and what each costs you in sleep',
                'type'  => 'guide',
                'lede'  => 'Five hundred kilometres and two entirely different days. This is the trade-off in plain terms, so nobody books the road option expecting a relaxed morning.',
                'body'  => [
                    'Flying means an airport transfer, a roughly fifty-minute sector, and roughly nine to ten hours on the ground in Cairo. You see the plateau early, the museum after, and you are back in bed at a sensible hour. It costs more, and the day depends on two flight rotations going to plan.',
                    'Driving is a genuinely long day — around six hours each way on a good road, which makes it a fifteen-hour affair including the sites. It costs much less per person, and the coach is comfortable, and a fair number of guests tell us the desert in the headlights at 4am was worth the price difference on its own.',
                    'Whichever you choose, do Giza before the museum, not after: the light, the crowd and your own energy are all better in the first two hours, and the museum is a place where the shade and the air-conditioning matter by midday.',
                ],
                'bullets' => [
                    'Book the flight version if there is anyone in the group under ten or not fond of long car rides',
                    'Passport for the checkpoint at the plateau gate, and for check-in obviously',
                    'Mummies hall and the pyramid interior are extra tickets — tell us in advance, they are time-fixed',
                    'Friday and Saturday are the busy local days; Tuesday and Wednesday are quiet',
                ],
                'image' => Tours::img('old-cairo', 1, 1400),
                'trips' => ['new-cairo-giza-museum', 'old-cairo'],
            ],
            [
                'slug'  => 'what-to-pack-for-a-red-sea-boat-day',
                'title' => 'What to pack for a Red Sea boat day',
                'strap' => 'Six things, in the order people forget them',
                'type'  => 'guide',
                'lede'  => 'Boat gear is cheap to get right and impossible to buy at the pier. This is what we tell every group the evening before, and it fits in one day bag.',
                'body'  => [
                    'Rashguard or a thin long-sleeve top first, before sunscreen. Two hours of snorkelling in a T-shirt is how people end the day with sunburn through their clothes, and a rash guard also keeps you warm at the third stop when the wind does turn.',
                    'Reef shoes, not flip-flops: the coral flats at Tiran and Ras Mohammed are sharp and the boat ladder is hot. Then a mask that actually seals — borrowed masks are the single biggest cause of a half-skipped stop — and a dry bag or a phone lanyard, because the second-most common lost item after a phone is a pair of sunglasses, both of which go over the side the moment somebody turns round too fast.',
                    'Finally: a towel of your own, a hat for the deck, and one change of clothes left in the car rather than in your cabin, so the drive home is not done in a wet swimsuit under the air conditioning.',
                ],
                'bullets' => [
                    'Mask, snorkel, fins are provided — bring your own mask if you have one you trust',
                    'Sunscreen is reef-safe on most boats; ask and we will confirm for yours',
                    'Motion sickness tablets before departure, not after the first swell',
                    'Cash small notes for the crew, which is a day’s work for the deckhands',
                ],
                'image' => Tours::img('white-island', 7, 1400),
                'trips' => ['tiran-island-snorkelling', 'white-island', 'speed-boat', 'glass-bottom-boat'],
            ],
            [
                'slug'  => 'desert-evenings-quad-or-camel',
                'title' => 'Desert evenings: super safari or the short one',
                'strap' => 'What the four-hour version leaves out, and whether you care',
                'type'  => 'guide',
                'lede'  => 'Both desert evenings go up the same track into the same foothills. One is four hours and ends after dinner; the other is five and adds a jeep to the sunset point and a camel to the gate.',
                'body'  => [
                    'Take the longer one if the group is keen on the quads and wants the viewpoint at the right light, or if somebody in the party has never sat on a camel and is not going to get another chance this trip. The jeep leg is the part people photograph most, because it stops where the town and the gulf are both in frame.',
                    'Take the shorter one with small children, with anyone who has had a long day already, or if the quads are the point and the rest is padding. You get the same riding, the same camp, the same bread off the coals, and you are back by eight.',
                    'Whatever you pick: trousers and closed shoes, not sandals, and expect to be dusty at the end. The scarves we hand out for the bikes are also the reason nobody sneezes through dinner.',
                ],
                'bullets' => [
                    'Neither needs a driving licence; neither is ridden alone',
                    'October to April is the comfortable window for the bike legs',
                    'Vegetarian food at the camp is normal, just say so when booking',
                    'Full-moon nights are booked by locals; plan around them in Ramadan and Eid weeks',
                ],
                'image' => Tours::img('super-safari', 3, 1400),
                'trips' => ['super-safari', 'bedouin-safari', 'horse-riding'],
            ],
        ];
    }

    public static function guide(string $slug): ?array
    {
        foreach (self::guides() as $guide) {
            if ($guide['slug'] === $slug) {
                return $guide;
            }
        }

        return null;
    }

    /** 1 = recommended, 2 = transitional, 3 = challenging. */
    public static function seasonMonths(): array
    {
        return [2, 2, 1, 1, 1, 2, 3, 3, 1, 1, 1, 2];
    }

    public static function seasonTable(): array
    {
        return [
            ['Jan', 21, 12, 'Sea 21°. Mild, windy on the open water, warm at midday.'],
            ['Feb', 23, 12, 'Sea 21°. Same, with the first warm afternoons.'],
            ['Mar', 26, 16, 'Sea 22°. Best month overall — long light, calm mornings.'],
            ['Apr', 30, 19, 'Sea 23°. Reef is at its clearest; book boats early.'],
            ['May', 33, 22, 'Sea 25°. Hot but dry, and the water is bath-warm.'],
            ['Jun', 36, 26, 'Sea 27°. Long days, strong sun, wind picks up late.'],
            ['Jul', 38, 29, 'Sea 28°. Genuinely hot: desert trips go after sunset.'],
            ['Aug', 38, 29, 'Sea 29°. Warmest water of the year, warmest nights.'],
            ['Sep', 35, 26, 'Sea 28°. The heat breaks; the best diving month.'],
            ['Oct', 31, 22, 'Sea 26°. Returns to ideal — 30s on land, 26° in the sea.'],
            ['Nov', 26, 17, 'Sea 24°. Shorter days, occasional wind, very good value.'],
            ['Dec', 22, 13, 'Sea 22°. Cool evenings, mild water, quiet boats.'],
        ];
    }

    public static function about(): array
    {
        return [
            'eyebrow' => 'about us',
            'title'   => 'we stayed here first, then we stayed',
            'body'    => [
                'Brothers Sharm Tour started as the thing friends asked us to organise when they came down for the week: a boat on the Saturday, a canyon for the fit ones, a car to the airport at four in the morning. Then more friends, then friends of friends, then the day it stopped being something we did for people we knew.',
                'We kept the shape of it. Small number of trips, run with the same captains, the same guides and the same drivers, in a town where you can walk to the boat. That is not a scale model of a big operator — it is a different thing, and it is why a change to your plan takes one phone call.',
            ],
            'second'  => [
                'What we do not do: no trips we have not done, no boat we have not been on, no shop stop for a commission, and no price that changes when you are standing on the pier with your wallet out.',
                self::officeLine() . ' Most of what we do is by message and word of mouth, which is why the trip pages here are written by the people who run the days rather than by a marketing department.',
            ],
        ];
    }

    /**
     * The office sentence is assembled from config, and shrinks to whatever you
     * have actually filled in — a published page should never show square
     * brackets to a customer.
     */
    public static function officeLine(): string
    {
        $lines   = (array) (config('site.contact.address_lines') ?: []);

        foreach ($lines as $line) {
            if (trim((string) $line) !== '' && !preg_match('/^(?:Sharm el-Sheikh|South Sinai|Egypt)/i', trim((string) $line))) {
                $address = trim((string) $line);
                break;
            }
        }

        $legal = trim((string) (config('site.legal_name') ?: ''));

        if ($address && $legal !== '') {
            return sprintf('The office is at %s, the number is on every page, and %s is on the booking terms if you want the paperwork.', $address, $legal);
        }

        if ($address) {
            return 'The office is at ' . $address . ' and the number is on every page.';
        }

        return 'The number is on every page, and the paperwork is on the booking terms.';
    }

    public static function commitment(): array
    {
        return [
            'Every price is quoted for the trip as it will actually run, with pick-up and inclusions written on the page before you ask.',
            'If we cancel for weather you choose the date or the money, and there is no argument about it.',
            'The same person handles your booking from the first message to the drive back to your hotel.',
        ];
    }

    public static function legal(): array
    {
        return [
            'booking-terms' => [
                'title'   => 'Booking terms',
                'updated' => 'September 2026',
                'blocks'  => [
                    [
                        'h' => 'Booking and confirmation',
                        'p' => [
                            'A trip is booked when we confirm it in writing, by email or message, with a price and a pick-up time. Enquiries are not bookings, and a place on a boat is not held without a confirmation.',
                            'Where a deposit applies — the Cairo days and private boats — it is stated before you agree and paid in advance. The balance is settled at the end of the trip unless we have agreed otherwise in writing.',
                        ],
                    ],
                    [
                        'h' => 'Changes, and cancelling your trip',
                        'p' => [
                            'Free cancellation up to 24 hours before the pick-up time on every trip. Inside 24 hours, or if you do not appear at the pick-up point, we charge the full price of the places held for you, because the boat and the guide were held too.',
                            'Name changes and date changes are free whenever we can move them. If a trip is cancelled by us — weather, mechanical failure, a guide off sick — you are offered another date or a full refund, at your choice, and the refund is made within seven days.',
                        ],
                    ],
                    [
                        'h' => 'On the day',
                        'p' => [
                            'Pick-up times are fixed by the tide, the traffic and the boat schedule, and the driver will wait ten minutes at your gate. If you are not there and cannot be reached, the trip is treated as a no-show.',
                            'Safety instructions from a captain or guide are not optional. Anyone who will not follow them can be asked to sit the activity out, and unused parts of a day are not refundable in that case.',
                        ],
                    ],
                    [
                        'h' => 'Health, insurance and responsibility',
                        'p' => [
                            'Snorkelling, boat travel, quad bikes and desert driving carry risk. Tell us about heart or respiratory conditions, pregnancy, recent surgery, ear problems or medication that affects alertness before you book, and take out travel insurance that covers activities — it is a condition of booking.',
                            '[Company legal name] is the operator of the trips listed on this site. Third-party transport, cafés and museum entry are provided by the operators named on your confirmation.',
                        ],
                    ],
                ],
            ],
            'privacy-policy' => [
                'title'   => 'Privacy',
                'updated' => 'September 2026',
                'blocks'  => [
                    [
                        'h' => 'What we collect',
                        'p' => [
                            'The enquiry form on this site collects your name, email, phone number, the trip you are asking about, your dates and your message. That is all it asks for, and it is all we keep.',
                            'We do not run advertising pixels, embedded social widgets or marketing trackers on these pages, and there is no third-party analytics script setting a cookie when you arrive.',
                        ],
                    ],
                    [
                        'h' => 'Why we keep it',
                        'p' => [
                            'To price and run your trip, to send the pick-up time, and to answer you. Enquiries that do not become bookings are deleted after twelve months unless you have asked us to keep something on file.',
                            'Where a boat, camp or driver needs your name to let you on board, we pass only that name and the number of people. Nothing is sold, and no mailing list is built from it.',
                        ],
                    ],
                    [
                        'h' => 'Your rights',
                        'p' => [
                            'Message or email us and we will send you what we hold, correct it, or delete it. If you would rather not be contacted about a trip after it has run, say so once and it is done.',
                            'Photographs and films taken on our trips are only published with the agreement of the people in them. Tell your guide you do not want to be in them and that is settled for the day.',
                        ],
                    ],
                ],
            ],
            'cancellation-policy' => [
                'title'   => 'Cancellation & refunds',
                'updated' => 'September 2026',
                'blocks'  => [
                    [
                        'h' => 'The short version',
                        'p' => [
                            'More than 24 hours before pick-up: cancel, change date or move people, free, refunded in full. Inside 24 hours: the trip is charged, because the places were held.',
                            'Cancelled by us for weather or anything else on our side: another day, or a full refund of everything paid, back within seven days.',
                        ],
                    ],
                    [
                        'h' => 'Deposits, flights and the Cairo days',
                        'p' => [
                            'Cancellations inside 24 hours of a Cairo day lose the deposit, because the flight seats are already bought. Where a seat can be refunded by the airline, we claim it back and pass it to you.',
                            'If your flight into Sharm is delayed or cancelled and you miss a booked trip, tell us as early as you can: we will move you to the next available day at no charge wherever the season allows.',
                        ],
                    ],
                    [
                        'h' => 'Medical and compassionate cases',
                        'p' => [
                            'Illness or bereavement during your trip is handled individually, not by a policy — send the documentation you have and we will find the fairest option available, including moving the trip to another day.',
                            'This is why travel insurance is a condition of booking. It covers the parts of a ruined week that an operator here cannot.',
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function legalPage(string $slug): ?array
    {
        $pages = self::legal();

        if (! isset($pages[$slug])) {
            return null;
        }

        $page  = $pages[$slug];
        $first = $page['blocks'][0]['p'][0] ?? '';

        // Every policy page gets its own snippet instead of the site default.
        $page['excerpt'] = $first !== ''
            ? $first . ' Last reviewed ' . $page['updated'] . '.'
            : 'The terms we work to, written plainly. Last reviewed ' . $page['updated'] . '.';

        return $page;
    }

    /** Site-wide footer note + enquiries copy, in one place. */
    public static function contactCopy(): array
    {
        return [
            'lede'   => 'One form, one message or one phone call — whichever is quicker from where you are. Tell us who is coming, roughly when, and what you would hate to miss.',
            'note'   => 'We answer messages between 7am and 11pm, Sharm time, and usually inside the hour.',
            'private' => 'Your details are used to price and run your trip, and for nothing else.',
        ];
    }
}
