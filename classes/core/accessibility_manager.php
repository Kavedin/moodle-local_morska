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
namespace local_morska\core;

defined('MOODLE_INTERNAL') || die();

/**
 * Applies accessibility profile defaults.
 */
class accessibility_manager {
    public function profile_defaults(string $profile): array {
        $profiles = [
            'blind' => ['reader' => true, 'keyboard' => true, 'autoscroll' => true],
            'lowvision' => ['contrast' => true, 'magnifier' => true, 'textsize' => 1.3],
            'dyslexia' => ['dyslexiafont' => true, 'ruler' => true, 'linespacing' => 1.8],
            'motor' => ['keyboard' => true, 'largecontrols' => true],
            'cognitive' => ['highlight' => true, 'simplifiedui' => true],
        ];
        return $profiles[$profile] ?? [];
    }
}
