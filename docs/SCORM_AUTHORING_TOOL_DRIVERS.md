# SCORM Authoring Tool Drivers

Version 3.3.6 introduces vendor-aware SCORM handling.

## Implemented detection

- eXeLearning
- Articulate Rise
- Articulate Storyline scaffold
- Adobe Captivate detection
- iSpring detection
- Generic SCORM fallback

## Articulate Rise behaviour

The browser-side driver:

1. inspects nested same-origin frames;
2. waits for dynamically rendered Rise blocks through mutation observers;
3. selects visible lesson and block containers rather than the empty launch document;
4. refreshes the reading queue after Rise changes the DOM;
5. blocks automatic activation of Summary, Submit, Results, Exit and Finish controls;
6. prepares accordions, flashcards, tabs and labelled graphics using conservative selectors.

## Security limitation

The browser cannot inspect a cross-origin frame. SCORM packages delivered from the same Moodle origin can be inspected. Packages launched from another hostname require a compatible bridge or an injected script inside that package.
