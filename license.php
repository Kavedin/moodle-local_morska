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
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

use local_morska\local\license_manager;

admin_externalpage_setup('local_morska_license');
require_capability('moodle/site:config', context_system::instance());

$action = optional_param('action', '', PARAM_ALPHAEXT);

if ($action === 'synctrial') {
    require_sesskey();
    try {
        $trial = license_manager::sync_trial(false);
        $message = get_string('trialsyncresult', 'local_morska', $trial['status']);
        redirect(new moodle_url('/local/morska/license.php'), $message, null, \core\output\notification::NOTIFY_SUCCESS);
    } catch (Throwable $e) {
        redirect(new moodle_url('/local/morska/license.php'), $e->getMessage(), null, \core\output\notification::NOTIFY_ERROR);
    }
}


if ($action !== '') {
    require_sesskey();
    $map = [
        'activate' => 'activate_license',
        'check' => 'check_license',
        'deactivate' => 'deactivate_license',
    ];

    if (!isset($map[$action])) {
        throw new moodle_exception('invalidlicenseaction', 'local_morska');
    }

    try {
        $result = license_manager::request($map[$action]);
        if ($result['status'] === 'active') {
            $message = get_string('licenseactive', 'local_morska');
            $type = \core\output\notification::NOTIFY_SUCCESS;
        } else if ($result['status'] === 'inactive') {
            $message = get_string('licensedeactivated', 'local_morska');
            $type = \core\output\notification::NOTIFY_SUCCESS;
        } else {
            $detail = $result['error'] !== '' ? $result['error'] : $result['status'];
            $message = get_string('licenseactionresult', 'local_morska', $detail);
            $type = \core\output\notification::NOTIFY_WARNING;
        }
        redirect(new moodle_url('/local/morska/license.php'), $message, null, $type);
    } catch (Throwable $e) {
        redirect(
            new moodle_url('/local/morska/license.php'),
            $e->getMessage(),
            null,
            \core\output\notification::NOTIFY_ERROR
        );
    }
}

$PAGE->set_url(new moodle_url('/local/morska/license.php'));
$PAGE->set_title(get_string('licensemanagement', 'local_morska'));
$PAGE->set_heading(get_string('licensemanagement', 'local_morska'));

$status = license_manager::get_cached_status();
$statuskey = 'licensestatus_' . $status['accessstate'];
$statuslabel = get_string_manager()->string_exists($statuskey, 'local_morska')
    ? get_string($statuskey, 'local_morska')
    : ucfirst($status['accessstate']);

$rows = [];
$rows[] = [get_string('licensestatus', 'local_morska'), s($statuslabel)];
$rows[] = [get_string('trialstarted', 'local_morska'), userdate($status['trial']['started'])];
$rows[] = [get_string('trialends', 'local_morska'), userdate($status['trial']['expires'])];
$rows[] = [get_string('trialdaysremaining', 'local_morska'), (string)$status['trial']['remainingdays']];
$rows[] = [get_string('trialsource', 'local_morska'), s((string)$status['trial']['source'])];
$rows[] = [get_string('trialinstallationid', 'local_morska'), s($status['installationid'])];
$rows[] = [get_string('triallastchecked', 'local_morska'), $status['triallastchecked'] ? userdate($status['triallastchecked']) : get_string('never')];
if ($status['triallasterror'] !== '') { $rows[] = [get_string('triallasterror', 'local_morska'), s($status['triallasterror'])]; }
$rows[] = [get_string('licensedomain', 'local_morska'), s($CFG->wwwroot)];
$rows[] = [get_string('licenseinstitution', 'local_morska'), s((string)get_config('local_morska', 'license_institution'))];
$rows[] = [get_string('licenseserver', 'local_morska'), s(license_manager::get_endpoint())];
$rows[] = [get_string('licenseproductid', 'local_morska'), (string)license_manager::get_item_id()];
$rows[] = [get_string('licenseproduct', 'local_morska'), s($status['itemname'] ?: get_string('licenseproductunknown', 'local_morska'))];
$rows[] = [get_string('licenseexpiry', 'local_morska'), s($status['expires'] ?: get_string('notavailable', 'local_morska'))];
$rows[] = [get_string('licenseactivationsleft', 'local_morska'), s($status['activationsleft'] !== '' ? $status['activationsleft'] : get_string('notavailable', 'local_morska'))];
$rows[] = [get_string('licenseorderreference', 'local_morska'), $status['paymentid'] ? (string)$status['paymentid'] : get_string('notavailable', 'local_morska')];
$rows[] = [get_string('licensekeyverified', 'local_morska'), $status['keymatchesverified'] ? get_string('yes') : get_string('no')];
$rows[] = [get_string('licenselastchecked', 'local_morska'), $status['lastchecked'] ? userdate($status['lastchecked']) : get_string('never')];
$rows[] = [get_string('licenselastsuccessfulcheck', 'local_morska'), $status['lastsuccessfulcheck'] ? userdate($status['lastsuccessfulcheck']) : get_string('never')];
if ($status['lasterror'] !== '') {
    $rows[] = [get_string('licenselasterror', 'local_morska'), s($status['lasterror'])];
}

$table = new html_table();
$table->attributes['class'] = 'generaltable';
$table->data = $rows;

$settingsurl = new moodle_url('/admin/settings.php', ['section' => 'local_morska']);

$buttons = [];
foreach ([
    'activate' => 'activatelicense',
    'check' => 'checklicensestatus',
    'deactivate' => 'deactivatelicense',
] as $buttonaction => $stringkey) {
    $url = new moodle_url('/local/morska/license.php', [
        'action' => $buttonaction,
        'sesskey' => sesskey(),
    ]);
    $class = $buttonaction === 'deactivate' ? 'btn btn-secondary mr-2' : 'btn btn-primary mr-2';
    $buttons[] = html_writer::link($url, get_string($stringkey, 'local_morska'), ['class' => $class]);
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('licensemanagement', 'local_morska'));
echo $OUTPUT->notification(get_string('licenseauthenticationpolicy', 'local_morska'), \core\output\notification::NOTIFY_INFO);
if ($status['accessstate'] === 'trial') {
    $trialmessage = get_string('trialmanagementnotice', 'local_morska', $status['trial']['remainingdays']);
    echo $OUTPUT->notification($trialmessage, \core\output\notification::NOTIFY_INFO);
}
if (!$status['keymatchesverified'] && !$status['trial']['active']) {
    echo $OUTPUT->notification(get_string('licensekeynotverified', 'local_morska'), \core\output\notification::NOTIFY_WARNING);
}
echo html_writer::table($table);
$syncurl = new moodle_url('/local/morska/license.php', ['action' => 'synctrial', 'sesskey' => sesskey()]);
$syncbutton = html_writer::link($syncurl, get_string('synctrial', 'local_morska'), ['class' => 'btn btn-secondary mr-2']);
$subscribe = html_writer::link(license_manager::get_subscribe_url(), get_string('subscribemorska', 'local_morska'), [
    'class' => 'btn btn-success mr-2',
    'target' => '_blank',
    'rel' => 'noopener noreferrer',
]);
echo html_writer::div($subscribe . ' ' . $syncbutton . ' ' . implode(' ', $buttons), 'mb-3');
echo html_writer::link($settingsurl, get_string('editlicensesettings', 'local_morska'), ['class' => 'btn btn-secondary']);
echo $OUTPUT->footer();
