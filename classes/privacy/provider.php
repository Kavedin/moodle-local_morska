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

namespace local_morska\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\contextlist;

/**
 * Privacy provider for Morska Accessibility Suite.
 *
 * Morska does not persist learner personal data in Moodle. It does exchange
 * site-level installation, trial, and subscription entitlement data with the
 * KTC licensing service. Empty request-provider methods are supplied because
 * the external entitlement records are site-level rather than learner records.
 *
 * @package    local_morska
 * @copyright  2026 Kufundisha Tecknologia Consults
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements
        \core_privacy\local\metadata\provider,
        \core_privacy\local\request\plugin\provider {

    /**
     * Describe information exchanged with the external KTC licensing service.
     *
     * @param collection $collection Metadata collection.
     * @return collection
     */
    public static function get_metadata(collection $collection): collection {
        $collection->add_external_location_link('ktclicensing', [
            'installation_id' => 'privacy:metadata:ktclicensing:installationid',
            'site_url' => 'privacy:metadata:ktclicensing:siteurl',
            'moodle_version' => 'privacy:metadata:ktclicensing:moodleversion',
            'plugin_version' => 'privacy:metadata:ktclicensing:pluginversion',
            'trial_token' => 'privacy:metadata:ktclicensing:trialtoken',
            'license_key' => 'privacy:metadata:ktclicensing:licensekey',
            'product_id' => 'privacy:metadata:ktclicensing:productid',
            'institution' => 'privacy:metadata:ktclicensing:institution',
        ], 'privacy:metadata:ktclicensing');

        return $collection;
    }

    /**
     * Morska does not store learner personal data in Moodle contexts.
     *
     * @param int $userid User ID.
     * @return contextlist
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        return new contextlist();
    }

    /**
     * There is no learner personal data to export from Moodle.
     *
     * @param approved_contextlist $contextlist Approved contexts.
     * @return void
     */
    public static function export_user_data(approved_contextlist $contextlist): void {
        // No learner personal data is persisted by this plugin.
    }

    /**
     * There is no learner personal data to delete for a context.
     *
     * @param \context $context Moodle context.
     * @return void
     */
    public static function delete_data_for_all_users_in_context(\context $context): void {
        // No learner personal data is persisted by this plugin.
    }

    /**
     * There is no learner personal data to delete for a user.
     *
     * @param approved_contextlist $contextlist Approved contexts.
     * @return void
     */
    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        // No learner personal data is persisted by this plugin.
    }
}
