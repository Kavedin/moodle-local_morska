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
$string['privacy:metadata'] = 'Morska does not persist learner personal data in Moodle. It exchanges site-level entitlement data with the KTC licensing service. Optional Google Translate and browser speech-recognition features may send user-selected content or microphone audio to external services when enabled by an administrator and initiated by a user.';
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

// Privacy API metadata.
$string['privacy:metadata:ktclicensing'] = 'Morska sends site-level entitlement information to the KTC licensing service to register the 15-day trial and validate paid subscriptions. It does not send learner names, learner email addresses, grades, course content, or learner activity records.';
$string['privacy:metadata:ktclicensing:installationid'] = 'A random Morska installation identifier used to distinguish the Moodle installation.';
$string['privacy:metadata:ktclicensing:siteurl'] = 'The Moodle site URL used to bind the trial or subscription entitlement to the installation.';
$string['privacy:metadata:ktclicensing:moodleversion'] = 'The Moodle version used for entitlement diagnostics and compatibility support.';
$string['privacy:metadata:ktclicensing:pluginversion'] = 'The installed Morska version used for entitlement diagnostics and compatibility support.';
$string['privacy:metadata:ktclicensing:trialtoken'] = 'A server-issued trial token used when validating an existing trial registration.';
$string['privacy:metadata:ktclicensing:licensekey'] = 'The institutional subscription licence key supplied by the site administrator for licence validation.';
$string['privacy:metadata:ktclicensing:productid'] = 'The Morska product identifier used when validating the subscription.';
$string['privacy:metadata:nouserdata'] = 'Morska does not persist learner personal data in Moodle. Reading preferences are stored locally in the learner browser. External entitlement, translation and speech-recognition services are documented separately.';


// Marketplace remediation: UI and external-service strings.
$string['productversion'] = '3.4.0 RC1';
$string['skiptoaccessibilitysuite'] = 'Skip to Morska Accessibility Suite';
$string['openaccessibilitysuite'] = 'Open Morska Accessibility Suite';
$string['openaccessibilitysuite_shortcut'] = 'Open Morska Accessibility Suite: Alt + Shift + M';
$string['closeaccessibilitysuite'] = 'Close Morska Accessibility Suite';
$string['detectedcontext'] = 'Detected:';
$string['context_currentpage'] = 'Current Moodle page';
$string['readercontrols'] = 'Reader controls';
$string['play'] = 'Play';
$string['pause'] = 'Pause';
$string['resume'] = 'Resume';
$string['stop'] = 'Stop';
$string['readingprogress'] = 'Reading progress';
$string['noreadingactive'] = 'No reading active';
$string['section_reader'] = 'Text-to-Speech Reader';
$string['voice'] = 'Voice';
$string['readingmode'] = 'Reading mode';
$string['mode_smart'] = 'Smart current content';
$string['mode_selection'] = 'Highlighted text';
$string['mode_visible'] = 'Visible page text';
$string['mode_paragraph'] = 'Current paragraph';
$string['speed'] = 'Speed';
$string['pitch'] = 'Pitch';
$string['volume'] = 'Volume';
$string['sentencenavigationcontrols'] = 'Sentence navigation controls';
$string['previous'] = 'Previous';
$string['next'] = 'Next';
$string['section_vision'] = 'Vision & Reading Mode';
$string['highlightcurrentsentence'] = 'Highlight current sentence';
$string['autoscrollwhilereading'] = 'Auto-scroll while reading';
$string['readingruler'] = 'Reading ruler';
$string['highcontrast'] = 'High contrast';
$string['dyslexiafont'] = 'Dyslexia-friendly font';
$string['textsize'] = 'Text size';
$string['linespacing'] = 'Line spacing';
$string['magnifierpagezoom'] = 'Magnifier / page zoom';
$string['magnifiersize'] = 'Magnifier size';
$string['section_language'] = 'Language & Translation';
$string['sourcelanguage'] = 'Source language';
$string['autodetect'] = 'Auto detect';
$string['english'] = 'English';
$string['swahili'] = 'Swahili';
$string['translateto'] = 'Translate to';
$string['translatehighlightedtext'] = 'Translate highlighted text';
$string['translatecurrentcontent'] = 'Translate current content';
$string['googletranslate_usernotice'] = 'External service notice: when you select a Translate action, the selected or current readable text is sent to Google Translate in a new browser window. Do not use this feature for confidential or sensitive content.';
$string['externaltranslationdisabled'] = 'Google Translate is disabled by the site administrator.';
$string['section_interaction'] = 'Interaction Engine';
$string['interactionmode'] = 'Interaction mode';
$string['interaction_assisted'] = 'Assisted';
$string['interaction_passive'] = 'Passive';
$string['prepareinteractivecontent'] = 'Prepare supported interactive content for reading';
$string['preparecurrentscreen'] = 'Prepare current interactive screen';
$string['runinteractiondiagnostics'] = 'Run interaction diagnostics';
$string['section_navigation'] = 'Keyboard Navigation';
$string['widgetposition'] = 'Widget position';
$string['position_middleright'] = 'Middle right';
$string['position_middleleft'] = 'Middle left';
$string['position_bottomright'] = 'Bottom right';
$string['position_bottomleft'] = 'Bottom left';
$string['resetwidgetposition'] = 'Reset widget position';
$string['shortcut_openclose'] = 'Open or close reader';
$string['shortcut_keyboardlistening'] = 'Start Keyboard Listening or repeat keyboard instructions';
$string['shortcut_readhighlighted'] = 'Read highlighted text';
$string['shortcut_readcurrent'] = 'Read smart current content';
$string['shortcut_pauseresume'] = 'Pause or resume';
$string['shortcut_tabnavigation'] = 'Move forward or backward through navigable content and controls';
$string['shortcut_activate'] = 'Activate or expand the focused interactive item';
$string['shortcut_readfocused'] = 'Read the currently focused item or revealed content';
$string['shortcut_escape'] = 'Stop speech, close the reader, or cancel a drag operation';
$string['section_speech'] = 'Speech-to-Text';
$string['speechrecognition_usernotice'] = 'External service notice: dictation uses the browser Web Speech Recognition service. Depending on the browser and device, microphone audio may be processed by the browser vendor or its speech service. Do not dictate confidential or sensitive information unless your institution permits this service.';
$string['externalspeechdisabled'] = 'Browser speech recognition is disabled by the site administrator.';
$string['dictationlanguage'] = 'Dictation language';
$string['speechtotextcontrols'] = 'Speech-to-text controls';
$string['startdictation'] = 'Start dictation';
$string['stopdictation'] = 'Stop dictation';
$string['dictationoutput'] = 'Dictation output';
$string['dictationplaceholder'] = 'Spoken words will appear here';
$string['insertintoactivefield'] = 'Insert into active field';
$string['section_preferences'] = 'Preferences';
$string['accessibilityprofile'] = 'Accessibility profile';
$string['profile_default'] = 'Default';
$string['profile_blind'] = 'Blind / screen reader user';
$string['profile_lowvision'] = 'Low vision';
$string['profile_dyslexia'] = 'Dyslexia support';
$string['profile_motor'] = 'Motor impairment';
$string['profile_cognitive'] = 'Cognitive support';
$string['remembermysettings'] = 'Remember my settings';
$string['section_about'] = 'Help & About';
$string['versionlabel'] = 'Version:';
$string['developerlabel'] = 'Developer:';

$string['externalservicesheading'] = 'External accessibility services';
$string['externalservicesheading_desc'] = 'External content-processing services are disabled by default. Enable them only after reviewing your institution\'s privacy and data-protection requirements.';
$string['enablegoogletranslate'] = 'Enable Google Translate helper';
$string['enablegoogletranslate_desc'] = 'Disabled by default. If enabled, users can deliberately send selected or current readable page content to Google Translate by choosing a Translate action. Morska displays an in-widget disclosure before these controls.';
$string['enablespeechrecognition'] = 'Enable browser speech recognition';
$string['enablespeechrecognition_desc'] = 'Disabled by default. If enabled, Morska can use the browser Web Speech Recognition API for dictation. Audio processing depends on the user\'s browser and speech service provider.';
$string['starttrial'] = 'Start 15-day trial';
$string['trialstartresult'] = 'Morska trial registration completed. Server status: {$a}';
$string['trialconsentrequired'] = 'An administrator must explicitly start the Morska trial before the site contacts the KTC trial service.';
$string['trialnotstartednotice'] = 'The Morska 15-day trial has not been started. <a href="{$a}">Open Morska licence management</a> to review the external-service information and start the trial.';

// Privacy API external locations.
$string['privacy:metadata:googletranslate'] = 'If the site administrator enables the Google Translate helper and a user chooses a Translate action, Morska opens Google Translate with selected or current readable page content in the URL.';
$string['privacy:metadata:googletranslate:pagecontent'] = 'Selected or current readable page text, which may include course or user-contributed content.';
$string['privacy:metadata:googletranslate:sourcelanguage'] = 'The source-language selection.';
$string['privacy:metadata:googletranslate:targetlanguage'] = 'The requested translation language.';
$string['privacy:metadata:browserspeechrecognition'] = 'If the site administrator enables browser speech recognition and a user starts dictation, microphone audio may be processed by the browser vendor or its speech-recognition service.';
$string['privacy:metadata:browserspeechrecognition:audio'] = 'Microphone audio captured during a user-initiated dictation session.';
$string['privacy:metadata:browserspeechrecognition:language'] = 'The selected dictation language.';

// JavaScript/spoken messages loaded through core/str.
$string['js_readablechanged'] = 'Readable content changed. Reading queue updated.';
$string['js_readingfinished'] = 'Reading finished.';
$string['js_readingstopped'] = 'Reading stopped.';
$string['js_ttsunsupported'] = 'Text to speech is not supported in this browser.';
$string['js_noreadablechoose'] = 'No readable text found. Select text or choose visible page text.';
$string['js_noreadable'] = 'No readable text found.';
$string['js_readingstarted'] = 'Reading started.';
$string['js_suiteopened'] = 'Morska Accessibility Suite opened.';
$string['js_suiteclosed'] = 'Morska Accessibility Suite closed.';
$string['js_noactivequeue'] = 'No active reading queue.';
$string['js_nextsentence'] = 'Next sentence.';
$string['js_previoussentence'] = 'Previous sentence.';
$string['js_notexttranslation'] = 'No text available for translation.';
$string['js_translationopened'] = 'Google Translate opened in a new window.';
$string['js_speechunsupported'] = 'Speech to text is not supported in this browser.';
$string['js_dictationerror'] = 'Dictation error. Check microphone permission.';
$string['js_dictationstopped'] = 'Dictation stopped.';
$string['js_dictationstarted'] = 'Dictation started.';
$string['js_nodictatedtext'] = 'There is no dictated text to insert.';
$string['js_noactivefield'] = 'No active field found for dictated text.';
$string['js_dictationinserted'] = 'Dictation inserted.';
$string['js_readingpaused'] = 'Reading paused.';
$string['js_readingresumed'] = 'Reading resumed.';
$string['js_profileapplied'] = 'Accessibility profile applied.';
$string['js_positionchanged'] = 'Widget position changed.';
$string['js_positionreset'] = 'Widget position reset.';
$string['js_nointeractive'] = 'No supported interactive reading objects were detected on the current screen.';
$string['js_interactiveprepared'] = 'Interactive reading sequence prepared.';
$string['js_context_h5p'] = 'H5P interactive screen';
$string['js_context_scorm'] = 'SCORM interactive screen';
$string['js_context_book'] = 'Moodle Book chapter';
$string['js_context_page'] = 'Moodle Page';
$string['js_context_quiz'] = 'Quiz content';
$string['js_context_course'] = 'Course content';
$string['js_context_current'] = 'Current Moodle page';
$string['js_context_genericscorm'] = 'Generic SCORM';
$string['js_keyboardinstructions'] = 'Keyboard listening is on. Use Tab and Shift plus Tab to move through content and controls. Use Enter or Space to activate controls, R to read the focused item, arrow keys for supported tabs or slides, and Escape to stop speech or cancel an interaction.';
$string['js_nofocuseditem'] = 'No content item is currently focused. Press Tab to move through the page content.';
$string['js_noreadableitem'] = 'No readable content was found for this item. Press Tab to continue.';
$string['js_activateandread'] = 'Activate this item with Enter or Space, then press R again.';
$string['js_itemnoreadable'] = 'This item does not currently contain readable text. Press Tab to continue.';
$string['js_enditeminteractive'] = 'End of this item. Press Tab to move forward, Shift plus Tab to go back, Enter or Space to activate, or R to read again.';
$string['js_enditem'] = 'End of this item. Press Tab to move forward, Shift plus Tab to go back, or R to read again.';
$string['js_dragcancelled'] = 'Drag and drop cancelled.';
$string['js_itemactivated'] = 'Item activated. Press R to read the available content.';

$string['js_content'] = 'Content';
$string['js_image'] = 'Image';
$string['js_expanded'] = 'Expanded';
$string['js_collapsed'] = 'Collapsed';
$string['js_selected'] = 'Selected';
$string['js_draggable'] = 'Draggable item';
$string['js_droptarget'] = 'Drop target';
$string['js_slide'] = 'Slide';
$string['js_interactivereveal'] = 'interactive reveal';
$string['js_interactiveobject'] = 'interactive object';
$string['js_lessonpage'] = 'Lesson page';
$string['js_forumdiscussion'] = 'Forum discussion';
$string['js_assignmentinstructions'] = 'Assignment instructions';
$string['js_newlesson'] = 'New lesson loaded. Press Tab to begin navigating the lesson.';
$string['js_lessonready'] = 'Lesson ready. Press Tab to begin navigating the lesson.';
$string['js_nonextlesson'] = 'No next lesson control was found on this page.';
$string['js_nopreviouslesson'] = 'No previous lesson control was found on this page.';
$string['js_movingnextlesson'] = 'Moving to the next lesson.';
$string['js_movingpreviouslesson'] = 'Moving to the previous lesson.';

$string['js_draggableinstructions'] = 'Draggable item. Press Space to pick up this item. Then use Tab to move to a drop target and press Enter to drop it.';
$string['js_pressentertodrop'] = 'Press Enter to drop';
$string['js_here'] = 'here';
$string['js_tabthroughactivity'] = 'Use Tab to move through the activity.';
$string['js_slideinstructions'] = 'Slide. Use the Left and Right Arrow keys to move between slides. Press R to read the current slide.';
$string['js_activateinstructions'] = 'Press Enter or Space to activate. Press R to read this item or its revealed content.';
$string['js_readitemcontinue'] = 'Press R to read this item. Press Tab to continue.';
$string['js_currentslide'] = 'Current slide';
$string['js_slideword'] = 'Slide';
$string['js_of'] = 'of';
$string['js_pressrslide'] = 'Press R to read this slide.';
$string['js_dragselectedzones'] = 'selected. Drop zones are available. Press Tab to move to a drop zone, then press Enter to place the item. Press Escape to cancel.';
$string['js_dragpickedup'] = 'picked up. Use Tab to move to a drop target, then press Enter to drop it. Press Escape to cancel.';
$string['js_droppedon'] = 'dropped on';
$string['js_sectionactivated'] = 'Section activated';
$string['js_interactiveavailable'] = 'Interactive content available';
$string['js_pressrcontent'] = 'Press R to read this content.';
