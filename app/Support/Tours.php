<?php

namespace App\Support;

/**
 * Excursions & day trips — the catalogue behind /tours.
 *
 * Content source: the "bro tour" Google Drive folder. Each tour below is one
 * sub-folder; the photos and clips are listed in Drive and pulled through
 * App\Support\Drive (see that file for the two hosting modes).
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  BEFORE YOU GO LIVE
 *  'price' is deliberately null everywhere, which renders as "Price on
 *  request". Set a number (USD, per person, or per car for transfers) and it
 *  prints as "from $X". 'duration', 'meeting', 'included' and 'excluded' are
 *  written from how these trips normally run out of Sharm — check them against
 *  what you actually provide, they are the lines clients hold you to.
 * ─────────────────────────────────────────────────────────────────────────
 */
class Tours
{
    /** Name of the parent Drive folder — the loose images sit here. */
    public const ROOT_FOLDER = 'bro tour';

    public const CATEGORIES = [
        'sea'        => 'Sea & reef',
        'desert'     => 'Desert & mountains',
        'adrenaline' => 'Adrenaline',
        'family'     => 'Dolphins & family',
        'culture'    => 'Cairo & culture',
        'transfer'   => 'Private transfers',
    ];

    public static function all(): array
    {
        return [
            /* ── 1 · White Island ──────────────────────────────────────── */
            [
                'slug'       => 'white-island',
                'title'      => 'White Island',
                'folder'     => 'whiet island',
                'category'   => 'sea',
                'strap'      => 'Boat day to the sandbar at the tip of Sinai',
                'duration'   => 'Full day, around 9 hours',
                'meeting'    => 'Hotel pick-up in Naama Bay, Haab Street and Sharm districts',
                'price'      => null,
                'level'      => 'Easy — swimming ability helps, a lifejacket does not have to',
                'season'     => 'Daily, March to November',
                'featured'   => true,
                'lede'       => 'Chalk-white sand, a sandbar that moves with the tide, and water that shifts from turquoise to deep blue in a few metres. The easiest way to spend a day doing almost nothing properly.',
                'body'       => [
                    'The boat leaves the marina in the morning and works its way out past the reef line. White Island is exactly what it says: a low shelf of pale sand in the middle of the Gulf of Aqaba, ankle-deep water around it, and almost always a mooring line of boats. You get a stretch of it to yourself for a swim stop, lunch on board, and time on the sand before the wind picks up.',
                    'Most trips pair the sandbar with a snorkelling stop on the nearby reef shelf, where the coral starts a few metres below the surface. If you would rather skip the snorkel and stay on the boat, say so at booking — the crew are used to it.',
                ],
                'highlights' => [
                    'Open-water swim stop on the sandbar',
                    'Snorkelling over the reef shelf with mask, fins and vest provided',
                    'Grilled fish and rice lunch served on board',
                    'Photos taken by the crew — usually on a memory card at the end of the day',
                ],
                'included'   => ['Hotel pick-up and drop-off by air-conditioned minibus', 'Boat, snorkel gear and lifejacket', 'Lunch and soft drinks', 'Snorkelling stop'],
                'excluded'   => ['Tip for the crew', 'Alcohol', 'Anything not listed as included'],
                'gallery'    => [
                    '154a1ZC_GMRTBO6pRFP-DqKwACFn9P0al|87.jpg',
                    '1ErhzmzZ74DPYzO6fFmPcfY-_hxitSfHK|RasMuhammedWhiteIslandSnorkelingTripLunch-SharmElSheikh.jpg',
                    '1mOF8fppqxzkNzy5iwjOokDCsxE-mScR6|RasMuhammedWhiteIslandSnorkelingSeaTrip-SharmElSheikh.jpg',
                    '1zKsnynpMIXeAEo3yMnwuuPri45LDvmg7|caption (4).jpg',
                    '1ZtleYUQGVhRXWFSsy4WR0llRYShXzFuo|caption (1).jpg',
                    '1dZwT-09oM81E2L_fhtbTjkGFtnPMTqql|caption (5).jpg',
                    '1rua5xL4_4yMrjC2evEyLqptdWr5OcNNm|caption (3).jpg',
                    '1SoxyYfXQ78E8v3qQLCRiliBsx7KhWivS|caption (2).jpg',
                    '1JafAQe0lB1oKURSP7n9UyoR_AvhScTnM|caption.jpg',
                    '143gac66Zu2dPXs0bllwEkpLtPK_Pd7hO|7b390ca5-2431-4c29-b6ad-9d9ecb0d35c8.jpeg',
                    '1OSZ6KErmpa41Rn6cxLHL0dGTT_Ziw5aW|360_F_344757172_TWGNffAcmXAumDGJEWg0gp5VgyTATiNn.jpg',
                    '1lGQVsyzhlu0JEfYx0f9gAQJaiVlClgRh|OIP (1).webp',
                    '1ngOcnXt70oFULa5JhajNjls8IPms8POf|OIP.webp',
                    '1JTnYAdwdyAWspP8BpcwwMrDdbfZPZ6Q3|146.jpg',
                    '1xLBegrylQYb02cIleQEv9wUwKf7TwjQ1|maxresdefault.jpg',
                    '1DlQxrYmEjh94qEJqoiMxsiKTyltRl8VK|SharmElSheikh_PrivateYachtTripwithLunchandDrinks.jpg',
                ],
                'video'      => [],
            ],

            /* ── 2 · Tiran Island ──────────────────────────────────────── */
            [
                'slug'       => 'tiran-island-snorkelling',
                'title'      => 'Tiran Island snorkelling trip',
                'folder'     => 'tiran island snorkling trip',
                'category'   => 'sea',
                'strap'      => 'Four reef stops around a protected island',
                'duration'   => 'Full day, around 10 hours',
                'meeting'    => 'Pick-up from your hotel, boat from Naama Bay marina',
                'price'      => null,
                'level'      => 'Easy to moderate — two of the stops involve some current',
                'season'     => 'Daily, all year; the sea is calmest April to October',
                'featured'   => true,
                'lede'       => 'Tiran sits at the mouth of the Gulf of Aqaba, protected as a nature reserve, so the reef around it has never been picked over. This is the trip to take if you want to actually see coral rather than hear about it.',
                'body'       => [
                    'The boat anchors at a sequence of named stops — Thomas Reef, Gordon, Woods and the Coral Bay on the north coast — each with a different character: drop-offs, a wreck, tables of hard coral, and shallow gardens where the fish are close enough to touch. Between stops you have lunch on board and a shadow to sit in.',
                    'Guides snorkel with the group at every stop, which matters more than it sounds: they know which side of the reef has the current at which hour, and where the turtles usually are.',
                ],
                'highlights' => [
                    'Three to four snorkelling stops chosen for the conditions on the day',
                    'Mask, fins, vest and a guide in the water with you',
                    'Lunch, fruit and soft drinks on board',
                    'Turtle and reef-shark sightings are common, never promised',
                ],
                'included'   => ['Hotel transfers', 'Boat with snorkelling equipment', 'Guide in the water', 'Lunch and drinks'],
                'excluded'   => ['Underwater camera or GoPro rental', 'Drinks other than those served', 'Crew tip'],
                'gallery'    => [
                    '1yzNiYomQ0E1Dsm8bXrZDxJ3ZVuHnC0Oq|0-tiran-island-boat-trip-in-sharm-el-sheikh-1663348666.jpg',
                    '1hZ11_0JoJo2vD5YSqwAhq6EHEmFpg0Gm|tiran island.jpeg',
                    '1hwMMl_AIsyFesf1PpxjLdkklJeLGlUbm|sharm-el-sheikh-snorkeling-trip-to-tiran-island-with-lunch-e122717356334288.webp',
                    '1zXwICJkNyNE5c6OFjhRP8AyS348kHI2O|TiranIslandSnorkelingseatrip,LunchTransfer-SharmElsheikh.jpg',
                    '10BW-NSKxgMpO4gAxNUG74M-nYBLdox96|TiranIslandSnorkelingseatrip,LunchTransfer-SharmElsheikh (1).jpg',
                    '1E96VwXBAtwfQLDED85ABZwp6myAm8-d4|podvodnii-mir-ostrova-tiran-750x521.jpg',
                    '1JIYKBbN-_vlUPAb4dZ-YXNoDz8ppcgXK|d4.jpg',
                    '1HK41YSPwjFXxsKLX4W1hwAabwtq2Ctka|OIP.webp',
                    '1PicR86P7VvpUgaUOzQjTf5dLeS2EDGx2|OIP (2).webp',
                    '1nbDisio9kpvQHyNQzqlpm0-mAHclzJ0Q|OIP (1).webp',
                ],
                'video'      => [],
            ],

            /* ── 3 · Swim with dolphins ────────────────────────────────── */
            [
                'slug'       => 'swim-with-dolphins',
                'title'      => 'Swim with dolphins',
                'folder'     => 'swim dolphin',
                'category'   => 'family',
                'strap'      => 'In the water with bottlenose dolphins, at their pace',
                'duration'   => 'Around 2 hours including transfers; 30 minutes in the water',
                'meeting'    => 'Pick-up from your hotel, or meet at the dolphin marina',
                'price'      => null,
                'level'      => 'Easy — you must be able to hold on and stay in shallow-deep water',
                'season'     => 'Daily, morning and afternoon slots',
                'featured'   => true,
                'lede'       => 'You hold the fin, the dolphin does the swimming, and for half an hour everything else is irrelevant. The session that children talk about for the rest of the holiday.',
                'body'       => [
                    'The program starts in a shallow pool where a trainer explains how to approach, hold and move, then moves to the deeper pen for the swim itself: a push or two on the fin, a handshake, a kiss, and photographs taken by an in-water photographer throughout.',
                    'Bookings run in slots of a handful of people at a time. If you would rather watch than get wet, a spectator ticket is cheaper, and worth it for grandparents.',
                ],
                'highlights' => [
                    'Briefing and shallow-water session with a trainer',
                    'Deep-water swim holding the dorsal fin',
                    'In-water photographer; photos usually available to buy at the desk',
                    'Wetsuit, towel and locker provided',
                ],
                'included'   => ['Hotel transfers', 'Full program with trainer', 'Wetsuit and towel', 'Locker for the session'],
                'excluded'   => ['Photography package', 'Spectator tickets unless added at booking'],
                'gallery'    => [
                    '16garWKCrJF_klm_GMzOjhF1Tm1fErpVd|Swimming-With-Dolphins9.jpg',
                    '1KGwvFNEznDgnADbsd7Q7QGsdBini5OW0|Swimming-With-Dolphins1.jpg',
                    '1pJOXcfGObdOIeIDBbdT5Aczc5Z13R0YP|SwimmingWithDolphine.jpg',
                    '13LzXf8W-_0GdKs4AHfx0Kbf8e1_tjS39|Play-with-dolphin-sharm-el-sheikh.webp',
                    '1AnZLF0Dp-VC1NoLADBQhnuT8hl2nUrQP|ef6a65d3f0f9558b5cc5f847d6ea05b0.jpg',
                    '19DLpzNHA_bhmF6KthrCNOp0EGKTN7dl9|SWIMMING-WITH-DOPHINS-HURGHADA-2-_5_11zon.jpg',
                    '1tj1GPP6VRSsTci1uqTBSg_G07gSVT7Bq|caption.jpg',
                    '1O_vvVvlKlxEyl9fAYNEVw8HxF5FcR4II|OIP (5).webp',
                    '10fKxEXDlFUuO0zM7R9x1yGcc9KKqHcJc|OIP (7).webp',
                    '1RYI_If-UWYwALeeyxzCSRr4tdsfYDA7v|OIP (6).webp',
                ],
                'video'      => [],
            ],

            /* ── 4 · Super safari ──────────────────────────────────────── */
            [
                'slug'       => 'super-safari',
                'title'      => 'Super safari',
                'folder'     => 'super safari',
                'category'   => 'desert',
                'strap'      => 'Quad bikes, jeeps, camels and a bedouin tent in one evening',
                'duration'   => 'Around 5 hours, usually 3pm to 8pm',
                'meeting'    => 'Pick-up from your hotel lobby',
                'price'      => null,
                'level'      => 'Moderate — you sit on a quad, a camel and a jeep, and walk a little in the sand',
                'season'     => 'Daily; best October to April when the desert cools',
                'featured'   => true,
                'lede'       => 'The name oversells nothing. Four hours in the foothills behind Naama Bay on four different kinds of transport, finishing with bread baked in the sand and tea with the family that hosts you.',
                'body'       => [
                    'The order is deliberate: quads out into the wadi while there is still light to see by, a jeep to the higher viewpoint for sunset, camels for the short walk to camp, then dinner. Helmets, headscarf and goggles are given out for the quads, and the guide keeps the group on tracks rather than on the reef-edge escarpment.',
                    'At camp there is bedouin bread pulled from hot coals, grilled meat and vegetables, tea over a fire and, most nights, a fire that somebody decides to dance around. Nobody performs for you; you are simply eating with people.',
                ],
                'highlights' => [
                    'Quad bike through the wadi and up onto the plateau',
                    'Sunset viewpoint reached by jeep',
                    'Short camel ride to the camp',
                    'Bedouin dinner: sand-baked bread, grilled food, fire and tea',
                ],
                'included'   => ['Hotel transfers', 'Quad bike with helmet, goggles and scarf', 'Jeep and camel ride', 'Bedouin dinner with tea'],
                'excluded'   => ['Driving licence is not needed for the quad', 'Alcohol', 'Tip for the camp and guide'],
                'gallery'    => [
                    '1EGIqgTJjwXuQET-n7Mb1WWwrANdqwyFx|caption (8).jpg',
                    '126j_JNYAZSQBNp6Ve0iJ5_HHuTiw6AQ2|caption (2).jpg',
                    '1XEp7UFpoUhs-933PXUj0JP7a2neqQuWf|caption (3).jpg',
                    '1TwXqZmybUXcYRpU_TVe20gZAlOBvpSBg|103e6ce7-0a2f-4428-9eef-b08ee58148d6.jpeg',
                    '1LkLQdCMEOzxPgKxiX-w0HiyLwVsEJSd7|5b388f62-4ce5-4f36-b639-940515ffee51-1024x1024.webp',
                    '1GppBRv5xpga5zNX3X-XvMJTlbPsdAgoy|OIP.webp',
                ],
                'video'      => [
                    '1tzKW6skw-PM6a0nLnpirywfk9W_vWiy9|927f1945-e93a-4f50-9602-ae2607243226 (1).mp4',
                ],
            ],

            /* ── 5 · Submarine ─────────────────────────────────────────── */
            [
                'slug'       => 'submarine',
                'title'      => 'Submarine reef dive',
                'folder'     => 'sub marin',
                'category'   => 'sea',
                'strap'      => 'See the reef from below the surface without getting wet',
                'duration'   => 'Around 2 hours including transfers; 45 minutes under water',
                'meeting'    => 'Pick-up from your hotel, dive centre on the Naama Bay shore',
                'price'      => null,
                'level'      => 'Very easy — you sit down, the boat does the rest',
                'season'     => 'Daily, all year',
                'featured'   => false,
                'lede'       => 'A semi-submarine with windows below the waterline: dry, air-conditioned, and looking out onto coral and fish at three metres. It is the trip for people who do not snorkel, and for very small children.',
                'body'       => [
                    'You board on deck, take a seat along the window row, and the vessel lowers itself enough to sit below the surface. A commentary runs in English and Arabic over the speakers while the reef slides past — parrotfish, groupers, the occasional reef shark, and the coral shelf itself.',
                    'There is no swimming and no gear, so it works in a light chop. If anyone in the family has been promising not to go in the water, this is how to keep the promise and still have the same afternoon.',
                ],
                'highlights' => [
                    'Below-waterline windows onto the reef',
                    'No swim, no gear, no wet hair',
                    'Commentary during the dive',
                    'Surface boat ride back past the marina',
                ],
                'included'   => ['Hotel transfers', 'Submarine dive and commentary', 'Seated place by the window'],
                'excluded'   => ['Photography inside (usually restricted to phones)', 'Snorkelling gear — this is a viewing trip'],
                'gallery'    => [
                    '1X1wUnfvYmRlH6__ui2XiFF6GvhCQtx7g|semisubmarinesharmelsheikh.jpg',
                    '17jb1n_hhupxgSAIufbrXoBrcGI1q2qm0|submarine-trip-in-sharm-el-sheikh_WXr14.jpeg',
                    '1BK2SrzeF3uR7yTihGJBZd1WfWWkjI7C4|hurghada-submarine-tour-seascope-snorkeling-hurghadatogo.jpg',
                    '1rdf3onRt0Zq60Fj3hV3SNzl7yrX6MRdn|1415138_1467967920095678_866477367_o-6.jpg',
                    '1x2FUEwwZWq_Xo2r_BWA6PhHRKAO-Luij|caption.jpg',
                    '1ecksE29GRsgLJZjiZFKag-3zsE2Y-3Bn|caption (1).jpg',
                    '1n_6_MbcLDU2JbIjeQ6_hI0DtTiGgv_tj|sub1.jpg',
                    '1oim4AEnxRpV2clOltQ56HH_QV_OMyRsq|OIP (1).webp',
                    '1RAaDRXbDg_nGnzhwYsKA0ebOrUCTAqE8|OIP.webp',
                ],
                'video'      => [],
            ],

            /* ── 6 · Dolphin show ──────────────────────────────────────── */
            [
                'slug'       => 'dolphin-show',
                'title'      => 'Dolphin show',
                'folder'     => 'show dolphin',
                'category'   => 'family',
                'strap'      => 'Seated in front of the pool; the dolphins do the jumping',
                'duration'   => 'Around 1 hour; transfers included on request',
                'meeting'    => 'Arrive 20 minutes early for your seat, or take the pick-up',
                'price'      => null,
                'level'      => 'Very easy',
                'season'     => 'Show times vary by season and booking load',
                'featured'   => false,
                'lede'       => 'Twenty-five minutes of jumps, ball-chasing and a very good wave, with trainers explaining what the animals are actually doing and why.',
                'body'       => [
                    'The show is built for a family audience, and it works on adults too because the trainers keep narrating: how dolphins use sound, what a tail slap is for, why they breach. Front rows get wet, deliberately.',
                    'Add-ons at the desk include a handshake, a splash session, or a photo with a trainer. Book the swim separately if you want the water version — it is a different program.',
                ],
                'highlights' => [
                    'Full trainer program with commentary',
                    'Front-row splash seating or dry grandstand',
                    'Optional handshake or photo add-on',
                    'Runs in Arabic and English',
                ],
                'included'   => ['Reserved seat for the show', 'Access to the marina area'],
                'excluded'   => ['Hotel transfers unless added', 'Photos and add-on sessions'],
                'gallery'    => [
                    '1t1eS8GeZhD7un--GNzBDm1P37d_qMRlI|Dolphin-Show-14-636x426.jpg',
                    '1UYl-jCsW37lUqIy-X2TJeLiPnYMupjmF|OIP (4).webp',
                    '1g1MOUmb3AAJKFuJ8F-0THaDbmQWX-t1C|OIP (3).webp',
                    '19iJPKUSGq9XBtdQIAmQlIwmhIgPD8LPL|OIP (1).webp',
                    '12ZehTI-UHXM0FMO0K96RDyrOtFChvc0V|OIP (2).webp',
                    '1wA35v6fzzpA98LVr3zc8RzX53JsQWyNi|OIP.webp',
                ],
                'video'      => [],
            ],

            /* ── 7 · Speed boat ────────────────────────────────────────── */
            [
                'slug'       => 'speed-boat',
                'title'      => 'Speed boat ride',
                'folder'     => 'speed boat',
                'category'   => 'adrenaline',
                'strap'      => 'Twenty minutes of spray along the coast at speed',
                'duration'   => 'Around 1 hour on the water',
                'meeting'    => 'Naama Bay marina, meet at the pontoon',
                'price'      => null,
                'level'      => 'Physical — you hold on',
                'season'     => 'Best April to October; depends on the wind',
                'featured'   => false,
                'lede'       => 'Out past the breakwater, along the reef line, hard enough that the boat skips instead of floats. Short, loud, and the best value thing on this page.',
                'body'       => [
                    'You get a lifejacket, a briefing on where to sit and where not to put your hands, and then the driver opens it up: a run down the coast towards Ras Um Sid with the shoreline going past fast enough to blur, a slowdown over the reef for a look at the water, then home.',
                    'Nothing is waterproof at the end of it. Phone straps are worth carrying, and the driver will usually take a video from the bow.',
                ],
                'highlights' => [
                    'Full-throttle coastal run',
                    'Slow pass over the reef edge',
                    'Lifejacket, and a very short briefing',
                    'Filmed from the bow if you ask',
                ],
                'included'   => ['Boat and fuel', 'Lifejacket and briefing'],
                'excluded'   => ['Hotel transfers', 'Waterproof bag'],
                'gallery'    => [
                    '1kD7CKOblviz0UB4IXpFoV6tfxr6beQfs|speed-boat-egypt.jpg',
                    '1Emtwh1sLQqGDOPXJbyVbWfmWkaZHDXrG|Speed-boat6_5_11zon-1024x682.jpg',
                    '1dUgAUDRMySiy07XRUv41RvBgHvGvvWH7|Speed-boat6111111_9_11zon-1024x683.jpg',
                    '1vZzkY5M-o0qi9-NyHXaNv-erwmSREry4|Sealine-hannibal-5.jpg',
                    '1n6ld5qw6GK6DYdfCiOLVS1LRSr6ZziCh|12_image.jpg',
                ],
                'video'      => [],
            ],

            /* ── 8 · Bedouin & quad safari ─────────────────────────────── */
            [
                'slug'       => 'bedouin-safari',
                'title'      => 'Safari: quad bikes, camels & bedouin camp',
                'folder'     => 'safari',
                'category'   => 'desert',
                'strap'      => 'The classic Sharm evening out into the hills',
                'duration'   => 'Around 4 hours, usually 3pm to 7pm',
                'meeting'    => 'Pick-up from your hotel',
                'price'      => null,
                'level'      => 'Easy to moderate',
                'season'     => 'Daily; cooler months are more pleasant on the bike',
                'featured'   => true,
                'lede'       => 'The shorter version of the super safari, and the one most people actually want: an hour on a quad, a walk through a desert village, camels, and tea and bread at a bedouin tent as the light goes.',
                'body'       => [
                    'Quads go out in convoy behind the guide, up a track into the foothills and down into a dry wadi where the group stops for photographs and a look at the rocks, which are a genuinely odd colour in late afternoon. Helmets and scarves included; a licence is not needed to ride.',
                    'The camp end of the evening is unhurried. Somebody bakes bread on coals, there is food on low tables, camels are tethered outside if you want a short ride, and the drive back is in the dark with the lights of the resort town coming up over the flat.',
                ],
                'highlights' => [
                    'Guided quad bike convoy into the foothills',
                    'Sunset stop with views back over the gulf',
                    'Camel ride at the camp',
                    'Bedouin dinner, fire and tea',
                ],
                'included'   => ['Hotel transfers', 'Quad bike, helmet and goggles', 'Camel ride', 'Dinner and tea at camp'],
                'excluded'   => ['Alcohol', 'Tips'],
                'gallery'    => [
                    '17ycq34ukJvVYJlllcAD2V8aynkU-Cyaq|caption.jpg',
                    '1Olk54PWzgJa2UV3ViPbIZc3MBM7uLbCS|caption (1).jpg',
                    '1sPzFdhaa-wtgQACGAT-NVOcTwuwNXlXJ|caption (2).jpg',
                    '1Ueu51R4g6WGP7iz6ewuoh9xzrP8iJX3R|caption (3).jpg',
                    '1a1DBUyxhfn8OXqHDAe1bKnGEaZMWHPkb|caption (4).jpg',
                    '1PVwo9I4TiT_w-atx58UQpKy4INTGMfAw|caption (5).jpg',
                    '1BGD-A_o7wEgRp70y043xmgrTvPioHQN3|caption (6).jpg',
                    '17PZrItMB4eUAnUXwNDRxfZoi6hdl2Z3d|caption (7).jpg',
                    '1JAR4Ly8ktfAYXJfVtCYCL9ehkVRGnOfY|caption (8).jpg',
                    '1-mo_z5RMsK4Z-NDfwIfX7AnwmQQXVaEV|103e6ce7-0a2f-4428-9eef-b08ee58148d6.jpeg',
                ],
                'video'      => [
                    '1rBR9_vUNN-UyyAZ6IzUEd0ozcON33hm7|6ffd1b20-60ee-43b4-9469-e0f9733b9462.mp4',
                    '1uoq0DF4yRzmAJXi0QMOdHrQQqTgsFSPR|878a6e42-6c38-4bc9-8d14-6ed5b07e53d1.mp4',
                    '1evP0fomibgUJfCsZU8G7QvF2YU4FZUjR|927f1945-e93a-4f50-9602-ae2607243226.mp4',
                    '1zQdSSXM_H_BSjnrmSbpP6UkNi4mWEQzz|927f1945-e93a-4f50-9602-ae2607243226 (1).mp4',
                ],
            ],

            /* ── 9 · Ras Mohammed by road ──────────────────────────────── */
            [
                'slug'       => 'ras-mohammed-bus-trip',
                'title'      => 'Ras Mohammed bus trip',
                'folder'     => 'ras mohamed bus',
                'category'   => 'sea',
                'strap'      => 'Egypt’s oldest marine park, by coach, with a snorkel stop',
                'duration'   => 'Full day, around 11 hours',
                'meeting'    => 'Early pick-up from your hotel; the coach leaves Sharm before sunrise',
                'price'      => null,
                'level'      => 'Easy — long in a seat, short in the water',
                'season'     => 'Daily, all year',
                'featured'   => false,
                'lede'       => 'The land hook at the end of the Sinai, where the Gulf of Suez and the Gulf of Aqaba meet, and the snorkelling at Shark Bay and the Garden of Eels is the reason the park exists.',
                'body'       => [
                    'The drive south passes the tunnel-mouth of the delta and a long, empty gravel plain. In the park the bus stops at the salt lakes, at the raised coral terrace, and at the beach where the reef drops off within a dozen metres of dry land — that drop-off is where the fish concentrate.',
                    'Lunch is a simple boxed meal on the beach rather than a restaurant, and you will be back at the hotel by late afternoon. It is a long day in a vehicle for three hours of very good water, and most people think it is worth it.',
                ],
                'highlights' => [
                    'Snorkelling over the wall at Shark Bay',
                    'The mantled rocks and salt lakes of the park interior',
                    'Mask, fins and vest on board',
                    'Long views across two gulfs from the same headland',
                ],
                'included'   => ['Early hotel pick-up and return', 'Air-conditioned coach', 'Park entry and guide', 'Snorkelling equipment', 'Boxed lunch'],
                'excluded'   => ['Drinks beyond water', 'Ferry crossing costs where applicable'],
                'gallery'    => [
                    '1dIbjWqtPKltjNetlxJozsWNYY_6Lx4ZR|caption.jpg',
                    '1WBxwcvIIhlQG0VoFdhXGtY9h3EoWdIdv|caption (1).jpg',
                    '1DnVrt1b4gO2-ySkqiTX0QeotSv_COB7S|caption (2).jpg',
                    '1Zh6Fr2BEDX5AuatU5HAbLauApnGgocTK|caption (3).jpg',
                    '1OU2RNZsWCotQMW7pKgFc1to9yiaRQ0rV|caption (4).jpg',
                    '11l5qfcmPiOCrFKVA6QIEvtZtMwyOeenF|caption (5).jpg',
                    '1BHW4MCYcjLRrQ6oEFNRiSLv7V91N-mZ3|caption (9).jpg',
                ],
                'video'      => [
                    '1aMz7HTI9v8ORckxG0alrtnI-x5rEvu5y|1e88ce19-fd2a-4002-a4e1-0fc58fb874b6.mp4',
                ],
            ],

            /* ── 10 · Colored Canyon ───────────────────────────────────── */
            [
                'slug'       => 'colored-canyon',
                'title'      => 'Colored Canyon',
                'folder'     => 'color conyon',
                'category'   => 'desert',
                'strap'      => 'A two-hour walk through rust, ochre and chalk in the mountains above Nuweiba',
                'duration'   => 'Full day, around 9 hours',
                'meeting'    => 'Pick-up from your hotel; about two hours’ drive via the Dahab road',
                'price'      => null,
                'level'      => 'Active — scrambling, wading, and a short swim at the end if you want it',
                'season'     => 'October to April; not run in flash-flood risk or high heat',
                'featured'   => true,
                'lede'       => 'Ninety metres of sandstone walls in colours that do not look real in photographs, a trickle of water on the floor, and a guide who picks the line. The best half-day of walking in the Sinai.',
                'body'       => [
                    'The canyon sits behind Nuweiba, entered from a wadi floor and walked upstream for roughly two kilometres. Parts are wide and sandy; parts narrow to a shoulder-width squeeze where you shuffle between the walls with your hands on the rock. There are a couple of easy scrambles — nothing you climb with your feet off the ground unless you choose to.',
                    'The walk ends at a spring pool where people swim, then the same way out, or over the top if the group is fit. Bring shoes that can get wet and full of sand. Bedouin guides from the village work the canyon and lunch is usually eaten in the shade of their camp.',
                ],
                'highlights' => [
                    'Guided walk through the sandstone slots',
                    'Colour in the rock at midday, when the light reaches the floor',
                    'Swimming pool at the head of the canyon',
                    'Bedouin lunch on the way out',
                ],
                'included'   => ['Hotel transfers', '4x4 to the canyon mouth where the road ends', 'Bedouin guide', 'Lunch and water'],
                'excluded'   => ['Proper footwear (bring it)', 'Swimwear', 'Tips'],
                'gallery'    => [
                    '1aMaDeyKjorgMy_45NexgJ9GwOL2xkCpX|caption.jpg',
                    '1Z9EdRBo6yH31MzCt-hoJFVeY3uzQ1FwX|caption (1).jpg',
                    '1zVhxWVvXTmYzSU_VgXY2ClfDkGWPSGmN|caption (2).jpg',
                    '1d--7AbFC_Z3RxzO_FqemCjUCM6DH21jO|caption (3).jpg',
                    '1Y3SsTtooPtc-LD8hUi3LzaVS5firnBIN|caption (4).jpg',
                    '1TXTvxI6sdNczYHJEYPczjI2cOjhXhnGV|caption (5).jpg',
                    '17v834yPz3l5hxziotZ7cKpQXXT0YQba2|72.jpg',
                    '14bFziskm7sLUeUqjdguLhzH5FxTj_rPW|146.jpg',
                    '12Mncerj1WuJ0-DP4kSna3f7B4_rF3mhA|paseo-camello-dahab.avif',
                    '1VwbNcO1hc-YD5v8cwnnhDxk6pxiHCCqb|OIP.webp',
                    '1aN3qE1FWQPIem9hxVdyItxVX4UFBavek|OIP (1).webp',
                    '1nW4Qs8KgkiYQGbCgJECvUZPnYSEHuUIv|OIP (2).webp',
                    '1AvRiho0u_Jsya8nBJepSaait-weBR-wX|OIP (3).webp',
                ],
                'video'      => [],
            ],

            /* ── 11 · Horse riding ─────────────────────────────────────── */
            [
                'slug'       => 'horse-riding',
                'title'      => 'Horse riding on the beach',
                'folder'     => 'hors riding',
                'category'   => 'desert',
                'strap'      => 'An hour along the shoreline and into the palm grove',
                'duration'   => 'Around 1.5 hours including tack and briefing',
                'meeting'    => 'Pick-up from your hotel, or ride from the stables at the edge of town',
                'price'      => null,
                'level'      => 'Easy for confident riders; walks are led for beginners',
                'season'     => 'Daily; sunrise and sunset slots are the good ones',
                'featured'   => false,
                'lede'       => 'Horses that have done this a thousand times, walking the wet sand at the waterline while the tide is out, then turning inland through the palms.',
                'body'       => [
                    'If you have never sat on a horse, you go on a led walk and it is completely fine; if you have, you will be asked, and the answer usually gets you a canter on the beach. Helmets, and the owner of the horse keeping a hand on your reins until you say otherwise.',
                    'Sunset rides fill first because the light on the gulf from the beach is the point of them. Two-hour and full-beach options exist — ask when booking and we will put you on the right slot.',
                ],
                'highlights' => [
                    'Beachline canter for confident riders',
                    'Led walk for first-timers and children',
                    'Palm-grove and dune section inland',
                    'Sunset or sunrise slots',
                ],
                'included'   => ['Hotel transfers', 'Tack, helmet and guide', 'Ride at your level'],
                'excluded'   => ['Photos taken by the stable (available on request)', 'Longer trail rides unless booked'],
                'gallery'    => [],
                'video'      => [
                    '1vayPrBwsUq7SyDWHT0sxANZdJfb-Hevc|fd2031b8-ed8f-4903-a70d-8e46291388d4.mp4',
                    '1D46gj6ws56iCYVCIWXfk1BVYtc4qgi1t|b1faa33c-dfb0-49b9-9b29-4fa2c284639a.mp4',
                    '1i6-g959maZ-018bn-QfCjfdCzp0bNupk|9a563f88-8095-4442-a312-55f5ed5000cc.mp4',
                ],
            ],

            /* ── 12 · Parasailing ──────────────────────────────────────── */
            [
                'slug'       => 'parasailing',
                'title'      => 'Parasailing',
                'folder'     => 'parasaaling',
                'category'   => 'adrenaline',
                'strap'      => 'Ten minutes over the bay, harnessed to a boat',
                'duration'   => 'Around 1.5 hours including rigging; 8–12 minutes airborne',
                'meeting'    => 'The boat at the beach or marina, walking distance in Naama Bay',
                'price'      => null,
                'level'      => 'Easy — you walk off the shore and are lifted',
                'season'     => 'Daily when the wind allows; mornings are steadiest',
                'featured'   => false,
                'lede'       => 'The only way to see how big the reef actually is: you go up, the boat keeps moving, and the whole bay turns into a map of turquoise and dark coral patches.',
                'body'       => [
                    'You are harnessed, the wing takes the slack, and you leave the ground without a jump or a drop. Sit in the harness or stand and walk up off the water — the crew will ask which. Twice around the bay, a slow descent, and you are back on the sand before the adrenaline has anywhere to go.',
                    'Single or tandem flight. Nothing is worth taking up with you except a phone with a strap, and even that is at your own risk.',
                ],
                'highlights' => [
                    'Winch launch and soft landing from the beach',
                    'Whole-bay view over the reef line',
                    'Solo or tandem',
                    'Photos and video taken by the crew',
                ],
                'included'   => ['Harness and briefing', 'Flight with a spotter boat', 'Crew photos of the flight'],
                'excluded'   => ['Video package', 'Transfers'],
                'gallery'    => [
                    '1ImKiYdbQpEX4tCb8mQZTGfqQnwAVb6Vg|caption.jpg',
                    '1RLacqGr-Jz9ibz33yFIB8P1JGfzCPj3W|09.jpg',
                    '1SrpRE3IqqnsbqEgHr9U6Ir3Y1Yd4pnUb|98.jpg',
                    '1Wns57zmZxJmuR63j1h7w4TbhZIZWc2eq|parasol.jpg.webp',
                    '1y7HJNXyYYQVQVhp2MyV6b32hcLdV1fGZ|sharm-el-sheikh-parasailing.webp',
                ],
                'video'      => [],
            ],

            /* ── 13 · Glass boat ───────────────────────────────────────── */
            [
                'slug'       => 'glass-bottom-boat',
                'title'      => 'Glass-bottom boat',
                'folder'     => 'glass boat',
                'category'   => 'sea',
                'strap'      => 'The reef from under a glass floor',
                'duration'   => 'About 1 hour',
                'meeting'    => 'Naama Bay pier',
                'price'      => null,
                'level'      => 'Very easy',
                'season'     => 'Daily, all year',
                'featured'   => false,
                'lede'       => 'A short cruise with a view through the floor. It sounds modest, and for a family with a toddler, a grandparent, or anyone who will not put their face in a mask, it is the trip that lets them take part.',
                'body'       => [
                    'The boat runs a fixed circuit over a shallow reef shelf where the coral and fish are close enough to see clearly on a sunny morning. There is an open deck as well, so the people who want sun and the people who want fish are both happy.',
                    'A guide talks over the loudspeaker as you go, pointing out what is under you rather than reading a script.',
                ],
                'highlights' => [
                    'Glass floor over a shallow reef shelf',
                    'Open upper deck for sun',
                    'Commentary during the crossing',
                    'Short enough to fit between lunch and the pool',
                ],
                'included'   => ['Boat trip and commentary', 'Seating on both decks'],
                'excluded'   => ['Snorkelling (there is no swim stop)', 'Hotel transfers unless added'],
                'gallery'    => [
                    '1SoFMlA0d0Dw5ghEYxIRRSOLtcKwfgiW4|Glass-Boat2.jpg',
                    '19etNRDTF1AFxLLhzOMGqZojW4xTLk4c_|1 hour Glass Boat Sea Trip With Transportation - Sharm El Sheikh.jpg',
                    '14AZHIQexPBl3WZ7ZXLO-Yrwy_Js5wt8Z|1hourGlassBoatSeaTripWithTransportation-SharmElSheikh.jpg',
                    '1xQ8mRGdtfyfpwv8ipiI7RUaLo9h_4Nw1|istockphoto-471609782-170667a.jpg',
                    '131bBqcZzgKK4Z5lmyr52fXGsYNYKE-vc|istockphoto-467862934-612x612.jpg',
                    '1VXcixM-tvBwhBhfsWpBndFW_Zp08fwuM|OIP.webp',
                    '1dOg5_EgcQ7AZNmPKW6pjSDP1wY9zYjZa|OIP (2).webp',
                ],
                'video'      => [],
            ],

            /* ── 14 · Old Cairo ────────────────────────────────────────── */
            [
                'slug'       => 'old-cairo',
                'title'      => 'Old Cairo & the Egyptian Museum',
                'folder'     => 'cairo old',
                'category'   => 'culture',
                'strap'      => 'The historic city in one long day from the Red Sea',
                'duration'   => 'Full day, early start and late finish',
                'meeting'    => 'Pick-up from your hotel before dawn; by road, or flight from Sharm where you prefer',
                'price'      => null,
                'level'      => 'A lot of walking on hard ground, in the shade of a museum',
                'season'     => 'All year; winter weekends are the busiest',
                'featured'   => false,
                'lede'       => 'Two thousand years of the same city stacked on itself: Coptic churches in a Roman fort, a medieval gate, a bazaar, and the museum that holds the collections nobody has finished cataloguing.',
                'body'       => [
                    'The day is built around the Egyptian Museum in Tahrir and the Coptic quarter, with the Khan el-Khalili bazaar at the end for whoever still has legs for it. A guide walks the galleries with you — the royal mummies room, the Narmer palette, and the smaller rooms that people walk past and then cannot stop thinking about.',
                    'It is a long day out of Sharm. By road it is roughly six hours each way, so most people fly early and are handed back to a transfer at the other end. We will tell you honestly whether the flight timing makes the day worth it for your group.',
                ],
                'highlights' => [
                    'Egyptian Museum with an Egyptologist guide',
                    'Cairo Citadel and the Muhammad Ali Mosque',
                    'Old Coptic Cairo and the Hanging Church',
                    'Khan el-Khalili, with time for coffee',
                ],
                'included'   => ['Transfers at both ends', 'Guide and entry tickets', 'Lunch'],
                'excluded'   => ['Internal flights unless booked', 'Mummies-hall ticket where sold separately', 'Shopping'],
                'gallery'    => [
                    '1P-om_PaiwOV4jXfejNDBFYO5ghpjIr_a|caption.jpg',
                    '1COdedfHqMNwBJV4QrN3-iWnXPGad7gT9|Excursion_to_Cairo_from_Sharm_El-Sheikh-e1551665903123.webp',
                    '1U_H-xPmXdjAMnLqFt-v5GsWXsHi33dwN|98.jpg',
                    '1g1-2y-cXfZMRWsIecPs8qbSDfLimFF1T|OIP (1).webp',
                    '1-rheTT0G1ZLtCBuQyV26oGCFvk_ucAYC|OIP.webp',
                    '1S_3-4RMYVqpIgAooQ_hgfrbKYfgyeaRx|OIP (3).webp',
                    '1fkIFUA1bAW8T6Ieist6ClwZE54HuBWG2|shutterstock_1868215861.avif',
                ],
                'video'      => [],
            ],

            /* ── 15 · New Cairo, Giza & GEM ────────────────────────────── */
            [
                'slug'       => 'new-cairo-giza-museum',
                'title'      => 'Giza & the Grand Egyptian Museum',
                'folder'     => 'cairo new',
                'category'   => 'culture',
                'strap'      => 'Pyramids, sphinx, and the museum built to hold everything else',
                'duration'   => 'Full day, early start and late finish',
                'meeting'    => 'Hotel pick-up; road or air from Sharm, your choice',
                'price'      => null,
                'level'      => 'Easy to moderate — the sites are flat, and hot',
                'season'     => 'All year; mornings for the plateau',
                'featured'   => true,
                'lede'       => 'You have seen the pyramids your whole life. Standing at the corner of the Great Pyramid with the causeway behind you is still the moment that rearranges the scale of things.',
                'body'       => [
                    'The day starts on the Giza plateau before the heat and the coaches, walking between the three pyramids and past the sphinx, with an optional entry into a pyramid if the queue allows. Then across to the Grand Egyptian Museum, which is where the Tutankhamun collection now sits — a purpose-built gallery, and the reason to come back to Giza at all.',
                    'Lunch is somewhere with a view of the plateau, and there is time at the end for the souvenir market if you want it, or for one more look at the causeway if you do not.',
                ],
                'highlights' => [
                    'Giza plateau: three pyramids and the Sphinx',
                    'Grand Egyptian Museum main galleries',
                    'Walk the causeway with the pyramids behind you',
                    'Optional pyramid interior entry, subject to the day',
                ],
                'included'   => ['Transfers', 'Egyptologist guide', 'Entry tickets for the plateau and museum', 'Lunch'],
                'excluded'   => ['Internal flights', 'Camel or horse on the plateau', 'Pyramid interior ticket where separate'],
                'gallery'    => [
                    '1e-h_PT_viGHDHLoBKem_kSxQ3qCXDhIv|audley-egypt-header-pyramids-giza-credit-getty.webp',
                    '1ioHxsUWy1NhQjbj1c59UzzBJ7zugsC7b|Pyramids-Giza-Cairo-Egypt.webp',
                    '1b_zNpkRGg4yDfuhu1htVfHmrjyzU98_o|pyramids-giza-sphinx-1024x683.webp',
                    '11sGQP0gpaA1Re6XvDbqmSOnXocRwiVt6|grand-egyptian-museum-opening-1095x575.jpg',
                    '10uAjgMjNwjG-UivzMq5IOsKq5LQWk7T8|1762175767_The-new-Egyptian-museum-opens-in-Cairo-it-is-the.jpg',
                    '1l8LfFlgt8rT6gHlXVZEeLv2VigH581xo|a67e0886523cbf25e89dc37bc6543d44.jpg',
                    '1_kHoCuq2WGFOs9LvvSx0A28_SeZJeZ4x|OIP.webp',
                ],
                'video'      => [],
            ],

            /* ── 16 · Airport transfer ─────────────────────────────────── */
            [
                'slug'       => 'private-airport-transfer',
                'title'      => 'Private airport transfer',
                'folder'     => 'private transfer to airbort',
                'category'   => 'transfer',
                'strap'      => 'Sharm el-Sheikh Airport, whichever hotel, whatever hour',
                'duration'   => '20–50 minutes depending on where you are staying',
                'meeting'    => 'Driver meets you in the arrivals hall with a name board',
                'price'      => null,
                'level'      => '—',
                'season'     => '24 hours, every day of the year',
                'featured'   => false,
                'lede'       => 'Flight-tracking on the arrival side, so a late plane does not cost you a rebooking, and a driver who is already parked when you clear customs on the way back.',
                'body'       => [
                    'Private car for your party — no shared minibus, no waiting for four other hotels. Child seats, and water in the car if you have landed at three in the morning, which several of you will have.',
                    'Send us the flight number and hotel and we do the rest. Prices are per car, not per person, so a family of five is the same as a couple.',
                ],
                'highlights' => [
                    'Meet-and-greet in arrivals with a name board',
                    'Flight tracking on late arrivals',
                    'Fixed price per car, both directions available',
                    'Child seats on request',
                ],
                'included'   => ['Private car and driver', 'All tolls and parking', 'Meet-and-greet'],
                'excluded'   => ['Waiting charges after the free hour, if a flight is held'],
                'gallery'    => [],
                'video'      => [],
            ],

            /* ── 17 · Farsha cafe transfer ─────────────────────────────── */
            [
                'slug'       => 'farsha-cafe-transfer',
                'title'      => 'Farsha Mountain Café transfer',
                'folder'     => 'private transfer to [farsha cafe',
                'category'   => 'transfer',
                'strap'      => 'Up the hill for sunset, and back down after dark',
                'duration'   => 'Return transfer, around 30 minutes each way',
                'meeting'    => 'Collected from your hotel; returned at the time you give the driver',
                'price'      => null,
                'level'      => '—',
                'season'     => 'Evenings; the last hour before sunset is the one to have',
                'featured'   => false,
                'lede'       => 'The café is cut into the rock above Naama Bay with the whole gulf under it. The road is switchbacks and the last stretch is unlit, which is precisely why a driver who knows it is better than a taxi.',
                'body'       => [
                    'Book for late afternoon, sit on the terrace as the light goes over to Sinai on the far side, and give the driver a return time. Blankets are usually offered on the terrace when it cools, and the menu is not cheap — worth knowing before you order.',
                    'The same car can wait and take you down to the bay for the evening instead, if you would rather finish the night in town.',
                ],
                'highlights' => [
                    'Return transfer on the mountain road',
                    'Timed for sunset',
                    'Driver waits or returns at the hour you choose',
                    'Can drop you in Naama Bay afterwards',
                ],
                'included'   => ['Return transfer in a private car', 'Waiting time within the agreed window'],
                'excluded'   => ['Food and drink at the café', 'Table reservation, which we will make if you ask'],
                'gallery'    => [],
                'video'      => [],
            ],

            /* ── 18 · Soho Square transfer ─────────────────────────────── */
            [
                'slug'       => 'soho-square-transfer',
                'title'      => 'Soho Square transfer',
                'folder'     => 'private transfer to [soho squara',
                'category'   => 'transfer',
                'strap'      => 'Fountains, shops and the ice-rink side of the bay',
                'duration'   => 'Return transfer; 10–25 minutes each way from most hotels',
                'meeting'    => 'Hotel pick-up, returned when you message the driver',
                'price'      => null,
                'level'      => '—',
                'season'     => 'Evenings, when the square is lit',
                'featured'   => false,
                'lede'       => 'An evening out without hiring anything for a whole day: dropped at the square when you want to go, collected when you are finished walking around it.',
                'body'       => [
                    'Soho Square is pedestrian, so the car stops at the edge and you walk in past the fountains. Restaurants, a souq, a cinema and the skating rink face onto it, and it is the part of Sharm that works best with children in tow.',
                    'No fixed return time — you have the driver’s number and you call it.',
                ],
                'highlights' => [
                    'Private return transfer, not a shared shuttle',
                    'No time pressure — call when you are ready',
                    'Drop-off at the square entrance',
                    'Child seats available',
                ],
                'included'   => ['Return transfer in a private car', 'Driver contact for the collection'],
                'excluded'   => ['Anything you do at the square'],
                'gallery'    => [],
                'video'      => [],
            ],

            /* ── 19 · Old Town transfer ────────────────────────────────── */
            [
                'slug'       => 'old-town-transfer',
                'title'      => 'Old Market & Old Town transfer',
                'folder'     => 'private transfers to[old town and back',
                'category'   => 'transfer',
                'strap'      => 'Souq, spices, mosque and the fish market, there and back',
                'duration'   => 'Return transfer; 15–30 minutes each way',
                'meeting'    => 'Hotel pick-up; collection from the corner of the souq',
                'price'      => null,
                'level'      => '—',
                'season'     => 'Late afternoon into the evening',
                'featured'   => false,
                'lede'       => 'The old part of Sharm is where you buy the things worth buying — saffron, alabaster, a cotton galabiya — and where the prices are still negotiable rather than printed.',
                'body'       => [
                    'Evenings are best: the souq is lit, the alabaster workshops are still open, and the fish market along the corniche is cooking whatever came off the boats that afternoon. A private car means you can leave with four bags and not have to explain it to a taxi driver.',
                    'We will drop you at the south end of the souq near the Al Salam Mosque and pick you up wherever you have walked to.',
                ],
                'highlights' => [
                    'Soho Souq and spice market on foot',
                    'Alabaster and jewellery workshops',
                    'Corniche fish market for dinner',
                    'Collection from any point on the corniche',
                ],
                'included'   => ['Return private transfer', 'Time to shop and walk at your own pace'],
                'excluded'   => ['Shopping', 'Dinner'],
                'gallery'    => [],
                'video'      => [],
            ],

            /* ── 20 · Naama Bay transfer ───────────────────────────────── */
            [
                'slug'       => 'naama-bay-transfer',
                'title'      => 'Naama Bay transfer',
                'folder'     => 'privite transfers to [naama Bay',
                'category'   => 'transfer',
                'strap'      => 'The bay, the promenade and the night boats, on your schedule',
                'duration'   => 'Return transfer; usually under 15 minutes',
                'meeting'    => 'Hotel pick-up, collection on the promenade',
                'price'      => null,
                'level'      => '—',
                'season'     => 'Any evening',
                'featured'   => false,
                'lede'       => 'Naama Bay is the middle of everything — the marina, the cafés on Haab Street, the glass boats at the pier. A car that takes you when you want and brings you back when you are done.',
                'body'       => [
                    'Most guests staying out in the resorts and bays north of here use this rather than a hotel shuttle with fixed 7pm and 11pm departures. Drop at the marina end for the boats, or the café end for the seating.',
                    'Same service in the daytime if you want to go down for the beach and skip the evening.',
                ],
                'highlights' => [
                    'On-demand return transfer',
                    'Drop at the marina or Haab Street',
                    'Air-conditioned private car',
                    'Works for a beach morning as well as a night out',
                ],
                'included'   => ['Return private transfer'],
                'excluded'   => ['Boat trips and café bills'],
                'gallery'    => [],
                'video'      => [],
            ],
        ];
    }

    /** The promo reel folder — clips that are not tied to one trip. */
    public static function films(): array
    {
        return [
            'folder' => 'FILMS',
            'video'  => [
                '1cVDmUhYV27nqVBC5_hEaPNOb2JF6Z7bT|0e0b66f3-9ab3-4a8e-8ee2-839b40f13c37.mp4',
                '1ZEa07adJ6WHL8DCbkQllec7A-WUh5XJh|b21c4324-d229-4c89-8e1a-0f23ef65a34a.mp4',
                '14RicbxXrNbgXQNqxbEjVKZJXac1m5wVq|399a75f0-8e0f-4e3d-a490-26bb0445ad1c.mp4',
                '1awQ4VwJqJq4JRbG711u_fSFxkF1XK9l4|1b2dc615-d8d7-49a2-adf6-7bd163d6f266.mp4',
            ],
            'gallery' => [
                '1pA3ttBc2sxb3dawgPzcZLu_RVSGHkuU7|1a4d4d87-c799-4e67-a38f-e3418e66bcdf.jpeg',
                '1rqQVxkM3ca6PprzR-p9J7OJyV0N_SoU0|54eee6f7-e0f4-4bba-b486-17b3553e5993.jpeg',
                '10Uor8TuFx88r5hFrcDvtRCDNxy3MbDSB|74c253d3-8e71-4279-842e-a5d9718e50e6.jpeg',
                '17P5ErkAu7DVOzLFSWUjKrxm_IvT8mC2d|d0e738a1-0474-41bc-a7d8-d7334323196b.jpeg',
                '1NhHVa9XwqjddPVajSDjRt76hVogIcdL8|04ac631c-9555-4e49-ad47-5eac5de1d5de.jpeg',
            ],
            /* The two images that sat loose in the parent folder — used for the
               /tours hero and the homepage band. */
            'covers' => [
                '1mS5_y4Tb3GP5xGm7ZeBiNw8jEboxuMCV|a4a770cf-2ff3-4a84-9381-05a36060321d.jpeg',
                '1wjHSpKLs72zhK9NMGQqILZc9t9pXjD23|297564db-36f3-4bb0-99b7-47e74b76dd0a.jpeg',
            ],
        ];
    }

    public static function cover($index = 0)
    {
        $covers = self::films()['covers'];

        return isset($covers[$index]) ? $covers[$index] : $covers[0];
    }

    public static function find(string $slug): ?array
    {
        foreach (self::all() as $tour) {
            if ($tour['slug'] === $slug) {
                return $tour;
            }
        }

        return null;
    }

    /**
     * Grouped, filtered list used by /tours.
     */
    public static function filtered(?string $category = null): array
    {
        $all = self::all();

        if (!$category) {
            return $all;
        }

        return array_values(array_filter($all, function ($tour) use ($category) {
            return $tour['category'] === $category;
        }));
    }

    public static function featured(int $limit = 6): array
    {
        $picked = array_values(array_filter(self::all(), function ($tour) {
            return !empty($tour['featured']);
        }));

        return array_slice($picked, 0, $limit);
    }

    /** Same category first, then anything with photography. */
    public static function related(string $slug, int $limit = 3): array
    {
        $tour = self::find($slug);

        if (!$tour) {
            return [];
        }

        $all   = self::all();
        $slugs = array_column($all, 'slug');
        $at    = array_search($slug, $slugs, true);

        $ordered = [];

        foreach ($all as $index => $candidate) {
            if ($candidate['slug'] === $slug) {
                continue;
            }

            $score = ($candidate['category'] === $tour['category'] ? 0 : 10) + (abs($index - $at) % 7);

            $ordered[$candidate['slug']] = [$score, $candidate];
        }

        uasort($ordered, function ($a, $b) {
            return $a[0] <=> $b[0];
        });

        return array_slice(array_map(function ($pair) {
            return $pair[1];
        }, array_values($ordered)), 0, $limit);
    }

    public static function categories(): array
    {
        $counts = [];

        foreach (self::all() as $tour) {
            $counts[$tour['category']] = ($counts[$tour['category']] ?? 0) + 1;
        }

        $out = [];

        foreach (self::CATEGORIES as $key => $label) {
            if (!empty($counts[$key])) {
                $out[] = ['key' => $key, 'label' => $label, 'count' => $counts[$key]];
            }
        }

        return $out;
    }

    public static function price($tour): string
    {
        return empty($tour['price'])
            ? 'Price on request'
            : 'from ' . number_format((float) $tour['price']) . ' USD';
    }
}
