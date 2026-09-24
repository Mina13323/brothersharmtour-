<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Illuminate\Http\Request;

/**
 * /sitemap.xml and /robots.txt, generated from the same data the pages render
 * from — so a new trip or guide is indexed without anyone remembering to edit
 * a static file.
 */
class SitemapController extends Controller
{
    public function xml(Request $request)
    {
        $urls = Seo::sitemap();

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');

        foreach ($urls as $url) {
            $node = $xml->addChild('url');
            $node->addChild('loc', htmlspecialchars($url['loc'], ENT_XML1));
            $node->addChild('lastmod', $url['lastmod']);
            $node->addChild('changefreq', 'weekly');
            $node->addChild('priority', $url['priority']);
        }

        $body = $xml->asXML();

        return response($body, 200, [
            'Content-Type'  => 'application/xml; charset=UTF-8',
            'X-Sitemap-Urls' => (string) count($urls),
        ]);
    }

    public function robots(Request $request)
    {
        return response(Seo::robotsTxt(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
