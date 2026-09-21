<?php

// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <https://www.gnu.org/licenses/>.

/**
 * Morska Accessibility Suite component.
 *
 * @package    local_morska
 * @copyright  2026 Kufundisha Tecknologia Consults
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();

use local_morska\core\context_engine;
use local_morska\local\license_manager;

/**
 * Decide whether Morska should load on this Moodle page.
 *
 * @return bool
 */
function local_morska_should_load(): bool {
    global $PAGE;

    if (!isloggedin() || isguestuser()) {
        return false;
    }

    $context = context_system::instance();
    if (!has_capability('local/morska:use', $context)) {
        return false;
    }

    // Avoid login pages, install/upgrade pages, and CLI-like admin upgrade contexts.
    $pagetype = $PAGE->pagetype ?? '';
    $url = $PAGE->url ? $PAGE->url->out(false) : '';

    if (strpos($pagetype, 'login') !== false) {
        return false;
    }

    if (strpos($url, '/admin/index.php') !== false || strpos($url, '/admin/cli/') !== false) {
        return false;
    }

    // Installation may complete without a key, but learner-facing features must
    // not load until EDD has authenticated the licence at least once.
    return license_manager::allows_core_features();
}

/**
 * Load CSS and JavaScript before the HTML head is printed.
 */
function local_morska_before_standard_html_head(): void {
    global $PAGE;

    if (!local_morska_should_load()) {
        return;
    }

    $PAGE->requires->css('/local/morska/styles.css');
    $engine = new context_engine();
    $PAGE->requires->js_call_amd('local_morska/reader', 'init', [$engine->detect()]);
}

/**
 * Render the floating widget before the footer.
 */
function local_morska_before_footer(): void {
    global $OUTPUT;

    if (!local_morska_should_load()) {
        return;
    }

    echo $OUTPUT->render_from_template('local_morska/widget', [
        'ownership' => get_string('ownership', 'local_morska'),
    ]);
}

/**
 * Show trial/subscription status to site administrators.
 */
function local_morska_before_standard_top_of_body_html(): void {
    if (!isloggedin() || !has_capability('moodle/site:config', context_system::instance())) {
        return;
    }

    $state = license_manager::get_access_state();
    $licenseurl = new moodle_url('/local/morska/license.php');
    $subscribeurl = license_manager::get_subscribe_url();

    if (in_array($state, ['trial', 'registration_grace'], true)) {
        $trial = license_manager::get_trial_status(false);
        $a = (object)[
            'days' => $trial['remainingdays'],
            'subscribeurl' => $subscribeurl,
        ];
        \core\notification::info(get_string('trialadminnotice', 'local_morska', $a));
        return;
    }

    if (in_array($state, ['active', 'grace'], true)) {
        return;
    }

    $a = (object)[
        'licenseurl' => $licenseurl->out(false),
        'subscribeurl' => $subscribeurl,
    ];
    \core\notification::warning(get_string('trialexpirednotice', 'local_morska', $a));
}
