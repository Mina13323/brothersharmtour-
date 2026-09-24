<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TourController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| One section per content type: trips, places, guides, company pages, the
| enquiry form and the SEO endpoints. Aliases are kept for links that were
| published before the restructure, so no inbound URL 404s.
|
*/

Route::get('/', [HomeController::class, 'index']);

/* Aliases are declared first: the router takes the first match, and
   /guides/{slug} would otherwise swallow /guides/best-time-to-visit. */
Route::get('/excursions', [PageController::class, 'alias']);
Route::get('/day-trips', [PageController::class, 'alias']);
Route::get('/places', [PageController::class, 'alias']);
Route::get('/blog', [PageController::class, 'alias']);
Route::get('/our-process', [PageController::class, 'alias']);
Route::get('/about-us', [PageController::class, 'alias']);
Route::get('/contact-us', [PageController::class, 'alias']);
Route::get('/trips/{slug}', [PageController::class, 'alias']);
Route::get('/guides/best-time-to-visit', [PageController::class, 'alias']);
Route::get('/guides/best-time-to-visit-sharm', [PageController::class, 'alias']);
Route::get('/guides/packing-for-a-boat-day', [PageController::class, 'alias']);
Route::get('/guides/cairo', [PageController::class, 'alias']);
Route::get('/areas/ras-mohammed-national-park', [PageController::class, 'alias']);
Route::get('/areas/colored-canyon', [PageController::class, 'alias']);

Route::get('/tours', [TourController::class, 'index']);
Route::get('/tours/{slug}', [TourController::class, 'show']);
Route::get('/films', [TourController::class, 'films']);

Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{slug}', [PackageController::class, 'show']);

Route::get('/areas', [AreaController::class, 'index']);
Route::get('/areas/{slug}', [AreaController::class, 'show']);

Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{slug}', [GuideController::class, 'show']);

Route::get('/how-it-works', [PageController::class, 'how']);
Route::get('/about', [PageController::class, 'about']);
Route::get('/faq', [PageController::class, 'faq']);

foreach (array_keys(\App\Support\Site::legal()) as $legal) {
    Route::get('/' . $legal, [PageController::class, 'legal']);
}

Route::get('/contact', [ContactController::class, 'index']);
Route::get('/contact-us', [ContactController::class, 'legacy']);
Route::post('/contact-us', [ContactController::class, 'store']);
Route::post('/contact', [ContactController::class, 'store']);

Route::get('/sitemap.xml', [SitemapController::class, 'xml']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
