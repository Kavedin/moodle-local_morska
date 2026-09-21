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

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_morska', get_string('pluginname', 'local_morska'));
    $ADMIN->add('localplugins', $settings);

    $settings->add(new admin_setting_heading(
        'local_morska_commercial',
        get_string('commercialheading', 'local_morska'),
        get_string('commercialheading_desc', 'local_morska')
    ));

    $settings->add(new admin_setting_heading(
        'local_morska_modules',
        get_string('modulesheading', 'local_morska'),
        get_string('modulesheading_desc', 'local_morska')
    ));

    foreach (['reader', 'vision', 'language', 'navigation', 'speech', 'h5p', 'scorm'] as $module) {
        $settings->add(new admin_setting_configcheckbox(
            'local_morska/module_' . $module,
            get_string('module_' . $module, 'local_morska'),
            get_string('module_' . $module . '_desc', 'local_morska'),
            1
        ));
    }

    foreach (['ai', 'analytics', 'author'] as $module) {
        $settings->add(new admin_setting_configcheckbox(
            'local_morska/module_' . $module,
            get_string('module_' . $module, 'local_morska'),
            get_string('module_' . $module . '_desc', 'local_morska'),
            0
        ));
    }

    $settings->add(new admin_setting_heading(
        'local_morska_license_heading',
        get_string('licensesettings', 'local_morska'),
        get_string('licensesettings_desc', 'local_morska')
    ));

    $settings->add(new admin_setting_description(
        'local_morska_trial_information',
        get_string('trialheading', 'local_morska'),
        get_string('trialsettingsdesc_server', 'local_morska')
    ));

    $settings->add(new admin_setting_configtext(
        'local_morska/license_institution',
        get_string('licenseinstitution', 'local_morska'),
        get_string('licenseinstitution_desc', 'local_morska'),
        '',
        PARAM_TEXT
    ));

    $settings->add(new admin_setting_configpasswordunmask(
        'local_morska/license_key',
        get_string('licensekey', 'local_morska'),
        get_string('licensekey_desc', 'local_morska'),
        ''
    ));

    $settings->add(new admin_setting_description(
        'local_morska/license_server_details',
        get_string('licenseserverdetails', 'local_morska'),
        get_string('licenseserverdetails_desc', 'local_morska')
    ));

    $licenseurl = new moodle_url('/local/morska/license.php');
    $settings->add(new admin_setting_description(
        'local_morska/license_manage_link',
        get_string('licensemanagement', 'local_morska'),
        html_writer::link($licenseurl, get_string('openlicensemanagement', 'local_morska'))
    ));

    $ADMIN->add('localplugins', new admin_externalpage(
        'local_morska_license',
        get_string('licensemanagement', 'local_morska'),
        new moodle_url('/local/morska/license.php'),
        'moodle/site:config'
    ));
}
