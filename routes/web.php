<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ItineraryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\TourController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| Mirrors the source site's URL shape: countries sit at the root (/kenya),
| sample itineraries under /sample-itineraries, and the marketing pages are
| flat. The catch-all destination route is registered last on purpose.
|
*/

Route::get('/', [HomeController::class, 'index']);

Route::get('/destinations', [DestinationController::class, 'index']);

Route::get('/inspiration', [ItineraryController::class, 'index']);
Route::get('/sample-itineraries', [ItineraryController::class, 'index']);
Route::get('/sample-itineraries/{slug}', [ItineraryController::class, 'show']);

Route::get('/tours', [TourController::class, 'index']);
Route::get('/excursions', [TourController::class, 'index']);
Route::get('/tours/{slug}', [TourController::class, 'show']);
Route::get('/films', [TourController::class, 'films']);

Route::get('/our-process', [PageController::class, 'process']);
Route::get('/about-us', [PageController::class, 'about']);
Route::get('/about-us/team/{slug}', [PageController::class, 'team']);
Route::get('/stories', [PageController::class, 'stories']);
Route::get('/stories/{slug}', [PageController::class, 'story']);

Route::get('/contact-us', [ContactController::class, 'index']);
Route::post('/contact-us', [ContactController::class, 'store']);

foreach (['financial-protection', 'privacy-policy', 'terms-conditions'] as $legal) {
    Route::get('/' . $legal, [PageController::class, 'legal']);
}

// /kenya, /tanzania, /uganda, /botswana, /namibia, /zimbabwe, /rwanda
Route::get('/{slug}', [DestinationController::class, 'show']);
