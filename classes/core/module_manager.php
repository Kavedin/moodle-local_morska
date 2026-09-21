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
 * Central module manager for enabling/disabling Morska features.
 */
class module_manager {
    public const MODULES = ['reader', 'vision', 'language', 'navigation', 'speech', 'h5p', 'scorm', 'ai', 'analytics', 'author'];

    public function is_enabled(string $module): bool {
        if (!in_array($module, self::MODULES, true)) {
            return false;
        }
        return (bool)get_config('local_morska', 'module_' . $module);
    }

    public function enabled_modules(): array {
        return array_values(array_filter(self::MODULES, fn($m) => $this->is_enabled($m)));
    }
}
