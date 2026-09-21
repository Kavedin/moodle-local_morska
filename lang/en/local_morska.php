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
$string['pluginname'] = 'Morska Accessibility Suite';
$string['privacy:metadata'] = 'Morska does not store learner personal data in Moodle. Site-level trial and subscription entitlement information is exchanged with the KTC licensing service.';
$string['morska:use'] = 'Use Morska Accessibility Suite';
$string['openreader'] = 'Open Morska Accessibility Suite';
$string['voice'] = 'Voice';
$string['speed'] = 'Speed';
$string['pitch'] = 'Pitch';
$string['volume'] = 'Volume';
$string['play'] = 'Play';
$string['pause'] = 'Pause';
$string['resume'] = 'Resume';
$string['stop'] = 'Stop';
$string['close'] = 'Close';
$string['ownership'] = 'Morska Accessibility Suite by Kufundisha Tecknologia Consults.';
$string['profile'] = 'Accessibility profile';
$string['widgetposition'] = 'Widget position';
$string['phase1'] = 'Phase 1 Core Platform';
$string['driverframework'] = 'Driver framework';
$string['developerinspector'] = 'Developer inspector';
$string['detecteddriver'] = 'Detected driver';
$string['modulesheading'] = 'Modules';
$string['modulesheading_desc'] = 'Enable or disable Morska modules.';
$string['licensesettings'] = 'Licence settings';
$string['licensesettings_desc'] = 'Enter the institutional licence details supplied through the Morska products portal. Saving these settings does not activate the licence; use the Licence management page after saving.';
$string['licenseinstitution'] = 'Institution name';
$string['licenseinstitution_desc'] = 'The university, TVET institution, school, organisation or company holding the subscription.';
$string['licensekey'] = 'Licence key';
$string['licensekey_desc'] = 'Enter the Morska licence key issued after purchase. The value is masked in the administration interface.';
$string['licenseendpoint'] = 'Licensing server URL';
$string['licenseendpoint_desc'] = 'The WordPress site where Easy Digital Downloads and Software Licensing are installed, for example https://ktc.co.ug/.';
$string['licenseitemid'] = 'EDD product ID';
$string['licenseitemid_desc'] = 'The Easy Digital Downloads product ID for this Morska product.';
$string['licensemanagement'] = 'Morska licence management';
$string['openlicensemanagement'] = 'Open the licence management page';
$string['editlicensesettings'] = 'Edit licence settings';
$string['activatelicense'] = 'Activate licence';
$string['deactivatelicense'] = 'Deactivate licence';
$string['checklicensestatus'] = 'Check licence status';
$string['licensestatus'] = 'Licence status';
$string['licensedomain'] = 'Registered Moodle site';
$string['licenseproduct'] = 'Licensed product';
$string['licenseproductunknown'] = 'Not returned by the licensing server';
$string['licenseexpiry'] = 'Expiry date';
$string['licenseactivationsleft'] = 'Activations remaining';
$string['licenselastchecked'] = 'Last checked';
$string['licenselasterror'] = 'Latest licence message';
$string['licenseactive'] = 'The Morska licence is active.';
$string['licensedeactivated'] = 'The Morska licence has been deactivated for this Moodle site.';
$string['licenseactionresult'] = 'The licensing server returned status: {$a}';
$string['licenseaccessibilitypolicy'] = 'Morska includes a 15-day free evaluation period with no licence key required. After the trial, learner-facing accessibility features require an active subscription licence. A previously verified active licence receives a limited offline grace period if the licensing server is temporarily unavailable.';
$string['licenseconfigurationincomplete'] = 'Complete the licensing server URL, EDD product ID and licence key before performing this action.';
$string['invalidlicenseendpoint'] = 'The licensing server URL is invalid.';
$string['invalidlicenseaction'] = 'The requested licence action is invalid.';
$string['licensehttperror'] = 'The licensing server could not be reached successfully. HTTP status: {$a}';
$string['licenseinvalidresponse'] = 'The licensing server returned an invalid response.';
$string['licensestatus_active'] = 'Active';
$string['licensestatus_inactive'] = 'Inactive';
$string['licensestatus_expired'] = 'Expired';
$string['licensestatus_revoked'] = 'Revoked';
$string['licensestatus_invalid'] = 'Invalid';
$string['licensestatus_notconfigured'] = 'Not configured';
$string['licensestatus_unknown'] = 'Unknown';
$string['notavailable'] = 'Not available';
$string['licensekeymissing'] = 'Enter and save a Morska licence key before attempting online authentication.';
$string['licenseserverdetails'] = 'Licensing service';
$string['licenseserverdetails_desc'] = 'Morska authenticates online with Easy Digital Downloads Software Licensing at https://ktc.co.ug/ using product ID 6001. These authoritative values are built into the plugin and cannot be changed by a customer installation.';
$string['licenseserver'] = 'Licensing server';
$string['licenseproductid'] = 'EDD product ID';
$string['licenseorderreference'] = 'EDD order/payment reference';
$string['licensekeyverified'] = 'Current key verified online';
$string['licenselastsuccessfulcheck'] = 'Last successful verification';
$string['licenseauthenticationpolicy'] = 'A new installation can use Morska for 15 days without a licence key. After the free trial, learner-facing accessibility features are locked until a licence for EDD product 6001 is successfully authenticated online for this Moodle site. Expired, revoked, inactive or invalid subscriptions do not unlock Morska.';
$string['licensekeynotverified'] = 'The current licence key has not been successfully authenticated for this Moodle site. Save the correct key in Licence settings, then select Activate licence.';
$string['licenseactivationrequired'] = 'Morska requires an active subscription licence. <a href="{$a}">Open Morska licence management</a>.';
$string['taskchecklicense'] = 'Verify the Morska licence with EDD Software Licensing';
$string['licensestatus_grace'] = 'Temporary offline grace period';

// 15-day evaluation and subscription lock.
$string['licensestatus_trial'] = 'Free 15-day trial';
$string['licensestatus_trialexpired'] = 'Trial expired — subscription required';
$string['trialstarted'] = 'Trial started';
$string['trialends'] = 'Trial ends';
$string['trialdaysremaining'] = 'Trial days remaining';
$string['subscribemorska'] = 'Subscribe / Get a Morska licence';
$string['trialmanagementnotice'] = 'Morska is currently running in the free 15-day evaluation period. {$a} day(s) remain. No licence key is required during the trial.';
$string['trialadminnotice'] = 'Morska free trial: {$a->days} day(s) remaining. <a href="{$a->subscribeurl}" target="_blank" rel="noopener noreferrer">Subscribe and get a licence</a> before the trial ends to keep Morska available to learners.';
$string['trialexpirednotice'] = 'The Morska 15-day free trial has ended and learner-facing accessibility features are locked. <a href="{$a->subscribeurl}" target="_blank" rel="noopener noreferrer">Subscribe to Morska and get a licence</a>, then <a href="{$a->licenseurl}">activate the licence on this Moodle site</a>.';
$string['licensestatus_offlineexpired'] = 'Online verification required';
$string['trialheading'] = '15-day free trial';
$string['trialsettingsdesc'] = 'Morska works for 15 days after installation without a licence key. After the trial ends, learner-facing features lock until an active subscription licence is authenticated. Subscribe at <a href="https://ktc.co.ug/downloads/morska/" target="_blank" rel="noopener noreferrer">https://ktc.co.ug/downloads/morska/</a>.';

$string['trialsettingsdesc_server'] = 'Morska registers a single 15-day evaluation with the KTC licensing service at ktc.co.ug. Reinstalling the plugin on the same Moodle site does not restart the trial. After expiry, learner-facing features lock until an active subscription licence is authenticated. Subscribe at <a href="https://ktc.co.ug/downloads/morska/" target="_blank" rel="noopener noreferrer">https://ktc.co.ug/downloads/morska/</a>.';
$string['trialservererror'] = 'The KTC Morska trial service could not be reached. HTTP status: {$a}';
$string['trialinvalidresponse'] = 'The KTC Morska trial service returned an invalid response.';
$string['trialsyncresult'] = 'Morska trial entitlement synchronized. Server status: {$a}';
$string['synctrial'] = 'Synchronize trial status';
$string['trialsource'] = 'Trial status source';
$string['trialinstallationid'] = 'Morska installation ID';
$string['triallastchecked'] = 'Trial service last checked';
$string['triallasterror'] = 'Latest trial service message';
$string['licensestatus_registration_grace'] = 'Temporary trial registration grace';
$string['licensestatus_registration_required'] = 'Trial registration required';
$string['licensestatus_trial_expired'] = 'Server-registered trial expired — subscription required';
$string['licensestatus_trial_verification_required'] = 'Trial verification required';


// Paid subscription product information.
$string['commercialheading'] = 'Paid subscription product';
$string['commercialheading_desc'] = 'Morska Accessibility Suite is a paid institutional subscription product. A new installation receives one server-registered 15-day trial. After the trial, learner-facing Morska services require an active subscription entitlement. Subscribe at https://ktc.co.ug/downloads/morska/.';
$string['subscriptionrequired'] = 'An active Morska subscription is required after the 15-day trial.';

// Module labels and descriptions.
$string['module_reader'] = 'Text-to-speech reader';
$string['module_reader_desc'] = 'Enable the Morska text-to-speech reader.';
$string['module_vision'] = 'Vision and reading support';
$string['module_vision_desc'] = 'Enable visual reading support including highlighting and reading aids.';
$string['module_language'] = 'Language and translation';
$string['module_language_desc'] = 'Enable language and translation helper features.';
$string['module_navigation'] = 'Keyboard navigation';
$string['module_navigation_desc'] = 'Enable extended keyboard navigation assistance.';
$string['module_speech'] = 'Speech tools';
$string['module_speech_desc'] = 'Enable supported speech input and speech interaction tools.';
$string['module_h5p'] = 'H5P support';
$string['module_h5p_desc'] = 'Enable Morska support for compatible H5P learning content.';
$string['module_scorm'] = 'SCORM support';
$string['module_scorm_desc'] = 'Enable Morska support for compatible SCORM learning packages.';
$string['module_ai'] = 'AI assistance (Professional)';
$string['module_ai_desc'] = 'Reserved for subscription features that use configured AI services.';
$string['module_analytics'] = 'Accessibility analytics (Professional)';
$string['module_analytics_desc'] = 'Reserved for subscription accessibility analytics features.';
$string['module_author'] = 'Author support (Professional)';
$string['module_author_desc'] = 'Reserved for subscription authoring and remediation assistance.';

// Privacy API metadata.
$string['privacy:metadata:ktclicensing'] = 'Morska sends site-level entitlement information to the KTC licensing service to register the 15-day trial and validate paid subscriptions. It does not send learner names, learner email addresses, grades, course content, or learner activity records.';
$string['privacy:metadata:ktclicensing:installationid'] = 'A random Morska installation identifier used to distinguish the Moodle installation.';
$string['privacy:metadata:ktclicensing:siteurl'] = 'The Moodle site URL used to bind the trial or subscription entitlement to the installation.';
$string['privacy:metadata:ktclicensing:moodleversion'] = 'The Moodle version used for entitlement diagnostics and compatibility support.';
$string['privacy:metadata:ktclicensing:pluginversion'] = 'The installed Morska version used for entitlement diagnostics and compatibility support.';
$string['privacy:metadata:ktclicensing:trialtoken'] = 'A server-issued trial token used when validating an existing trial registration.';
$string['privacy:metadata:ktclicensing:licensekey'] = 'The institutional subscription licence key supplied by the site administrator for licence validation.';
$string['privacy:metadata:ktclicensing:productid'] = 'The Morska product identifier used when validating the subscription.';
$string['privacy:metadata:ktclicensing:institution'] = 'The institution name configured by the Moodle administrator.';
$string['privacy:metadata:nouserdata'] = 'Morska does not persist learner personal data in Moodle. Reading preferences are stored locally in the learner browser. Site-level entitlement data is documented separately as an external service.';
