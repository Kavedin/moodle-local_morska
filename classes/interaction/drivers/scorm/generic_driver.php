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
namespace local_morska\interaction\drivers\scorm;

use local_morska\interaction\base_driver;

defined('MOODLE_INTERNAL') || die();

class generic_driver extends base_driver {
    public static function get_name(): string { return 'Generic SCORM Driver'; }
    public static function get_priority(): int { return 70; }
    public function detect(array $context = []): bool {
        return strpos($context['pagetype'] ?? '', 'mod-scorm') !== false || strpos($context['url'] ?? '', '/mod/scorm/') !== false;
    }
}
