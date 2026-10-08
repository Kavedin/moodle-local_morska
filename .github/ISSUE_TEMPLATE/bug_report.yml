name: Bug report
description: Report a reproducible problem with Morska Accessibility Suite
title: "[Bug]: "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for helping improve Morska Accessibility Suite. Do not post licence keys, passwords, learner records, or other confidential information.
  - type: input
    id: morska_version
    attributes:
      label: Morska version
      placeholder: e.g. 3.4.0-beta2
    validations:
      required: true
  - type: input
    id: moodle_version
    attributes:
      label: Moodle version
      placeholder: e.g. Moodle 4.5.6
    validations:
      required: true
  - type: dropdown
    id: area
    attributes:
      label: Area affected
      options:
        - Moodle page reading
        - H5P reading
        - SCORM reading
        - Keyboard navigation
        - Auto-highlight / auto-scroll
        - Voice / text-to-speech
        - Visual reading tools
        - Licence / trial activation
        - Administration / settings
        - Other
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser and operating system
      placeholder: e.g. Chrome 142 on Windows 11
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: Provide the shortest reliable sequence that reproduces the problem.
      placeholder: |
        1. Open ...
        2. Select ...
        3. Observe ...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behaviour
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behaviour
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Additional context
      description: If relevant, state the H5P content type or SCORM authoring tool. You may attach screenshots with sensitive information removed.
