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

abstract class base_driver implements driver_interface {
    protected array $context = [];

    public static function get_priority(): int { return 10; }
    public function initialize(array $context = []): void { $this->context = $context; }
    public function get_title(): string { return static::get_name(); }
    public function get_current_object(): array { return ['type' => static::get_name(), 'context' => $this->context]; }
    public function get_current_content(): array { return ['title' => $this->get_title(), 'items' => []]; }
    public function next(): bool { return false; }
    public function previous(): bool { return false; }
    public function open(): bool { return false; }
    public function close(): bool { return false; }
    public function flip(): bool { return false; }
    public function expand(): bool { return false; }
    public function collapse(): bool { return false; }
    public function activate(): bool { return false; }
    public function pause(): bool { return false; }
    public function resume(): bool { return false; }
    public function is_finished(): bool { return false; }
}
