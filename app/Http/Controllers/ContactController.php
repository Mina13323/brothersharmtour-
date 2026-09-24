<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use App\Support\Site;
use App\Support\Tours;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $tour = Tours::find((string) $request->get('tour'));

        return $this->view('pages.contact', [
            'title'       => 'Contact & enquiries',
            'headerTheme' => 'transparent',
            'description' => 'Send your dates and the number of people and we will price the trip the same day. Phone, WhatsApp or the form — answered by the person who will run your day.',
            'hero'        => [
                'eyebrow' => 'start here',
                'title'   => 'tell us the day you want',
                'lede'    => Site::contactCopy()['lede'],
            ],
            'dialCodes'   => config('site.dial_codes'),
            'trips'       => array_column(Tours::all(), 'title', 'slug'),
            'tour'        => $tour,
            'prefill'     => $this->prefillFor($tour),
            'copy'        => Site::contactCopy(),
            'bodyClass'   => 'contact',
            'sent'        => (bool) $request->get('sent'),
            'breadcrumb'  => [$this->crumb('Contact', '/contact')],
            'seoNodes'    => [
                Seo::breadcrumb([
                    ['name' => 'Home', 'url' => '/'],
                    ['name' => 'Contact', 'url' => '/contact'],
                ]),
            ],
        ]);
    }

    /**
     * /contact doubles as /contact-us so links from the older pages keep working.
     */
    public function legacy(Request $request)
    {
        // 301, not 302: the old path is gone for good.
        return redirect('/contact' . ($request->get('tour') ? '?tour=' . $request->get('tour') : ''), 301);
    }

    /**
     * Enquiry endpoint. Writes a line to storage/enquiries.log and answers, so
     * the front end is fully wired without a third-party dependency. Point the
     * marked line at your mail transport or CRM when you have one.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        $errors = [];

        if (!isset($data['name']) || trim((string) $data['name']) === '') {
            $errors['name'] = 'Please tell us who you are.';
        }

        if (!isset($data['email']) || !filter_var((string) $data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address lets us send the plan.';
        }

        if (!isset($data['message']) || strlen(trim((string) $data['message'])) < 12) {
            $errors['message'] = 'A sentence or two about the trip, please.';
        }

        if ($errors) {
            if ($this->wantsJson($request)) {
                return response(json_encode(['ok' => false, 'errors' => $errors]), 422, [
                    'Content-Type' => 'application/json',
                ]);
            }

            return $this->renderWithError($data, $errors);
        }

        $line = sprintf(
            "[%s] %s <%s> %s%s | trip: %s%s\n%s\n%s\n",
            date('Y-m-d H:i:s'),
            $data['name'],
            $data['email'],
            isset($data['phone']) ? trim($data['phone']) : '-',
            !empty($data['dial']) ? ' (' . $data['dial'] . ')' : '',
            !empty($data['tour']) ? $data['tour'] : '-',
            !empty($data['travel']) ? ' | dates: ' . $data['travel'] : '',
            isset($data['message']) ? trim($data['message']) : '',
            str_repeat('-', 60)
        );

        $log = storage_path('enquiries.log');
        @file_put_contents($log, $line, FILE_APPEND | LOCK_EX);

        if ($this->wantsJson($request)) {
            return response(json_encode(['ok' => true]), 200, ['Content-Type' => 'application/json']);
        }

        return redirect('/contact?sent=1');
    }

    protected function renderWithError(array $data, array $errors)
    {
        $tour = Tours::find((string) (isset($data['tour']) ? $data['tour'] : ''));

        return view('pages.contact', $this->share([
            'title'      => 'Contact & enquiries',
            'hero'       => ['eyebrow' => 'start here', 'title' => 'tell us the day you want'],
            'dialCodes'  => config('site.dial_codes'),
            'trips'      => array_column(Tours::all(), 'title', 'slug'),
            'tour'       => $tour,
            'copy'       => Site::contactCopy(),
            'prefill'    => isset($data['message']) ? $data['message'] : $this->prefillFor($tour),
            'errors'     => $errors,
            'sent'       => false,
            'bodyClass'  => 'contact',
            'breadcrumb' => [$this->crumb('Contact', '/contact')],
        ]));
    }

    /**
     * Opening line for the message box when somebody arrives from a trip page.
     */
    protected function prefillFor($tour)
    {
        if (!$tour) {
            return '';
        }

        return sprintf(
            "We would like to do the %s (%s).%s\n\nOur dates: \nHow many of us: \nHotel: ",
            $tour['title'],
            $tour['duration'],
            $tour['price'] ? '' : ' Please send the price for our group.'
        );
    }

    protected function wantsJson(Request $request)
    {
        return $request->wantsJson() || $request->get('_ajax') !== null;
    }
}
