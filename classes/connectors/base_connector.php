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
namespace local_morska\connectors;

defined('MOODLE_INTERNAL') || die();

/**
 * Base contract for all Morska content connectors.
 */
abstract class base_connector {
    /**
     * Whether this connector can handle the current page.
     */
    abstract public function supports(string $pagetype, string $url): bool;

    /**
     * Human-readable context label shown in the widget.
     */
    abstract public function get_label(): string;

    /**
     * CSS selectors used by the browser-side reader to locate readable content.
     */
    abstract public function get_selectors(): array;

    /**
     * CSS selectors to ignore when building readable content.
     */
    public function get_exclusions(): array {
        return [
            'nav', 'header', 'footer', '.navbar', '.breadcrumb', '.block',
            '.drawer', '.activity-navigation', '.tertiary-navigation',
            '.morska-suite', '#morska-panel', '#morska-floating-button'
        ];
    }
}
