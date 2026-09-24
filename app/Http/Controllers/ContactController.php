<?php

namespace App\Http\Controllers;

use App\Support\Repo;
use App\Support\Tours;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $tour = Tours::find((string) $request->get('tour'));

        return $this->view('pages.contact', [
            'title'       => 'Contact us | Fitzroy Travel',
            'description' => 'Talk your trip through with someone who has been. No email consultations — a conversation first.',
            'hero'        => [
                'eyebrow' => 'start the conversation',
                'title'   => 'contact us',
                'lede'    => 'Tell us who is travelling, roughly when, and what you would hate to miss. We will call you back.',
            ],
            'dialCodes'   => config('site.dial_codes'),
            'tour'        => $tour,
            'prefill'     => $this->prefillFor($tour),
            'interests'   => [
                'Botswana', 'Kenya', 'Namibia', 'Rwanda', 'Tanzania', 'Uganda', 'Zimbabwe',
                'Multi-country', 'Not sure yet',
            ],
            'bodyClass'   => 'contact',
            'sent'        => (bool) $request->get('sent'),
        ]);
    }

    /**
     * Enquiry endpoint. The source site posts into Gravity Forms; this writes a
     * line to storage/enquiries.log and answers, so the front end is fully wired
     * without a third-party dependency.
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

            $tour = Tours::find((string) (isset($data['tour']) ? $data['tour'] : ''));

            return view('pages.contact', $this->share([
                'title'      => 'Contact us | Fitzroy Travel',
                'hero'       => ['eyebrow' => 'start the conversation', 'title' => 'contact us'],
                'dialCodes'  => config('site.dial_codes'),
                'tour'       => $tour,
                'prefill'    => isset($data['message']) ? $data['message'] : $this->prefillFor($tour),
                'interests'  => ['Botswana', 'Kenya', 'Namibia', 'Rwanda', 'Tanzania', 'Uganda', 'Zimbabwe', 'Multi-country', 'Not sure yet'],
                'errors'     => $errors,
                'sent'       => false,
                'bodyClass'  => 'contact',
            ]));
        }

        $line = sprintf(
            "[%s] %s <%s> %s | %s | trip: %s | %s\n%s\n%s\n",
            date('Y-m-d H:i:s'),
            $data['name'],
            $data['email'],
            isset($data['phone']) ? trim($data['phone']) : '-',
            isset($data['country']) ? $data['country'] : '-',
            isset($data['travel']) ? $data['travel'] : '-',
            isset($data['tour']) && $data['tour'] ? 'booking: ' . $data['tour'] : '-',
            isset($data['message']) ? trim($data['message']) : '',
            str_repeat('-', 60)
        );

        $log = storage_path('enquiries.log');
        @file_put_contents($log, $line, FILE_APPEND | LOCK_EX);

        if ($this->wantsJson($request)) {
            return response(json_encode(['ok' => true]), 200, ['Content-Type' => 'application/json']);
        }

        return redirect('/contact-us?sent=1');
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
            "We would like to do the %s (%s). %s\n\nOur dates: \nHow many of us: \nHotel: ",
            $tour['title'],
            $tour['duration'],
            $tour['price'] ? '' : 'Please send the price for our group.'
        );
    }

    protected function wantsJson(Request $request)
    {
        return $request->wantsJson() || $request->get('_ajax') !== null;
    }
}
