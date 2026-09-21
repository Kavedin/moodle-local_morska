# Morska Accessibility Suite

Morska Accessibility Suite (`local_morska`) is a Moodle local plugin designed to extend accessibility support, including Text-To-Speech (TTS), across Moodle course pages and compatible H5P and SCORM learning content.

## Paid subscription product

**Morska is a paid institutional subscription product.** A new installation receives one server-registered **15-day free trial**. No license key is required during the trial. After the trial, learner-facing Morska services require an active subscription entitlement.

Subscription information and purchase: https://ktc.co.ug/downloads/morska/

The Moodle-facing code in this package is licensed under the GNU GPL v3 or later. The paid subscription covers the commercial Morska offering, including official distribution and the entitlement, update, support, compatibility, and connected-service benefits described in the applicable plan. See `SUBSCRIPTION.md`.

## Main capabilities

- Text-to-speech reading for Moodle course content.
- Reading support for compatible H5P content.
- Reading support for compatible SCORM packages.
- Extended keyboard navigation for supported learning objects.
- Auto-highlight and auto-scroll during reading.
- Voice, rate, pitch, and volume controls.
- Visual reading aids, including focus support and reading tools.
- Selected interactive-content assistance for supported accordions, tabs, flashcards, slides, and related learning objects.

Compatibility varies by Moodle version, theme, browser, H5P library, and SCORM authoring tool. Morska is an accessibility enhancement and does not replace a full operating-system screen reader.

## Moodle compatibility

This Marketplace candidate declares support for **Moodle 4.5**. Additional Moodle 5.x branches should be added to `version.php` only after formal validation on those branches.

## Download

For Moodle installation, use the packaged plugin release below:

[Download Morska v3.4.0 Beta 2](https://github.com/Kavedin/moodle-local_morska/releases/download/v3.4.0-beta2/morska_accessibility_suite_v3_4_0_beta2_marketplace_candidate.zip)

> Do not use GitHub's automatically generated "Source code" archives for Moodle installation.

## Installation

1. Download the official Morska ZIP package.
2. In Moodle, go to **Site administration → Plugins → Install plugins**.
3. Upload the ZIP and complete the Moodle upgrade process.
4. Review **Site administration → Plugins → Local plugins → Morska Accessibility Suite**.
5. A new site will automatically attempt to register its 15-day trial with the KTC licensing service.

## Trial and subscription activation

During the 15-day trial, the learner-facing accessibility suite is available without a license key.

After purchase:

1. Enter the institution name and Morska license key in the plugin settings.
2. Open **Morska licence management**.
3. Select **Activate licence**.
4. Morska validates the subscription against the KTC licensing service.

The plugin uses a bounded offline grace period after a successful entitlement check so a temporary connection failure does not immediately interrupt accessibility services.

## External services and privacy

Morska communicates with `https://ktc.co.ug/` for:

- server-registered trial creation and checking; and
- paid subscription license activation and checking.

The entitlement service may receive the following site-level information:

- Morska installation identifier;
- Moodle site URL;
- Moodle version;
- Morska version;
- trial token;
- subscription licence key and product identifier; and
- institution name configured by the site administrator.

Morska does **not** send learner names, learner email addresses, grades, course content, or learner activity records for license validation. Reading preferences used by the client interface are stored locally in the learner's browser. The external service is declared through Moodle's Privacy API in `classes/privacy/provider.php`.

## Accessibility and course-design responsibility

Morska can improve access, but institutions should continue to use accessible course-design practices, including meaningful alternative text, captions, semantic headings, sufficient colour contrast, keyboard-operable activities, accessible documents, and testing of H5P and SCORM packages.

## Support and documentation

Product and subscription information: https://ktc.co.ug/downloads/morska/

Kufundisha Tecknologia Consults (KTC)

Telephone: +256 393 513620

Source repository: https://github.com/Kavedin/moodle-local_morska

Public issue tracker: https://github.com/Kavedin/moodle-local_morska/issues

Please use GitHub Issues for reproducible bugs, Moodle/H5P/SCORM compatibility problems, and feature requests. For subscription, billing, or institution-specific support, use the KTC product/support channel at https://ktc.co.ug/downloads/morska/.

## Licence

Copyright © 2026 Kufundisha Tecknologia Consults.

Moodle-facing source code in this package is licensed under the GNU General Public License version 3 or later. See `LICENSE`.

Moodle and the Moodle logo are trademarks of Moodle Pty Ltd. Morska is an independent KTC product and is not represented as being endorsed or certified by Moodle Pty Ltd.
