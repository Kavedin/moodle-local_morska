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

use local_morska\connectors\h5p_connector;
use local_morska\connectors\moodle_connector;
use local_morska\connectors\scorm_connector;

defined('MOODLE_INTERNAL') || die();

/**
 * Detects the current Moodle context and exposes reading metadata.
 */
class context_engine {
    /** @var array */
    protected array $connectors;

    public function __construct() {
        $this->connectors = [
            new h5p_connector(),
            new scorm_connector(),
            new moodle_connector(),
        ];
    }

    public function detect(): array {
        global $PAGE, $COURSE, $cm;

        $pagetype = $PAGE->pagetype ?? '';
        $url = $PAGE->url ? $PAGE->url->out(false) : '';
        $connector = $this->resolve_connector($pagetype, $url);

        return [
            'pagetype' => $pagetype,
            'url' => $url,
            'courseid' => $COURSE->id ?? 0,
            'coursename' => $COURSE->fullname ?? '',
            'cmid' => isset($cm) ? $cm->id : 0,
            'modname' => isset($cm) ? $cm->modname : '',
            'contextlabel' => $connector->get_label(),
            'selectors' => $connector->get_selectors(),
            'exclusions' => $connector->get_exclusions(),
        ];
    }

    protected function resolve_connector(string $pagetype, string $url) {
        foreach ($this->connectors as $connector) {
            if ($connector->supports($pagetype, $url)) {
                return $connector;
            }
        }
        return new moodle_connector();
    }
}
