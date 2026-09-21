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

/**
 * Prepare server-registered trial identity on first installation.
 */
function xmldb_local_morska_install(): void {
    if (!(string)get_config('local_morska', 'installation_id')) {
        try {
            $id = bin2hex(random_bytes(32));
        } catch (\Throwable $e) {
            $id = hash('sha256', uniqid('morska-', true) . microtime(true));
        }
        set_config('installation_id', $id, 'local_morska');
    }
    if (!(int)get_config('local_morska', 'trial_first_seen_at')) {
        set_config('trial_first_seen_at', time(), 'local_morska');
    }
}
