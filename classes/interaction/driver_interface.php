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

interface driver_interface {
    public static function get_name(): string;
    public static function get_priority(): int;
    public function detect(array $context = []): bool;
    public function initialize(array $context = []): void;
    public function get_title(): string;
    public function get_current_object(): array;
    public function get_current_content(): array;
    public function next(): bool;
    public function previous(): bool;
    public function open(): bool;
    public function close(): bool;
    public function flip(): bool;
    public function expand(): bool;
    public function collapse(): bool;
    public function activate(): bool;
    public function pause(): bool;
    public function resume(): bool;
    public function is_finished(): bool;
}
