<?php

namespace App\Support;

/**
 * Google Drive media bridge.
 *
 * The trip photography and films live in a Google Drive folder
 * (config('site.drive.folder')), one sub-folder per excursion. Two delivery
 * modes, switched by config('site.drive.mode'):
 *
 *  'drive' (default) — hot-links Drive's own endpoints. Needs the folder set
 *                      to "anyone with the link" (viewer). Nothing to upload,
 *                      the site picks up new photos the moment they are in
 *                      the folder.
 *      images  https://drive.google.com/thumbnail?id=<id>&sz=w1600
 *      videos  https://drive.google.com/file/d/<id>/preview   (iframe)
 *              https://drive.google.com/uc?export=download&id=<id> (<video src>)
 *
 *  'local' — emits {local_base}/<drive folder name>/<file name>. Because the
 *            path is simply the Drive folder structure, you can self-host by
 *            copying the folder straight in:
 *                cp -r "path/to/bro tour" public/img/tours
 *            …then set ASSET_BASE or site.drive.mode to 'local'.
 *
 * Media entries are stored as "<file id>|<original file name>" — the id feeds
 * Drive, the name feeds the local path.
 */
class Drive
{
    /** @return string 'drive' | 'local' */
    public static function mode()
    {
        $mode = (string) config('site.drive.mode');

        return $mode === 'local' ? 'local' : 'drive';
    }

    public static function img($entry, $width = 1280, $folder = null)
    {
        list($id, $name) = self::split($entry);

        if (self::mode() === 'drive') {
            return 'https://drive.google.com/thumbnail?id=' . $id . '&sz=w' . (int) $width;
        }

        return self::local($name ?: $id, $folder, false);
    }

    /** Original-quality URL for a lightbox / download link. */
    public static function full($entry, $folder = null)
    {
        list($id, $name) = self::split($entry);

        if (self::mode() === 'drive') {
            return 'https://drive.google.com/thumbnail?id=' . $id . '&sz=w2400';
        }

        return self::local($name ?: $id, $folder, false);
    }

    /** Embeddable player URL (iframe src). */
    public static function embed($entry, $folder = null)
    {
        list($id, $name) = self::split($entry);

        if (self::mode() === 'drive') {
            return 'https://drive.google.com/file/d/' . $id . '/preview';
        }

        return self::local($name ?: $id, $folder, false);
    }

    /** Direct file URL — mp4s stream in a <video> tag when hosted locally. */
    public static function file($entry, $folder = null)
    {
        list($id, $name) = self::split($entry);

        if (self::mode() === 'drive') {
            return 'https://drive.google.com/uc?export=download&id=' . $id;
        }

        return self::local($name ?: $id, $folder, false);
    }

    public static function id($entry)
    {
        return self::split($entry)[0];
    }

    /** Human-readable caption for alt text: "caption (3).jpg" → "Caption 3". */
    public static function label($entry)
    {
        list($id, $name) = self::split($entry);

        if (!$name) {
            return '';
        }

        $base = preg_replace('/\.[a-z0-9]+$/i', '', $name);
        $base = preg_replace('/\s*\((\d+)\)/', ' $1', $base);
        $base = preg_replace('/[-_]+/', ' ', $base);
        $base = trim(preg_replace('/\s+/', ' ', $base));

        return $base === '' ? $id : ucfirst($base);
    }

    private static function split($entry)
    {
        $parts = explode('|', (string) $entry, 2);

        return [trim($parts[0]), isset($parts[1]) ? trim($parts[1]) : null];
    }

    private static function local($relPath, $folder, $unused = false)
    {
        $base = rtrim((string) config('site.drive.local_base', '/img/tours'), '/');

        $segments = array_filter(array_merge([$folder ? trim($folder) : '', trim($relPath, '/')]), function ($s) {
            return $s !== '';
        });

        $path = implode('/', array_map(function ($segment) {
            return implode('/', array_map('rawurlencode', explode('/', $segment)));
        }, $segments));

        return $base . '/' . $path;
    }
}
