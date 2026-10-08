# Morska Accessibility Suite

Morska Accessibility Suite (`local_morska`) is a Moodle local plugin designed to extend accessibility support across Moodle course pages and compatible H5P and SCORM learning content.

## Paid subscription product

**Morska is a paid institutional subscription product.** A new installation is eligible for one server-registered **15-day free trial**, started explicitly by a site administrator. No licence key is required during the trial. After the trial, learner-facing Morska services require an active subscription entitlement.

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

**Morska 3.4.0 has been tested successfully on Moodle 4.5 and Moodle 5.2.** Compatibility with other Moodle releases should be validated before being claimed as formally tested.

## Installation

1. Download the official Morska ZIP package.
2. In Moodle, go to **Site administration → Plugins → Install plugins**.
3. Upload the ZIP and complete the Moodle upgrade process.
4. Review **Site administration → Plugins → Local plugins → Morska Accessibility Suite**.
5. Open **Morska licence management**, review the trial/privacy notice, and select **Start 15-day trial**. Trial registration is an explicit administrator action; Morska does not contact the licensing service during ordinary page rendering.

## Trial and subscription activation

The 15-day trial begins only after a site administrator explicitly selects **Start 15-day trial**. During the trial the learner-facing accessibility suite is available without a licence key.

After purchase:

1. Enter the institution name and Morska licence key in the plugin settings.
2. Open **Morska licence management**.
3. Select **Activate licence**.
4. Morska validates the subscription against the KTC licensing service.

The plugin uses a bounded offline grace period after a successful entitlement check so a temporary connection failure does not immediately interrupt accessibility services.

## External services and privacy

Morska uses external services only for clearly identified functions.

### KTC licensing and trial service

Morska communicates with `https://ktc.co.ug/` for server-registered trial creation/checking and paid subscription licence activation/checking. The first trial-registration request occurs only after an administrator explicitly starts the trial. Ordinary Moodle page rendering reads cached entitlement state and does not make licensing network requests.

The entitlement service may receive site-level information including the Morska installation identifier, Moodle site URL, Moodle version, installed Morska version, trial token, subscription licence key, and product identifier. Learner names, learner email addresses, grades, course content, and learner activity records are not sent to KTC for licence validation.

### Google Translate (optional, disabled by default)

An administrator may enable the Google Translate helper. When enabled, a user who deliberately chooses a Translate action sends the selected or current readable text, source-language selection, and target-language selection to Google Translate in a new browser window. This may include course or user-contributed content. The widget displays an external-service notice before the translation controls.

### Browser speech recognition (optional, disabled by default)

An administrator may enable browser speech recognition for dictation. When a user starts dictation, microphone audio may be processed by the browser vendor or its speech-recognition service. Morska displays an external-service notice before the dictation controls.

These external locations are declared through Moodle's Privacy API in `classes/privacy/provider.php`. Reading preferences used by the client interface are stored locally in the learner's browser.

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
