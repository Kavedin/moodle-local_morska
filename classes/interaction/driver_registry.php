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
namespace local_morska\interaction;

defined('MOODLE_INTERNAL') || die();

class driver_registry {
    protected array $drivers = [];

    public function register(string $classname): void {
        if (class_exists($classname) && is_subclass_of($classname, driver_interface::class)) {
            $this->drivers[$classname] = $classname::get_priority();
            arsort($this->drivers, SORT_NUMERIC);
        }
    }

    public function all(): array {
        return array_keys($this->drivers);
    }

    public function resolve(array $context = []): ?driver_interface {
        foreach ($this->all() as $classname) {
            $driver = new $classname();
            if ($driver->detect($context)) {
                $driver->initialize($context);
                return $driver;
            }
        }
        return null;
    }
}
