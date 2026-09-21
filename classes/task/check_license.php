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
namespace local_morska\task;

defined('MOODLE_INTERNAL') || die();

use local_morska\local\license_manager;

class check_license extends \core\task\scheduled_task {
    public function get_name() {
        return get_string('taskchecklicense', 'local_morska');
    }

    public function execute() {
        $key = trim((string)get_config('local_morska', 'license_key'));
        if ($key !== '') {
            try {
                $result = license_manager::request('check_license');
                mtrace('Morska licence status: ' . $result['status']);
                return;
            } catch (\Throwable $e) {
                mtrace('Morska licence check failed: ' . $e->getMessage());
            }
        }

        try {
            $trial = license_manager::sync_trial(false);
            mtrace('Morska trial entitlement status: ' . $trial['status']);
        } catch (\Throwable $e) {
            mtrace('Morska trial entitlement check failed: ' . $e->getMessage());
        }
    }
}
