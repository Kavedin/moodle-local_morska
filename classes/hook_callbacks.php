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
 * Output hook callbacks for Morska Accessibility Suite.
 *
 * @package    local_morska
 * @copyright  2026 Kufundisha Tecknologia Consults
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_morska;

defined('MOODLE_INTERNAL') || die();

use local_morska\local\license_manager;

/**
 * Morska output hook callbacks.
 */
final class hook_callbacks {
    /**
     * Initialise client-side behaviour before the standard head is generated.
     *
     * @param \core\hook\output\before_standard_head_html_generation $hook Hook instance.
     * @return void
     */
    public static function before_standard_head_html_generation(
        \core\hook\output\before_standard_head_html_generation $hook
    ): void {
        global $PAGE;

        if (!self::should_load()) {
            return;
        }

        $PAGE->requires->js_call_amd('local_morska/reader', 'init', [self::enabled_modules()]);
    }

    /**
     * Show cached trial/subscription information to administrators.
     *
     * @param \core\hook\output\before_standard_top_of_body_html_generation $hook Hook instance.
     * @return void
     */
    public static function before_standard_top_of_body_html_generation(
        \core\hook\output\before_standard_top_of_body_html_generation $hook
    ): void {
        if (!isloggedin() || !has_capability('moodle/site:config', \context_system::instance())) {
            return;
        }

        $state = license_manager::get_access_state();
        $licenseurl = new \moodle_url('/local/morska/license.php');
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

        if ($state === 'registration_required') {
            \core\notification::info(get_string(
                'trialnotstartednotice',
                'local_morska',
                $licenseurl->out(false)
            ));
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

    /**
     * Render the widget immediately before the footer HTML.
     *
     * @param \core\hook\output\before_footer_html_generation $hook Hook instance.
     * @return void
     */
    public static function before_footer_html_generation(
        \core\hook\output\before_footer_html_generation $hook
    ): void {
        global $OUTPUT;

        if (!self::should_load()) {
            return;
        }

        $modules = self::enabled_modules();
        $context = [
            'ownership' => get_string('ownership', 'local_morska'),
            'version' => get_string('productversion', 'local_morska'),
            'module_reader' => $modules['reader'],
            'module_vision' => $modules['vision'],
            'module_language' => $modules['language'],
            'module_navigation' => $modules['navigation'],
            'module_speech' => $modules['speech'],
            'module_interaction' => $modules['navigation'] || $modules['h5p'] || $modules['scorm'],
            'enable_google_translate' => $modules['googletranslate'],
            'enable_speech_recognition' => $modules['speechrecognition'],
        ];
        $hook->add_html($OUTPUT->render_from_template('local_morska/widget', $context));
    }
    /**
     * Decide whether Morska should load on the current page.
     *
     * This reads cached entitlement state only and never contacts the licensing server.
     *
     * @return bool
     */
    private static function should_load(): bool {
        global $PAGE;

        if (!isloggedin() || isguestuser()) {
            return false;
        }

        if (!has_capability('local/morska:use', \context_system::instance())) {
            return false;
        }

        $pagetype = $PAGE->pagetype ?? '';
        $url = $PAGE->url ? $PAGE->url->out(false) : '';
        if (str_contains($pagetype, 'login')) {
            return false;
        }
        if (str_contains($url, '/admin/index.php') || str_contains($url, '/admin/cli/')) {
            return false;
        }

        return license_manager::allows_core_features();
    }

    /**
     * Return enabled feature flags used by both the template and AMD module.
     *
     * @return array
     */
    private static function enabled_modules(): array {
        $modules = [];
        foreach (['reader', 'vision', 'language', 'navigation', 'speech', 'h5p', 'scorm'] as $module) {
            $value = get_config('local_morska', 'module_' . $module);
            $modules[$module] = ($value === false) ? true : (bool)$value;
        }

        $modules['googletranslate'] = $modules['language']
            && (bool)get_config('local_morska', 'enable_google_translate');
        $modules['speechrecognition'] = $modules['speech']
            && (bool)get_config('local_morska', 'enable_speech_recognition');

        return $modules;
    }

}
