# Changelog

## 3.4.0 - 2026-10-04

- First stable Moodle Marketplace release.
- Successfully tested on Moodle 4.5 and Moodle 5.2.
- Includes all Marketplace review remediations from the 3.4.0 release-candidate series.
- Uses cached entitlement state during ordinary page rendering; licensing network requests are limited to explicit administrator actions and scheduled validation.
- Google Translate and browser speech-recognition integrations are optional, administrator-controlled, disabled by default, disclosed to users, and declared through Moodle's Privacy API.
- Uses Moodle Hooks API for output integration.
- Applies administrator module settings to the learner-facing interface and client behaviour.
- Uses Moodle language strings for visible and spoken messages.
- Reduces background scanning while the Morska panel is inactive.
- Includes rebuilt AMD production output and cleaned release packaging.

## 3.4.0-rc2 - 2026-10-04

- Fixed a Moodle Hooks API runtime error where hook callbacks referenced helper functions from `lib.php` that are not guaranteed to be loaded when hook classes are dispatched.
- Moved page-load and module-state helpers into `local_morska\hook_callbacks` as private static methods.
- Kept page rendering licence checks cache-only; no licensing network request is introduced by this fix.

## 3.4.0-rc1 — Marketplace remediation release candidate

- Rebuilt the AMD build artifact from the updated source and removed the stale identical build copy.
- Removed licensing/trial network requests from page-render callbacks; learner pages now read cached entitlement state only.
- Added explicit administrator action to start the server-registered 15-day trial.
- Added administrator controls for Google Translate and browser speech recognition; both external services are disabled by default.
- Added Privacy API declarations and in-widget disclosures for Google Translate and browser speech recognition.
- Migrated output integration to Moodle 4.5 Hooks API.
- Applied module settings to rendered UI and client-side behaviour; removed placeholder AI/analytics/author settings.
- Moved Mustache and JavaScript user-facing messages into Moodle language strings.
- Removed redundant manual loading of `styles.css`.
- Reduced background scanning so the 2.5-second monitor runs only while the panel is open or reading is active.
- Removed unused scaffolding classes and development roadmap files from the installable plugin.
- Sends the installed plugin version dynamically to the KTC entitlement service.
- Added GitHub Actions configuration for Moodle Plugin CI.

## 3.4.0-beta1 — Moodle Marketplace candidate

- Declares Moodle 4.5 as the initial supported Marketplace branch.
- Clarifies Morska as a paid institutional subscription product with a 15-day trial.
- Adds Moodle Privacy API metadata for KTC trial and subscription entitlement services.
- Moves administration labels and module descriptions into the language pack.
- Enforces the `local/morska:use` capability before loading learner-facing features.
- Adds GPL v3-or-later source headers and licence file for Moodle-facing code.
- Corrects the Morska brand CSS variable.
- Adds Marketplace-oriented README, subscription disclosure, and listing metadata draft.

## 3.3.30-alpha

- Added KTC server-registered 15-day trials and subscription lock after trial expiry.

## 3.4.0-beta2 - Marketplace candidate

- Added the public source repository: https://github.com/Kavedin/moodle-local_morska
- Added the public issue tracker: https://github.com/Kavedin/moodle-local_morska/issues
- Added GitHub issue templates for bug reports, compatibility reports, and feature requests.
- Updated Marketplace metadata and support links for paid/subscription distribution.
