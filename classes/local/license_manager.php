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
namespace local_morska\local;

defined('MOODLE_INTERNAL') || die();

use moodle_exception;

/**
 * Manages the KTC-registered 15-day trial and EDD Software Licensing subscription.
 *
 * The authoritative trial clock lives on ktc.co.ug. A local cache is used only
 * for resilience between successful checks and during a short offline grace period.
 */
class license_manager {
    /** @var string[] Supported EDD actions. */
    private const ACTIONS = ['activate_license', 'check_license', 'deactivate_license'];

    /** @var string Authoritative EDD Software Licensing endpoint. */
    private const ENDPOINT = 'https://ktc.co.ug/';

    /** @var string KTC server trial registration endpoint. */
    private const TRIAL_REGISTER_ENDPOINT = 'https://ktc.co.ug/wp-json/morska/v1/trial/register';

    /** @var string KTC server trial validation endpoint. */
    private const TRIAL_CHECK_ENDPOINT = 'https://ktc.co.ug/wp-json/morska/v1/trial/check';

    /** @var string Product/subscription page shown after trial expiry. */
    private const SUBSCRIBE_URL = 'https://ktc.co.ug/downloads/morska/';

    /** @var int Authoritative EDD product ID for Morska Accessibility Suite. */
    private const ITEM_ID = 6001;

    /** @var int Offline cache/grace after a successful entitlement verification. */
    private const GRACE_PERIOD = 259200; // 72 hours.

    /** @var int Initial registration grace if KTC is temporarily unreachable. */
    private const INITIAL_REGISTRATION_GRACE = 86400; // 24 hours.

    /**
     * Return or create this Moodle installation's random UUID-like identifier.
     *
     * @return string
     */
    public static function ensure_installation_id(): string {
        $id = trim((string)get_config('local_morska', 'installation_id'));
        if ($id === '') {
            try {
                $id = bin2hex(random_bytes(32));
            } catch (\Throwable $e) {
                $id = hash('sha256', uniqid('morska-', true) . microtime(true));
            }
            set_config('installation_id', $id, 'local_morska');
        }
        return $id;
    }

    /**
     * Record when this copy first attempted entitlement registration.
     * This is not authoritative; it is only used for the short first-contact grace.
     *
     * @return int
     */
    private static function ensure_first_seen(): int {
        $firstseen = (int)get_config('local_morska', 'trial_first_seen_at');
        if ($firstseen <= 0) {
            $firstseen = time();
            set_config('trial_first_seen_at', $firstseen, 'local_morska');
        }
        return $firstseen;
    }

    /**
     * Build common trial API payload.
     *
     * @return array
     */
    private static function trial_payload(): array {
        global $CFG;
        return [
            'installation_id' => self::ensure_installation_id(),
            'site_url' => $CFG->wwwroot,
            'moodle_version' => isset($CFG->release) ? (string)$CFG->release : '',
            'plugin_version' => '3.4.0-beta1-marketplace-candidate',
        ];
    }

    /**
     * Contact the KTC trial service.
     *
     * @param bool $register true to register/check by site identity; false to validate an existing token.
     * @return array Normalised trial state.
     */
    public static function sync_trial(bool $register = false): array {
        global $CFG;
        require_once($CFG->libdir . '/filelib.php');

        $payload = self::trial_payload();
        $token = trim((string)get_config('local_morska', 'trial_token'));
        if (!$register && $token !== '') {
            $payload['trial_token'] = $token;
        }

        $endpoint = ($register || $token === '') ? self::TRIAL_REGISTER_ENDPOINT : self::TRIAL_CHECK_ENDPOINT;
        $curl = new \curl();
        $options = [
            'CURLOPT_TIMEOUT' => 20,
            'CURLOPT_CONNECTTIMEOUT' => 10,
            'CURLOPT_FOLLOWLOCATION' => true,
            'CURLOPT_MAXREDIRS' => 3,
            'CURLOPT_SSL_VERIFYPEER' => true,
            'CURLOPT_SSL_VERIFYHOST' => 2,
            'CURLOPT_HTTPHEADER' => ['Content-Type: application/json'],
        ];

        $raw = $curl->post($endpoint, json_encode($payload), $options);
        $info = $curl->get_info();
        $httpcode = isset($info['http_code']) ? (int)$info['http_code'] : 0;

        if ($raw === false || $httpcode < 200 || $httpcode >= 300) {
            self::save_trial_failure('Trial service HTTP ' . ($httpcode ?: 'unknown'));
            throw new moodle_exception('trialservererror', 'local_morska', '', $httpcode ?: 'unknown');
        }

        $data = json_decode($raw, true);
        if (!is_array($data) || empty($data['status'])) {
            self::save_trial_failure('Invalid trial service response');
            throw new moodle_exception('trialinvalidresponse', 'local_morska');
        }

        return self::save_trial_response($data);
    }

    /**
     * Persist server trial status.
     *
     * @param array $data
     * @return array
     */
    private static function save_trial_response(array $data): array {
        $status = clean_param((string)$data['status'], PARAM_ALPHANUMEXT);
        $allowed = ['trial', 'trial_expired', 'revoked', 'invalid'];
        if (!in_array($status, $allowed, true)) {
            $status = 'invalid';
        }

        $token = isset($data['trial_token']) ? clean_param((string)$data['trial_token'], PARAM_ALPHANUMEXT) : '';
        $started = isset($data['started_at']) ? (int)$data['started_at'] : 0;
        $expires = isset($data['expires_at']) ? (int)$data['expires_at'] : 0;
        $remainingdays = isset($data['days_remaining']) ? max(0, (int)$data['days_remaining']) : 0;
        $servernow = isset($data['server_time']) ? (int)$data['server_time'] : time();

        if ($token !== '') {
            set_config('trial_token', $token, 'local_morska');
        }
        set_config('trial_server_status', $status, 'local_morska');
        set_config('trial_started_at', $started, 'local_morska');
        set_config('trial_expires_at', $expires, 'local_morska');
        set_config('trial_days_remaining', $remainingdays, 'local_morska');
        set_config('trial_server_time', $servernow, 'local_morska');
        set_config('trial_last_checked', time(), 'local_morska');
        set_config('trial_last_successful_check', time(), 'local_morska');
        set_config('trial_last_error', '', 'local_morska');

        return [
            'active' => $status === 'trial',
            'status' => $status,
            'started' => $started,
            'expires' => $expires,
            'remainingseconds' => $expires > $servernow ? ($expires - $servernow) : 0,
            'remainingdays' => $remainingdays,
            'source' => 'server',
            'lastsuccessfulcheck' => time(),
        ];
    }

    /**
     * Save trial communication failure without extending the authoritative expiry.
     *
     * @param string $message
     */
    private static function save_trial_failure(string $message): void {
        set_config('trial_last_checked', time(), 'local_morska');
        set_config('trial_last_error', $message, 'local_morska');
    }

    /**
     * Get trial state. Uses KTC-authoritative cached dates and allows only a bounded
     * offline period after a successful check. First-time installs receive at most
     * 24 hours to contact the registration service.
     *
     * @param bool $refresh Force an online sync.
     * @return array
     */
    public static function get_trial_status(bool $refresh = false): array {
        $firstseen = self::ensure_first_seen();
        $token = trim((string)get_config('local_morska', 'trial_token'));
        $lastsuccess = (int)get_config('local_morska', 'trial_last_successful_check');

        if ($refresh || $token === '') {
            try {
                return self::sync_trial($token === '');
            } catch (\Throwable $e) {
                // Continue to the bounded cached/offline logic below.
            }
        }

        $status = (string)(get_config('local_morska', 'trial_server_status') ?: 'notregistered');
        $started = (int)get_config('local_morska', 'trial_started_at');
        $expires = (int)get_config('local_morska', 'trial_expires_at');
        $remainingdays = (int)get_config('local_morska', 'trial_days_remaining');

        if ($lastsuccess > 0) {
            $within_grace = (time() - $lastsuccess) <= self::GRACE_PERIOD;
            $activebydate = $expires > 0 && time() < $expires;
            $active = $status === 'trial' && $activebydate && $within_grace;
            return [
                'active' => $active,
                'status' => $active ? 'trial' : ($status === 'trial' && !$within_grace ? 'trial_verification_required' : $status),
                'started' => $started,
                'expires' => $expires,
                'remainingseconds' => $activebydate ? max(0, $expires - time()) : 0,
                'remainingdays' => $activebydate ? max(1, (int)ceil(($expires - time()) / DAYSECS)) : 0,
                'source' => $within_grace ? 'cache' : 'stale',
                'lastsuccessfulcheck' => $lastsuccess,
            ];
        }

        // First-contact resilience only. This cannot become a new 15-day trial.
        $provisional = (time() - $firstseen) <= self::INITIAL_REGISTRATION_GRACE;
        return [
            'active' => $provisional,
            'status' => $provisional ? 'registration_grace' : 'registration_required',
            'started' => $firstseen,
            'expires' => $firstseen + self::INITIAL_REGISTRATION_GRACE,
            'remainingseconds' => $provisional ? max(0, ($firstseen + self::INITIAL_REGISTRATION_GRACE) - time()) : 0,
            'remainingdays' => $provisional ? 1 : 0,
            'source' => 'local_registration_grace',
            'lastsuccessfulcheck' => 0,
        ];
    }

    /**
     * Perform an online EDD licence action.
     *
     * @param string $action EDD action.
     * @return array Normalised response.
     */
    public static function request(string $action): array {
        global $CFG;

        if (!in_array($action, self::ACTIONS, true)) {
            throw new moodle_exception('invalidlicenseaction', 'local_morska');
        }

        $licensekey = trim((string)get_config('local_morska', 'license_key'));
        if ($licensekey === '') {
            throw new moodle_exception('licensekeymissing', 'local_morska');
        }

        require_once($CFG->libdir . '/filelib.php');
        $curl = new \curl();
        $options = [
            'CURLOPT_TIMEOUT' => 20,
            'CURLOPT_CONNECTTIMEOUT' => 10,
            'CURLOPT_FOLLOWLOCATION' => true,
            'CURLOPT_MAXREDIRS' => 3,
            'CURLOPT_SSL_VERIFYPEER' => true,
            'CURLOPT_SSL_VERIFYHOST' => 2,
        ];
        $payload = [
            'edd_action' => $action,
            'item_id' => self::ITEM_ID,
            'license' => $licensekey,
            'url' => $CFG->wwwroot,
        ];

        $raw = $curl->post(self::ENDPOINT, $payload, $options);
        $info = $curl->get_info();
        $httpcode = isset($info['http_code']) ? (int)$info['http_code'] : 0;

        if ($raw === false || $httpcode < 200 || $httpcode >= 300) {
            $message = get_string('licensehttperror', 'local_morska', $httpcode ?: 'unknown');
            self::save_communication_failure($message);
            throw new moodle_exception('licensehttperror', 'local_morska', '', $httpcode ?: 'unknown');
        }

        $data = json_decode($raw, true);
        if (!is_array($data)) {
            self::save_communication_failure(get_string('licenseinvalidresponse', 'local_morska'));
            throw new moodle_exception('licenseinvalidresponse', 'local_morska');
        }
        return self::save_response($action, $data);
    }

    /** @param string $action @param array $data @return array */
    private static function save_response(string $action, array $data): array {
        $license = isset($data['license']) ? clean_param((string)$data['license'], PARAM_ALPHANUMEXT) : 'unknown';
        $success = !empty($data['success']);
        $error = isset($data['error']) ? clean_param((string)$data['error'], PARAM_ALPHANUMEXT) : '';
        $returneditemid = isset($data['item_id']) ? (int)$data['item_id'] : 0;
        $itemmatches = ($returneditemid === self::ITEM_ID);

        if ($action === 'deactivate_license' && $success) {
            $status = 'inactive';
            set_config('license_ever_verified', 0, 'local_morska');
            set_config('license_verified_key_hash', '', 'local_morska');
            set_config('license_last_successful_check', 0, 'local_morska');
        } else if ($success && $license === 'valid' && $itemmatches) {
            $status = 'active';
            set_config('license_ever_verified', 1, 'local_morska');
            set_config('license_verified_key_hash', hash('sha256', trim((string)get_config('local_morska', 'license_key'))), 'local_morska');
            set_config('license_last_successful_check', time(), 'local_morska');
        } else if ($license === 'expired' || $error === 'expired') {
            $status = 'expired';
        } else if ($license === 'disabled' || $error === 'disabled') {
            $status = 'revoked';
        } else if (!$itemmatches && $returneditemid !== 0) {
            $status = 'invalid';
            $error = 'invalid_item_id';
        } else {
            $status = 'invalid';
        }

        $expires = isset($data['expires']) ? clean_param((string)$data['expires'], PARAM_TEXT) : '';
        $itemname = isset($data['item_name']) ? clean_param((string)$data['item_name'], PARAM_TEXT) : '';
        $activationsleft = isset($data['activations_left']) ? clean_param((string)$data['activations_left'], PARAM_TEXT) : '';
        $paymentid = isset($data['payment_id']) ? (int)$data['payment_id'] : 0;
        $sitecount = isset($data['site_count']) ? (int)$data['site_count'] : 0;
        $licenselimit = isset($data['license_limit']) ? clean_param((string)$data['license_limit'], PARAM_TEXT) : '';

        set_config('license_status', $status, 'local_morska');
        set_config('license_expires', $expires, 'local_morska');
        set_config('license_item_name', $itemname, 'local_morska');
        set_config('license_returned_item_id', $returneditemid, 'local_morska');
        set_config('license_activations_left', $activationsleft, 'local_morska');
        set_config('license_payment_id', $paymentid, 'local_morska');
        set_config('license_site_count', $sitecount, 'local_morska');
        set_config('license_limit', $licenselimit, 'local_morska');
        set_config('license_last_checked', time(), 'local_morska');
        set_config('license_last_error', $error, 'local_morska');

        return [
            'success' => $success, 'status' => $status, 'license' => $license,
            'expires' => $expires, 'itemname' => $itemname, 'itemid' => $returneditemid,
            'activationsleft' => $activationsleft, 'paymentid' => $paymentid,
            'sitecount' => $sitecount, 'licenselimit' => $licenselimit,
            'error' => $error, 'raw' => $data,
        ];
    }

    /** @param string $message */
    private static function save_communication_failure(string $message): void {
        $eververified = (bool)get_config('local_morska', 'license_ever_verified');
        $lastsuccess = (int)get_config('local_morska', 'license_last_successful_check');
        $previousstatus = (string)get_config('local_morska', 'license_status');
        if ($eververified && $lastsuccess > 0 && in_array($previousstatus, ['active', 'grace'], true)) {
            set_config('license_status', (time() - $lastsuccess) <= self::GRACE_PERIOD ? 'grace' : 'offlineexpired', 'local_morska');
        }
        set_config('license_last_checked', time(), 'local_morska');
        set_config('license_last_error', $message, 'local_morska');
    }

    /** @return bool */
    public static function allows_core_features(): bool {
        $status = (string)get_config('local_morska', 'license_status');
        $eververified = (bool)get_config('local_morska', 'license_ever_verified');
        $currentkey = trim((string)get_config('local_morska', 'license_key'));
        $verifiedhash = (string)get_config('local_morska', 'license_verified_key_hash');
        $validverifiedkey = $eververified && $currentkey !== '' && $verifiedhash !== ''
            && hash_equals($verifiedhash, hash('sha256', $currentkey));
        if ($validverifiedkey && in_array($status, ['active', 'grace'], true)) {
            return true;
        }
        return self::get_trial_status(false)['active'];
    }

    /** @return string */
    public static function get_access_state(): string {
        $status = (string)(get_config('local_morska', 'license_status') ?: 'notconfigured');
        $eververified = (bool)get_config('local_morska', 'license_ever_verified');
        $currentkey = trim((string)get_config('local_morska', 'license_key'));
        $verifiedhash = (string)get_config('local_morska', 'license_verified_key_hash');
        $validverifiedkey = $eververified && $currentkey !== '' && $verifiedhash !== ''
            && hash_equals($verifiedhash, hash('sha256', $currentkey));

        if ($validverifiedkey && in_array($status, ['active', 'grace'], true)) {
            return $status;
        }
        $trial = self::get_trial_status(false);
        if ($trial['active']) {
            return $trial['status'];
        }
        if (in_array($status, ['expired', 'revoked', 'inactive', 'invalid', 'offlineexpired'], true)) {
            return $status;
        }
        return in_array($trial['status'], ['trial_expired', 'revoked', 'registration_required', 'trial_verification_required'], true)
            ? $trial['status'] : 'trialexpired';
    }

    /** @return array */
    public static function get_cached_status(): array {
        $trial = self::get_trial_status(false);
        return [
            'status' => (string)(get_config('local_morska', 'license_status') ?: 'notconfigured'),
            'accessstate' => self::get_access_state(),
            'expires' => (string)(get_config('local_morska', 'license_expires') ?: ''),
            'itemname' => (string)(get_config('local_morska', 'license_item_name') ?: ''),
            'itemid' => (int)(get_config('local_morska', 'license_returned_item_id') ?: 0),
            'activationsleft' => (string)(get_config('local_morska', 'license_activations_left') ?: ''),
            'paymentid' => (int)(get_config('local_morska', 'license_payment_id') ?: 0),
            'sitecount' => (int)(get_config('local_morska', 'license_site_count') ?: 0),
            'licenselimit' => (string)(get_config('local_morska', 'license_limit') ?: ''),
            'lastchecked' => (int)(get_config('local_morska', 'license_last_checked') ?: 0),
            'lastsuccessfulcheck' => (int)(get_config('local_morska', 'license_last_successful_check') ?: 0),
            'eververified' => (bool)get_config('local_morska', 'license_ever_verified'),
            'keymatchesverified' => self::configured_key_matches_verified_key(),
            'lasterror' => (string)(get_config('local_morska', 'license_last_error') ?: ''),
            'trial' => $trial,
            'installationid' => self::ensure_installation_id(),
            'triallastchecked' => (int)(get_config('local_morska', 'trial_last_checked') ?: 0),
            'triallasterror' => (string)(get_config('local_morska', 'trial_last_error') ?: ''),
        ];
    }

    /** @return bool */
    public static function configured_key_matches_verified_key(): bool {
        $currentkey = trim((string)get_config('local_morska', 'license_key'));
        $verifiedhash = (string)get_config('local_morska', 'license_verified_key_hash');
        return $currentkey !== '' && $verifiedhash !== ''
            && hash_equals($verifiedhash, hash('sha256', $currentkey));
    }

    public static function get_item_id(): int { return self::ITEM_ID; }
    public static function get_endpoint(): string { return self::ENDPOINT; }
    public static function get_subscribe_url(): string { return self::SUBSCRIBE_URL; }
    public static function get_trial_register_endpoint(): string { return self::TRIAL_REGISTER_ENDPOINT; }
}
