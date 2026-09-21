/**
 * Morska Accessibility Suite reader.
 *
 * @module     local_morska/reader
 * @copyright  2026 Kufundisha Tecknologia Consults
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define([], function() {
    const storageKey = 'local_morska_preferences';
    const positionKey = 'local_morska_widget_position';
    const defaultPosition = 'middle-right';
    let utterance = null;
    let voices = [];
    let lastFocus = null;
    let isOpen = false;
    let readingQueue = [];
    let queueIndex = 0;
    let currentHighlight = null;
    let recognition = null;
    let lastEditableField = null;
    let lastReadableSignature = '';
    let lastReadableContext = '';
    let pageChangeTimer = null;
    let currentReadingSource = null;
    let resumePromptShown = false;
    let cachedSelectedText = '';
    let isInternalDomUpdate = false;
    let preparedInteractionQueue = [];
    let preparedInteractionSignature = '';
    let activeInteractionGroup = null;
    let interactionDiagnostics = [];
    let interactionStateCounter = 0;
    let focusedInteractive = null;
    let focusedInteractiveType = '';
    let focusedRevealedContent = null;
    let focusedRevealedTrigger = null;
    let keyboardListeningEnabled = false;
    let keyboardDragItem = null;
    let keyboardDragItemLabel = '';
    let keyboardDragDropZones = [];
    let keyboardDragSourceDocument = null;

    function qs(id) {
        return document.getElementById(id);
    }

    function announce(message) {
        const live = qs('morska-live');
        if (live) {
            live.textContent = '';
            setTimeout(() => { live.textContent = message; }, 50);
        }
    }

    function loadPrefs() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch (e) {
            return {};
        }
    }

    function savePrefs() {
        const remember = qs('morska-remember');
        if (remember && !remember.checked) {
            localStorage.removeItem(storageKey);
            return;
        }
        const prefs = {
            profile: qs('morska-profile')?.value || 'default',
            voice: qs('morska-voice')?.value || '',
            position: qs('morska-position')?.value || defaultPosition,
            mode: qs('morska-mode')?.value || 'smart',
            rate: qs('morska-rate')?.value || '1',
            pitch: qs('morska-pitch')?.value || '1',
            volume: qs('morska-volume')?.value || '1',
            autoscroll: qs('morska-autoscroll')?.checked ? '1' : '0',
            highlight: qs('morska-highlight')?.checked ? '1' : '0',
            ruler: qs('morska-reading-ruler')?.checked ? '1' : '0',
            highcontrast: qs('morska-high-contrast')?.checked ? '1' : '0',
            dyslexia: qs('morska-dyslexia-font')?.checked ? '1' : '0',
            magnifier: qs('morska-magnifier')?.checked ? '1' : '0',
            textsize: qs('morska-text-size')?.value || '1',
            linespacing: qs('morska-line-spacing')?.value || '1.4',
            magnifiersize: qs('morska-magnifier-size')?.value || '1.2',
            remember: qs('morska-remember')?.checked ? '1' : '0',
            sourceLanguage: qs('morska-source-language')?.value || 'auto',
            targetLanguage: qs('morska-target-language')?.value || 'sw',
            dictationLanguage: qs('morska-dictation-language')?.value || 'en-US',
            interactionMode: qs('morska-interaction-mode')?.value || 'assisted',
            autoInteract: qs('morska-auto-interact')?.checked ? '1' : '0'
        };
        localStorage.setItem(storageKey, JSON.stringify(prefs));
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function loadPosition() {
        try {
            return JSON.parse(localStorage.getItem(positionKey)) || null;
        } catch (e) {
            return null;
        }
    }

    function savePosition(left, top) {
        localStorage.setItem(positionKey, JSON.stringify({left: left, top: top}));
    }

    function setPresetPosition(position) {
        const button = qs('morska-floating-button');
        if (!button) {
            return;
        }
        button.style.left = 'auto';
        button.style.right = 'auto';
        button.style.top = 'auto';
        button.style.bottom = 'auto';
        button.style.transform = 'none';
        if (position === 'middle-left') {
            button.style.left = '1.25rem';
            button.style.top = '50%';
            button.style.transform = 'translateY(-50%)';
        } else if (position === 'bottom-right') {
            button.style.right = '1.25rem';
            button.style.bottom = '1.25rem';
        } else if (position === 'bottom-left') {
            button.style.left = '1.25rem';
            button.style.bottom = '1.25rem';
        } else {
            button.style.right = '1.25rem';
            button.style.top = '50%';
            button.style.transform = 'translateY(-50%)';
        }
        if (isOpen) {
            updatePanelPosition();
        }
    }

    function applyWidgetPosition() {
        const button = qs('morska-floating-button');
        if (!button) {
            return;
        }
        const prefs = loadPrefs();
        const preset = prefs.position || defaultPosition;
        setPresetPosition(preset);
        const saved = loadPosition();
        if (!saved) {
            return;
        }
        const buttonWidth = button.offsetWidth || 56;
        const buttonHeight = button.offsetHeight || 56;
        const left = clamp(parseFloat(saved.left), 8, window.innerWidth - buttonWidth - 8);
        const top = clamp(parseFloat(saved.top), 8, window.innerHeight - buttonHeight - 8);
        button.style.left = left + 'px';
        button.style.top = top + 'px';
        button.style.right = 'auto';
        button.style.bottom = 'auto';
        button.style.transform = 'none';
    }

    function updatePanelPosition() {
        const button = qs('morska-floating-button');
        const panel = qs('morska-panel');
        if (!button || !panel) {
            return;
        }
        const rect = button.getBoundingClientRect();
        const gap = 12;
        const middle = rect.left + rect.width / 2;
        const top = clamp(rect.top + rect.height / 2, 24, window.innerHeight - 24);
        panel.style.top = top + 'px';
        panel.style.bottom = 'auto';
        panel.style.transform = 'translateY(-50%)';

        if (middle > window.innerWidth / 2) {
            panel.style.left = 'auto';
            panel.style.right = (window.innerWidth - rect.left + gap) + 'px';
            panel.setAttribute('data-position', 'right');
        } else {
            panel.style.right = 'auto';
            panel.style.left = (rect.right + gap) + 'px';
            panel.setAttribute('data-position', 'left');
        }
    }

    function bindDrag() {
        const button = qs('morska-floating-button');
        if (!button || !window.PointerEvent) {
            return;
        }
        let startX = 0;
        let startY = 0;
        let originalLeft = 0;
        let originalTop = 0;
        let dragging = false;
        let moved = false;

        button.addEventListener('pointerdown', function(event) {
            if (event.button !== undefined && event.button !== 0) {
                return;
            }
            const rect = button.getBoundingClientRect();
            startX = event.clientX;
            startY = event.clientY;
            originalLeft = rect.left;
            originalTop = rect.top;
            dragging = true;
            moved = false;
            button.classList.add('morska-is-dragging');
            button.setPointerCapture(event.pointerId);
        });

        button.addEventListener('pointermove', function(event) {
            if (!dragging) {
                return;
            }
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                moved = true;
            }
            const left = clamp(originalLeft + dx, 8, window.innerWidth - button.offsetWidth - 8);
            const top = clamp(originalTop + dy, 8, window.innerHeight - button.offsetHeight - 8);
            button.style.left = left + 'px';
            button.style.top = top + 'px';
            button.style.right = 'auto';
            button.style.bottom = 'auto';
            button.style.transform = 'none';
            if (isOpen) {
                updatePanelPosition();
            }
        });

        function finishDrag(event) {
            if (!dragging) {
                return;
            }
            dragging = false;
            button.classList.remove('morska-is-dragging');
            const rect = button.getBoundingClientRect();
            savePosition(rect.left, rect.top);
            if (event && button.hasPointerCapture && button.hasPointerCapture(event.pointerId)) {
                button.releasePointerCapture(event.pointerId);
            }
            if (moved) {
                button.dataset.ignoreNextClick = '1';
                setTimeout(function() { delete button.dataset.ignoreNextClick; }, 50);
            }
        }

        button.addEventListener('pointerup', finishDrag);
        button.addEventListener('pointercancel', finishDrag);
    }

    function populateVoices() {
        const voiceSelect = qs('morska-voice');
        if (!voiceSelect) {
            return;
        }
        const prefs = loadPrefs();
        voices = window.speechSynthesis.getVoices().filter(function(voice) {
            return voice.lang && (voice.lang.toLowerCase().startsWith('en') || voice.lang.toLowerCase().startsWith('sw'));
        });
        voiceSelect.innerHTML = '';
        if (!voices.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'System default voice';
            voiceSelect.appendChild(option);
            return;
        }
        voices.forEach(function(voice, index) {
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = voice.name + ' (' + voice.lang + ')';
            voiceSelect.appendChild(option);
        });
        if (prefs.voice && voiceSelect.querySelector('option[value="' + prefs.voice + '"]')) {
            voiceSelect.value = prefs.voice;
        }
    }

    function applyProfile(profile) {
        const profiles = {
            default: {mode: 'smart', rate: '1', pitch: '1', volume: '1'},
            blind: {mode: 'smart', rate: '1.05', pitch: '1', volume: '1'},
            lowvision: {mode: 'paragraph', rate: '0.9', pitch: '1', volume: '1', highcontrast: true, textsize: '1.3', linespacing: '1.6'},
            dyslexia: {mode: 'paragraph', rate: '0.8', pitch: '1', volume: '1', dyslexia: true, ruler: true, textsize: '1.15', linespacing: '1.8'},
            motor: {mode: 'smart', rate: '1', pitch: '1', volume: '1'},
            cognitive: {mode: 'paragraph', rate: '0.75', pitch: '1', volume: '1', ruler: true, textsize: '1.1', linespacing: '1.7'}
        };
        const selected = profiles[profile] || profiles.default;
        ['high-contrast', 'dyslexia-font', 'reading-ruler', 'magnifier'].forEach(function(name) {
            const element = qs('morska-' + name);
            if (element) {
                element.checked = false;
            }
        });
        Object.keys(selected).forEach(function(name) {
            const idMap = {highcontrast: 'high-contrast', dyslexia: 'dyslexia-font', ruler: 'reading-ruler', textsize: 'text-size', linespacing: 'line-spacing', magnifiersize: 'magnifier-size'};
            const element = qs('morska-' + (idMap[name] || name));
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = !!selected[name];
                } else {
                    element.value = selected[name];
                }
            }
        });
        updateRangeLabels();
        applyVisionTools();
    }

    function applyPrefs() {
        const prefs = loadPrefs();
        ['profile', 'mode', 'position', 'rate', 'pitch', 'volume', 'text-size', 'line-spacing', 'magnifier-size', 'source-language', 'target-language', 'dictation-language'].forEach(function(name) {
            const element = qs('morska-' + name);
            const key = name.replace(/-/g, '');
            if (element && prefs[key]) {
                element.value = prefs[key];
            }
        });
        if (qs('morska-autoscroll')) {
            qs('morska-autoscroll').checked = prefs.autoscroll === '1';
        }
        if (qs('morska-highlight')) {
            qs('morska-highlight').checked = prefs.highlight !== '0';
        }
        if (qs('morska-reading-ruler')) {
            qs('morska-reading-ruler').checked = prefs.ruler === '1';
        }
        if (qs('morska-high-contrast')) {
            qs('morska-high-contrast').checked = prefs.highcontrast === '1';
        }
        if (qs('morska-dyslexia-font')) {
            qs('morska-dyslexia-font').checked = prefs.dyslexia === '1';
        }
        if (qs('morska-magnifier')) {
            qs('morska-magnifier').checked = prefs.magnifier === '1';
        }
        if (qs('morska-remember')) {
            qs('morska-remember').checked = prefs.remember !== '0';
        }
        if (qs('morska-interaction-mode')) {
            qs('morska-interaction-mode').value = prefs.interactionMode || 'assisted';
        }
        if (qs('morska-auto-interact')) {
            qs('morska-auto-interact').checked = prefs.autoInteract !== '0';
        }
        updateRangeLabels();
        applyVisionTools();
    }

    function updateRangeLabels() {
        ['rate', 'pitch', 'volume', 'text-size', 'line-spacing', 'magnifier-size'].forEach(function(name) {
            const input = qs('morska-' + name);
            const label = qs('morska-' + name + '-value');
            if (input && label) {
                label.textContent = input.value;
            }
        });
    }


    function toggleRootClass(className, enabled) {
        document.documentElement.classList.toggle(className, !!enabled);
    }

    function ensureReadingRuler() {
        let ruler = qs('morska-reading-ruler-overlay');
        if (!ruler) {
            ruler = document.createElement('div');
            ruler.id = 'morska-reading-ruler-overlay';
            ruler.setAttribute('aria-hidden', 'true');
            document.body.appendChild(ruler);
        }
        return ruler;
    }

    function updateReadingRuler(event) {
        const ruler = qs('morska-reading-ruler-overlay');
        if (!ruler) {
            return;
        }
        const y = event && typeof event.clientY === 'number' ? event.clientY : window.innerHeight * 0.45;
        ruler.style.top = clamp(y - (ruler.offsetHeight || 52) / 2, 0, window.innerHeight - (ruler.offsetHeight || 52)) + 'px';
    }

    function applyVisionTools() {
        const highcontrast = qs('morska-high-contrast')?.checked;
        const dyslexia = qs('morska-dyslexia-font')?.checked;
        const rulerEnabled = qs('morska-reading-ruler')?.checked;
        const magnifier = qs('morska-magnifier')?.checked;
        const textSize = qs('morska-text-size')?.value || '1';
        const lineSpacing = qs('morska-line-spacing')?.value || '1.4';
        const magnifierSize = qs('morska-magnifier-size')?.value || '1.2';

        toggleRootClass('local-morska-high-contrast', highcontrast);
        toggleRootClass('local-morska-dyslexia-font', dyslexia);
        toggleRootClass('local-morska-text-adjust', parseFloat(textSize) > 1 || parseFloat(lineSpacing) !== 1.4);
        toggleRootClass('local-morska-magnifier', magnifier);

        document.documentElement.style.setProperty('--morska-text-scale', textSize);
        document.documentElement.style.setProperty('--morska-line-spacing', lineSpacing);
        document.documentElement.style.setProperty('--morska-magnifier-scale', magnifierSize);

        if (rulerEnabled) {
            ensureReadingRuler();
            updateReadingRuler();
        } else {
            qs('morska-reading-ruler-overlay')?.remove();
        }
    }

    function saveSectionState() {
        const openSections = Array.from(document.querySelectorAll('.morska-section'))
            .filter(function(section) { return section.open; })
            .map(function(section) { return section.dataset.section; })
            .filter(Boolean);
        localStorage.setItem('local_morska_open_sections', JSON.stringify(openSections));
    }

    function restoreSectionState() {
        let openSections = ['reader'];
        try {
            openSections = JSON.parse(localStorage.getItem('local_morska_open_sections')) || openSections;
        } catch (e) {}
        document.querySelectorAll('.morska-section').forEach(function(section) {
            const name = section.dataset.section;
            section.open = openSections.indexOf(name) !== -1;
        });
    }

    function getSelectionFromDocument(doc) {
        try {
            const selection = doc.defaultView.getSelection();
            return selection ? selection.toString().trim() : '';
        } catch (e) {
            return '';
        }
    }

    function safeClick(element) {
        if (!element || typeof element.click !== 'function' || !isVisible(element)) {
            return false;
        }
        try {
            element.click();
            return true;
        } catch (e) {
            try {
                element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: element.ownerDocument.defaultView}));
                return true;
            } catch (err) {
                return false;
            }
        }
    }



    function fireActivationEvents(element) {
        if (!element || !isVisible(element)) {
            return false;
        }
        const win = element.ownerDocument.defaultView;
        const events = ['pointerdown', 'mousedown', 'mouseup', 'click'];
        let fired = false;
        events.forEach(function(type) {
            try {
                element.dispatchEvent(new win.MouseEvent(type, {bubbles: true, cancelable: true, view: win}));
                fired = true;
            } catch (e) {}
        });
        try {
            element.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true, cancelable: true}));
            element.dispatchEvent(new win.KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true, cancelable: true}));
            fired = true;
        } catch (e) {}
        return fired;
    }

    function revealHiddenChildren(container) {
        let revealed = 0;
        if (!container) {
            return revealed;
        }
        try {
            container.querySelectorAll('[hidden], [aria-hidden="true"], .collapse:not(.show), [style*="display: none"], [style*="visibility: hidden"]').forEach(function(node) {
                const className = (node.className || '').toString().toLowerCase();
                const looksLikeContent = /content|body|panel|accordion|collapse|answer|back|description|text/.test(className) || node.innerText.trim().length > 0;
                if (!looksLikeContent) {
                    return;
                }
                node.removeAttribute('hidden');
                node.setAttribute('aria-hidden', 'false');
                node.classList.add('show');
                node.style.display = 'block';
                node.style.visibility = 'visible';
                node.style.height = 'auto';
                node.style.maxHeight = 'none';
                node.style.opacity = '1';
                revealed++;
            });
        } catch (e) {}
        return revealed;
    }

    function expandH5PAccordions(root) {
        let actions = 0;
        if (!root) {
            return actions;
        }
        try {
            const accordionRoots = root.matches && root.matches('.h5p-accordion') ? [root] : Array.from(root.querySelectorAll('.h5p-accordion, [class*="accordion"]'));
            const panels = [];
            accordionRoots.forEach(function(acc) {
                acc.querySelectorAll('.h5p-panel, .h5p-accordion-panel, [class*="accordion"] [aria-expanded], [class*="accordion"] button, [class*="accordion"] [role="button"]').forEach(function(panel) {
                    panels.push(panel);
                });
            });

            const triggers = [];
            panels.forEach(function(panel) {
                const candidates = panel.matches && (panel.matches('button, [role="button"], [aria-expanded]')) ? [panel] : Array.from(panel.querySelectorAll('button, [role="button"], [aria-expanded], .h5p-panel-title, .h5p-panel-button, .h5p-panel-heading, .h5p-panel-title-wrapper'));
                candidates.forEach(function(candidate) {
                    if (triggers.indexOf(candidate) === -1 && isVisible(candidate)) {
                        triggers.push(candidate);
                    }
                });
            });

            triggers.forEach(function(trigger) {
                const expanded = trigger.getAttribute('aria-expanded');
                const shouldOpen = expanded === null || expanded === 'false' || trigger.classList.contains('collapsed');
                if (!shouldOpen) {
                    return;
                }
                if (safeClick(trigger) || fireActivationEvents(trigger)) {
                    actions++;
                }
                const parent = trigger.closest('.h5p-panel, .h5p-accordion-panel, [class*="accordion"]');
                if (parent) {
                    actions += revealHiddenChildren(parent);
                }
            });

            accordionRoots.forEach(function(acc) {
                actions += revealHiddenChildren(acc);
            });
        } catch (e) {}
        return actions;
    }



    function detectAuthoringTool(doc) {
        if (!doc) {
            return 'unknown';
        }
        let html = '';
        let url = '';
        try {
            html = (doc.documentElement ? doc.documentElement.innerHTML.substring(0, 120000) : '').toLowerCase();
            url = (doc.location ? doc.location.href : '').toLowerCase();
        } catch (e) {}
        if (doc.querySelector && (doc.querySelector('#app') && (html.indexOf('lib/rise/') !== -1 || html.indexOf('__fetchcourse') !== -1))) {
            return 'articulate-rise';
        }
        if (html.indexOf('articulate_rise') !== -1 || url.indexOf('scormcontent') !== -1 && html.indexOf('rise/') !== -1) {
            return 'articulate-rise';
        }
        if (html.indexOf('storyline') !== -1 || html.indexOf('player-interface.js') !== -1 || url.indexOf('story.html') !== -1) {
            return 'articulate-storyline';
        }
        if (html.indexOf('exelearning') !== -1 || doc.querySelector && doc.querySelector('[class*="exe-"], #siteNav, .exe-content')) {
            return 'exelearning';
        }
        if (html.indexOf('adobe captivate') !== -1 || html.indexOf('cp.movie') !== -1) {
            return 'adobe-captivate';
        }
        if (html.indexOf('ispring') !== -1) {
            return 'ispring';
        }
        return 'generic-scorm';
    }

    function getNestedFrameDocuments(rootDoc, depth) {
        depth = depth || 0;
        if (!rootDoc || depth > 4) {
            return [];
        }
        const results = [];
        try {
            rootDoc.querySelectorAll('iframe, frame').forEach(function(frame) {
                try {
                    const childDoc = frame.contentDocument || frame.contentWindow.document;
                    if (childDoc) {
                        results.push({document: childDoc, frame: frame, depth: depth + 1});
                        getNestedFrameDocuments(childDoc, depth + 1).forEach(function(item) { results.push(item); });
                    }
                } catch (e) {
                    // Cross-origin nested frame cannot be inspected by the browser.
                }
            });
        } catch (e) {}
        return results;
    }

    function getRiseReadableElement(doc) {
        if (!doc || !doc.querySelectorAll) {
            return null;
        }
        const preferred = doc.querySelector('.lesson-content, .blocks-lesson, [role="main"], main');
        if (preferred && isVisible(preferred) && textLength(preferred) > 20) {
            return preferred;
        }
        const selectors = [
            '[data-block-id]', '.block-wrapper', '.block',
            '[class*="lesson"] [class*="block"]',
            '[class*="accordion"]', '[class*="flashcard"]',
            '[class*="labeled-graphic"]', '[class*="timeline"]',
            '[class*="process"]', '[class*="tabs"]', '#app'
        ];
        return bestVisibleElement(doc, selectors);
    }

    function prepareRiseInteractiveContent(root) {
        if (!root || !root.querySelectorAll) {
            return 0;
        }
        let actions = 0;
        const safeSelectors = [
            '[class*="accordion"] [aria-expanded="false"]',
            '[class*="accordion"] button[aria-expanded="false"]',
            '[class*="accordion"] [role="button"][aria-expanded="false"]',
            '[class*="flashcard"] button[aria-label*="flip" i]',
            '[class*="flashcard"] [role="button"][aria-label*="flip" i]',
            '[class*="labeled-graphic"] button[aria-expanded="false"]',
            '[class*="labeled-graphic"] [role="button"][aria-expanded="false"]',
            '[class*="tabs"] [role="tab"][aria-selected="false"]'
        ];
        safeSelectors.forEach(function(selector) {
            try {
                root.querySelectorAll(selector).forEach(function(element) {
                    if (actions >= 30 || !isVisible(element)) {
                        return;
                    }
                    const label = cleanText(element.innerText || element.getAttribute('aria-label') || '');
                    if (/submit|summary|results|exit|finish|complete course/i.test(label)) {
                        return;
                    }
                    if (safeClick(element) || fireActivationEvents(element)) {
                        actions++;
                    }
                });
            } catch (e) {}
        });
        return actions;
    }

    function getInteractiveSelectors(context) {
        const common = [
            'details:not([open]) > summary',
            '[aria-expanded="false"]',
            '[role="tab"][aria-selected="false"]',
            '.accordion button.collapsed',
            '.collapse:not(.show) + button',
            '.tab, .tabs button, .nav-tabs button'
        ];
        const h5p = [
            '.h5p-accordion .h5p-panel-title',
            '.h5p-accordion .h5p-panel-button',
            '.h5p-accordion .h5p-panel-heading',
            '.h5p-accordion .h5p-panel-title-wrapper',
            '.h5p-accordion [role="button"]',
            '.h5p-accordion [aria-expanded="false"]',
            '.h5p-accordion button[aria-expanded="false"]',
            '.h5p-flashcards .h5p-answer-button',
            '.h5p-flashcards button',
            '.h5p-image-hotspot, .h5p-image-hotspots button',
            '.h5p-timeline .h5p-timeline-event, .h5p-timeline button'
        ];
        const scorm = [
            '[class*="accordion"] button',
            '[class*="collapse"] button',
            '[class*="tab"] button',
            '[class*="flashcard"] button',
            '[class*="flip"] button',
            'button[aria-label*="next" i], a[aria-label*="next" i]'
        ];
        if (context === 'h5p') {
            return common.concat(h5p);
        }
        if (context === 'scorm') {
            return common.concat(scorm);
        }
        return common;
    }

    function describeInteractiveContent(root, context) {
        if (!root) {
            return '';
        }
        const parts = [];
        try {
            root.querySelectorAll('details').forEach(function(details, index) {
                const summary = details.querySelector('summary');
                const body = cleanText(details.innerText);
                if (body) {
                    parts.push('Interactive section ' + (index + 1) + '. ' + (summary ? cleanText(summary.innerText) + '. ' : '') + body);
                }
            });
            root.querySelectorAll('[role="tab"], .h5p-accordion .h5p-panel-title, [aria-expanded]').forEach(function(item, index) {
                const label = cleanText(item.innerText || item.getAttribute('aria-label') || item.getAttribute('title') || 'Interactive item');
                if (label) {
                    parts.push('Interactive item ' + (index + 1) + '. ' + label + '.');
                }
            });
            root.querySelectorAll('[class*="flashcard"], [class*="card"], .h5p-flashcards').forEach(function(card, index) {
                const text = cleanText(card.innerText);
                if (text && text.length > 8) {
                    parts.push('Flashcard ' + (index + 1) + '. ' + text);
                }
            });
        } catch (e) {}
        return cleanText(parts.join(' '));
    }

    function waitForInteraction(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms || 220); });
    }

    function unsafeInteractionControl(element) {
        const label = cleanText((element && (element.innerText || element.getAttribute('aria-label') || element.getAttribute('title'))) || '');
        const cls = ((element && element.className) || '').toString().toLowerCase();
        return /submit|summary|results|exit|finish|complete course|next slide|previous slide|next page|previous page/i.test(label) ||
            /footer-next|footer-prev|course-presentation.*next|question-next/.test(cls);
    }

    function controlledElement(trigger, root) {
        if (!trigger) {
            return null;
        }
        const doc = trigger.ownerDocument || document;
        const controls = trigger.getAttribute('aria-controls');
        if (controls) {
            try {
                const controlled = doc.getElementById(controls);
                if (controlled) {
                    return controlled;
                }
            } catch (e) {}
        }
        const href = trigger.getAttribute('href');
        if (href && href.charAt(0) === '#') {
            try {
                const target = doc.querySelector(href);
                if (target) {
                    return target;
                }
            } catch (e) {}
        }
        const panel = trigger.closest('.h5p-panel, .h5p-accordion-panel, .accordion-item, [class*="accordion-item"], [class*="flashcard"], [class*="hotspot"], [role="tabpanel"]');
        if (panel) {
            const content = panel.querySelector('.h5p-panel-content, .accordion-body, .collapse, [role="region"], [role="tabpanel"], [class*="content"], [class*="body"], [class*="answer"], [class*="back"]');
            return content || panel;
        }
        let sibling = trigger.nextElementSibling;
        while (sibling && !isVisible(sibling)) {
            sibling = sibling.nextElementSibling;
        }
        return sibling || trigger.parentElement || root;
    }

    function isEditableTarget(element) {
        if (!element) {
            return false;
        }
        const tag = (element.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
    }

    function contentTypeForElement(element) {
        if (!element || !element.matches) {
            return '';
        }
        try {
            if (element.matches('[role="tab"]') || element.closest('[role="tablist"], .h5p-tabs, .exe-tabs, .exe-fx-tabs') ||
                    (element.matches('button,[role="button"]') && element.closest('.tabs, [class*="tabs"]'))) {
                return 'tab';
            }
            if (element.matches('summary') || element.getAttribute('aria-expanded') !== null ||
                    element.closest('.h5p-accordion, [class*="accordion"], .exe-accordion, .exe-fx-accordion')) {
                return 'accordion';
            }
            if (element.closest('.h5p-flashcards, [class*="flashcard"], [class*="flip-card"], .exe-flip-card, .exe-flipcards, .flashcards') ||
                    element.matches('.flash')) {
                return 'flashcard';
            }
            if (element.closest('.h5p-image-hotspots, [class*="hotspot"]')) {
                return 'hotspot';
            }
            if (element.matches('[draggable="true"], .h5p-draggable, [class*="draggable"], [class*="drag-item"], [class*="dragitem"]')) {
                return 'draggable item';
            }
            if (element.matches('[role="listbox"], [class*="drop-zone"], [class*="dropzone"], [class*="drop-area"], [class*="droptarget"], .h5p-dropzone') ||
                    element.getAttribute('aria-dropeffect')) {
                return 'drop target';
            }
            if (element.matches('[class*="slide"], [role="group"][aria-roledescription="slide"]') &&
                    element.closest('.carousel, [class*="carousel"], [class*="slider"], [class*="slideshow"], .h5p-image-slider')) {
                return 'slide';
            }
            if (element.matches('[aria-describedby], [data-tooltip]') || element.closest('[class*="point-to-reveal"], [class*="pointtoreveal"], .exe-tooltip, .exe-point-to-reveal')) {
                return 'point-reveal';
            }
            if (element.matches('blockquote, q') || element.closest('blockquote')) { return 'quote'; }
            if (element.matches('h1,h2,h3,h4,h5,h6,[role="heading"]')) { return 'heading'; }
            if (element.matches('img,[role="img"]')) { return 'image'; }
            if (element.matches('figure,figcaption')) { return 'figure'; }
            if (element.matches('audio')) { return 'audio'; }
            if (element.matches('video')) { return 'video'; }
            if (element.matches('table')) { return 'table'; }
            if (element.matches('li')) { return 'list item'; }
            if (element.matches('p')) { return 'paragraph'; }
            if (element.matches('a[href]')) { return 'link'; }
            if (element.matches('button,[role="button"]')) { return 'button'; }
            if (element.matches('input,select,textarea')) { return 'form control'; }
            if (element.matches('[tabindex]')) { return 'content'; }
        } catch (e) {}
        return '';
    }

    function interactiveTypeForElement(element) {
        const type = contentTypeForElement(element);
        return ['tab', 'accordion', 'flashcard', 'hotspot', 'point-reveal', 'draggable item', 'drop target', 'slide'].includes(type) ? type : '';
    }

    function isInteractiveContentType(type) {
        return ['tab', 'accordion', 'flashcard', 'hotspot', 'point-reveal'].includes(type);
    }

    function flashcardFaceText(element) {
        if (!element) { return ''; }
        const card = element.closest('.h5p-flashcards .h5p-flashcard, .h5p-flashcard, [class*="flashcard"], [class*="flip-card"], [class*="flipcard"], .flashcards .flash, .flash');
        if (!card) { return ''; }
        const visibleParts = [];
        card.querySelectorAll('.h5p-flashcard-front, .h5p-flashcard-back, [class*="front"], [class*="back"], [class*="question"], [class*="answer"], :scope > b, :scope > span').forEach(function(part) {
            if (isVisible(part)) {
                const text = cleanText(part.innerText || part.textContent || '');
                if (text) { visibleParts.push(text); }
            }
        });
        if (visibleParts.length) { return visibleParts.join('. '); }
        return cleanText(card.innerText || card.textContent || '');
    }

    function accessibleContentLabel(element, type) {
        if (!element) { return 'Content'; }
        if (type === 'flashcard') {
            const face = flashcardFaceText(element);
            if (face) { return face; }
        }
        if (type === 'image') {
            return cleanText(element.getAttribute('alt') || element.getAttribute('aria-label') || element.getAttribute('title') || 'Image');
        }
        return cleanText(element.getAttribute('aria-label') || element.getAttribute('title') || element.innerText || element.textContent || 'Content');
    }

    function spokenContentLabel(element, type) {
        const label = accessibleContentLabel(element, type);
        let state = '';
        if (element) {
            const expanded = element.getAttribute('aria-expanded');
            const selected = element.getAttribute('aria-selected');
            if (expanded === 'true') { state = ' Expanded.'; }
            else if (expanded === 'false') { state = ' Collapsed.'; }
            else if (selected === 'true') { state = ' Selected.'; }
        }
        const kind = type === 'point-reveal' ? 'interactive reveal' : (type || 'content');
        if (type === 'draggable item') {
            return label + '. Draggable item. Press Space to pick up this item. Then use Tab to move to a drop target and press Enter to drop it.';
        }
        if (type === 'drop target') {
            return label + '. Drop target.' + (keyboardDragItem ? ' Press Enter to drop ' + keyboardDragItemLabel + ' here.' : ' Use Tab to move through the activity.') ;
        }
        if (type === 'slide') {
            return label + '. Slide. Use the Left and Right Arrow keys to move between slides. Press R to read the current slide.';
        }
        if (isInteractiveContentType(type)) {
            return label + '. ' + kind + '.' + state + ' Press Enter or Space to activate. Press R to read this item or its revealed content.';
        }
        return label + '. ' + kind + '. Press R to read this item. Press Tab to continue.';
    }

    function keyboardListeningInstructions() {
        return 'Keyboard listening is now on. Use Tab to move forward through page content and controls. Use Shift plus Tab to move backward. Morska will identify the type of each focused item. Press Enter or Space to activate buttons, accordions, tabs, flashcards, and other controls. Press R to read the focused item or revealed content. For slideshows and image sliders, use the Left and Right Arrow keys to move between slides, Home for the first slide, End for the last slide, and R to read the current slide. For drag and drop activities, focus a draggable item and press Space to pick it up, use Tab to reach a drop target, then press Enter to drop it. Press Escape to cancel a picked up item. In Articulate Rise, press N to move to the next lesson and P to move to the previous lesson when available. Press Escape also stops Morska speech. Press Alt plus Shift plus K at any time to hear these keyboard instructions again.';
    }

    function startKeyboardListening() {
        keyboardListeningEnabled = true;
        const message = keyboardListeningInstructions();
        announce(message);
        if (!('speechSynthesis' in window)) {
            return;
        }
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(configureUtterance(message));
        } catch (e) {}
    }

    function speakGuidance(message, force) {
        if (!keyboardListeningEnabled && !force) {
            return;
        }
        announce(message);
        if (!('speechSynthesis' in window) || !message) {
            return;
        }
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(configureUtterance(message));
        } catch (e) {}
    }

    function resolveFocusedInteractiveContent(trigger, type) {
        if (!trigger) {
            return null;
        }
        const root = trigger.ownerDocument && trigger.ownerDocument.body ? trigger.ownerDocument.body : trigger.parentElement;
        const candidates = [];
        if (isGenericCustomScormDocument(trigger.ownerDocument)) {
            const genericTarget = genericScormInteractionTarget(trigger, type);
            if (genericTarget && genericTarget !== trigger) { candidates.push(genericTarget); }
        }
        try {
            interactionContentCandidates(trigger, root, type).forEach(function(candidate) {
                if (candidate && candidate !== trigger) { candidates.push(candidate); }
            });
        } catch (e) {}
        try {
            const direct = readThroughTarget(trigger, root, type);
            if (direct && direct !== trigger) { candidates.unshift(direct); }
        } catch (e) {}
        try {
            const controlled = controlledElement(trigger, root);
            if (controlled && controlled !== trigger) { candidates.push(controlled); }
        } catch (e) {}
        const seen = new Set();
        const usable = candidates.filter(function(candidate) {
            if (!candidate || seen.has(candidate)) { return false; }
            seen.add(candidate);
            return cleanText(candidate.innerText || candidate.textContent || '').length > 1;
        });
        return usable.length ? usable[0] : null;
    }

    function focusedReadingTarget(trigger, type) {
        if (!trigger) { return null; }
        // After an interaction is activated, keep the exact revealed panel associated with that
        // trigger. Re-resolving on R can select a broad eXeLearning/SCORM wrapper and jump to
        // unrelated page content.
        if (isInteractiveContentType(type) && focusedRevealedTrigger === trigger &&
                focusedRevealedContent && focusedRevealedContent.isConnected) {
            return focusedRevealedContent;
        }
        if (isInteractiveContentType(type)) {
            return resolveFocusedInteractiveContent(trigger, type) || trigger;
        }
        if (type === 'flashcard') {
            return trigger.closest('.h5p-flashcard, [class*="flashcard"], [class*="flip-card"]') || trigger;
        }
        return trigger;
    }

    function readFocusedContent() {
        const trigger = focusedInteractive;
        if (!trigger || !trigger.isConnected) {
            speakGuidance('No content item is currently focused. Press Tab to move through the page content.');
            return;
        }
        const type = focusedInteractiveType || contentTypeForElement(trigger) || 'content';
        const target = type === 'slide' ? currentCarouselSlide(carouselContainerFor(trigger)) || trigger : focusedReadingTarget(trigger, type);
        if (!target) {
            speakGuidance('No readable content was found for this item. Press Tab to continue.');
            return;
        }
        let text = type === 'flashcard' ? flashcardFaceText(trigger) : cleanText(target.innerText || target.textContent || '');
        if (type === 'image') {
            text = accessibleContentLabel(trigger, type);
        }
        if (!text) {
            speakGuidance(isInteractiveContentType(type) ? 'Activate this item with Enter or Space, then press R again.' : 'This item does not currently contain readable text. Press Tab to continue.');
            return;
        }
        window.speechSynthesis.cancel();
        clearHighlight();
        const result = {
            element: target,
            document: target.ownerDocument || document,
            frame: target.ownerDocument && target.ownerDocument.defaultView ? target.ownerDocument.defaultView.frameElement : null,
            context: type || 'content'
        };
        readingQueue = buildReadingQueue(text, result, true);
        const instruction = isInteractiveContentType(type)
            ? 'End of this item. Press Tab to move forward, Shift plus Tab to go back, Enter or Space to activate, or R to read again.'
            : 'End of this item. Press Tab to move forward, Shift plus Tab to go back, or R to read again.';
        readingQueue.push({
            text: instruction,
            node: null, start: 0, end: 0, document: result.document, frame: result.frame, context: result.context
        });
        queueIndex = 0;
        activeInteractionGroup = null;
        updateProgress();
        speakQueue(0);
    }

    function makeReadableContentFocusable(doc) {
        if (!doc || !doc.body) { return; }
        const selector = [
            'h1','h2','h3','h4','h5','h6','[role="heading"]','p','blockquote','q','li','figure','figcaption','img[alt]','[role="img"]','table',
            '.h5p-text','.h5p-advanced-text','.h5p-question-content','.h5p-answer','.h5p-feedback','.h5p-dialogcards-card-content',
            '.h5p-flashcard','.h5p-flashcards [class*="card"]','.flashcards .flash','.flash','[class*="callout"]','[class*="quote"]','.exe-text','.iDevice_content',
            // Articulate Rise/Storyline commonly renders visually distinct learning cards and statements as divs.
            '[class*="card__content"]','[class*="card-content"]','[class*="card_grid"] [class*="card"]',
            '[class*="card-grid"] [class*="card"]','[class*="statement"]','[class*="impact"]',
            '[class*="quote"]','[class*="callout"]','[class*="lesson-header"]','[class*="block-text"]',
            '[draggable="true"]','.h5p-draggable','[class*="draggable"]','[class*="drag-item"]','[class*="dragitem"]',
            '.h5p-dropzone','[class*="drop-zone"]','[class*="dropzone"]','[class*="drop-area"]','[class*="droptarget"]',
            '.h5p-image-slider [class*="slide"]','.carousel [class*="slide"]','[class*="carousel"] [class*="slide"]','[class*="slideshow"] [class*="slide"]'
        ].join(',');
        try {
            doc.querySelectorAll(selector).forEach(function(node) {
                if (!node || node.closest('#morska-widget') || node.closest('[aria-hidden="true"]')) { return; }
                // Treat an H5P draggable as one composite keyboard control. Do not turn its
                // internal label/text nodes into separate Tab stops, otherwise focus leaves
                // the selected draggable and the keyboard drag state becomes confusing.
                const draggableParent = node.closest('.h5p-draggable, [draggable="true"], [class*="drag-item"], [class*="dragitem"]');
                if (draggableParent && draggableParent !== node) { return; }
                if (node.matches('a[href],button,input,select,textarea,[tabindex]')) { return; }
                const text = accessibleContentLabel(node, contentTypeForElement(node));
                if (!text || text.length < 2) { return; }
                node.setAttribute('tabindex', '0');
                node.dataset.morskaKeyboardReadable = '1';
            });
        } catch (e) {}
    }

    function isGenericCustomScormDocument(doc) {
        if (!doc) { return false; }
        if (detectAuthoringTool(doc) !== 'generic-scorm') { return false; }
        try {
            const win = doc.defaultView;
            const frame = win && win.frameElement;
            if (frame) {
                const signature = [frame.id, frame.name, frame.className, frame.getAttribute('src')].filter(Boolean).join(' ').toLowerCase();
                if (/scorm|sco|contentframe|course|launch|player/.test(signature)) { return true; }
                const parentDoc = frame.ownerDocument;
                if (parentDoc && detectContext(parentDoc) === 'scorm') { return true; }
            }
        } catch (e) {}
        try {
            const url = (doc.location && doc.location.href ? doc.location.href : '').toLowerCase();
            if (/scorm|sco|imsmanifest|course|launch/.test(url)) { return true; }
        } catch (e) {}
        return false;
    }

    function genericScormTabTarget(trigger) {
        if (!trigger || !trigger.ownerDocument) { return null; }
        const doc = trigger.ownerDocument;
        try {
            const onclick = trigger.getAttribute('onclick') || '';
            const match = onclick.match(/showTab\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
            if (match && match[1]) {
                const byId = doc.getElementById(match[1]);
                if (byId) { return byId; }
            }
            const tabs = trigger.closest('.tabs, [class*="tabs"]');
            if (tabs) {
                const buttons = Array.from(tabs.querySelectorAll('button,[role="tab"],[role="button"]'));
                const index = buttons.indexOf(trigger);
                const scope = tabs.parentElement || doc.body;
                const panels = Array.from(scope.querySelectorAll(':scope > .tab, :scope > [class*="tab-panel"], :scope > [role="tabpanel"]'));
                if (index >= 0 && panels[index]) { return panels[index]; }
                const active = scope.querySelector('.tab.active, [role="tabpanel"][aria-hidden="false"], [role="tabpanel"].active');
                if (active) { return active; }
            }
        } catch (e) {}
        return null;
    }

    function genericScormInteractionTarget(trigger, type) {
        if (!trigger) { return null; }
        try {
            if (type === 'accordion') {
                const sibling = trigger.nextElementSibling;
                if (sibling && cleanText(sibling.innerText || sibling.textContent || '').length > 1) { return sibling; }
            }
            if (type === 'tab') {
                return genericScormTabTarget(trigger);
            }
            if (type === 'flashcard') {
                return trigger.closest('.flashcards .flash, .flash, [class*="flashcard"], [class*="flip-card"]') || trigger;
            }
        } catch (e) {}
        return null;
    }

    function nativeKeyboardActivates(element) {
        if (!element || !element.matches) { return false; }
        return element.matches('button, summary, input, select, textarea, a[href]');
    }

    function activationTargetForFocused(element, type) {
        if (!element) { return null; }
        if (nativeKeyboardActivates(element)) { return element; }
        try {
            if (element.matches('[role="button"], [role="tab"], [aria-expanded]')) { return element; }
            const descendant = element.querySelector('button, summary, [role="button"], [role="tab"], [aria-expanded]');
            if (descendant) { return descendant; }
            const ancestor = element.closest('button, summary, [role="button"], [role="tab"], [aria-expanded]');
            if (ancestor) { return ancestor; }
            if (type === 'accordion') {
                const container = element.closest('.h5p-panel, .h5p-accordion-panel, .accordion-item, [class*="accordion-item"], [class*="accordion"]');
                if (container) {
                    return container.querySelector('button, summary, [role="button"], [aria-expanded]') || element;
                }
            }
        } catch (e) {}
        return element;
    }

    function activateFocusedInteractiveByKeyboard(event, element, type) {
        if (!element || !isInteractiveContentType(type)) { return false; }
        const activationTarget = activationTargetForFocused(element, type);
        if (!activationTarget) { return false; }

        // Last-resort compatibility path for generic/custom SCORM packages whose controls are wired
        // only to mouse click handlers or inline onclick functions. Prevent the browser's synthetic
        // keyboard click and issue exactly one real click ourselves. Known authoring frameworks never
        // enter this branch, so their native H5P/Rise/Storyline/eXeLearning behaviour is untouched.
        if (isGenericCustomScormDocument(activationTarget.ownerDocument)) {
            if (event.repeat) { return true; }
            event.preventDefault();
            event.stopPropagation();
            try {
                activationTarget.click();
                return true;
            } catch (e) {
                try {
                    activationTarget.dispatchEvent(new activationTarget.ownerDocument.defaultView.MouseEvent('click', {bubbles: true, cancelable: true, view: activationTarget.ownerDocument.defaultView}));
                    return true;
                } catch (ignored) {}
            }
            return false;
        }

        if (nativeKeyboardActivates(activationTarget)) {
            // Let native controls in recognised frameworks keep their browser/library keyboard behaviour.
            return false;
        }
        event.preventDefault();
        event.stopPropagation();
        try {
            activationTarget.click();
            return true;
        } catch (e) {
            try {
                activationTarget.dispatchEvent(new activationTarget.ownerDocument.defaultView.MouseEvent('click', {bubbles: true, cancelable: true}));
                return true;
            } catch (ignored) {}
        }
        return false;
    }

    function isArticulateRiseDocument(doc) {
        if (!doc) { return false; }
        try {
            if (detectAuthoringTool(doc) === 'articulate-rise') { return true; }
        } catch (e) {}
        try {
            const body = doc.body;
            if (body && body.querySelector('[class*="lesson"], [class*="continue"], [data-block-id], .blocks-lesson')) {
                const html = (doc.documentElement && doc.documentElement.innerHTML ? doc.documentElement.innerHTML.slice(0, 120000) : '').toLowerCase();
                return html.indexOf('articulate') !== -1 || html.indexOf('rise.com') !== -1 || html.indexOf('blocks-lesson') !== -1;
            }
        } catch (e) {}
        return false;
    }

    function riseLessonHeading(doc) {
        if (!doc) { return ''; }
        const selectors = [
            'main h1', '[role="main"] h1', '.lesson-header h1', '[class*="lesson-header"] h1',
            'main h2', '[role="main"] h2', '.lesson-header h2', '[class*="lesson-header"] h2'
        ];
        for (let i = 0; i < selectors.length; i++) {
            try {
                const node = doc.querySelector(selectors[i]);
                const text = node ? cleanText(node.innerText || node.textContent || '') : '';
                if (text) { return text; }
            } catch (e) {}
        }
        return '';
    }

    function riseNavigationCandidates(doc, direction) {
        if (!doc) { return []; }
        const selectors = [
            'button', 'a[href]', '[role="button"]',
            '.continue-btn', '[class*="continue"]', '[class*="next"]', '[class*="previous"]', '[class*="prev"]'
        ];
        const all = [];
        const seen = new Set();
        selectors.forEach(function(selector) {
            try {
                doc.querySelectorAll(selector).forEach(function(node) {
                    if (!node || seen.has(node) || !isVisible(node)) { return; }
                    seen.add(node);
                    const label = cleanText([
                        node.getAttribute('aria-label') || '', node.getAttribute('title') || '',
                        node.innerText || '', node.textContent || '', node.className || ''
                    ].join(' ')).toLowerCase();
                    if (!label) { return; }
                    let score = 0;
                    if (direction === 'next') {
                        if (/next\s+lesson|continue\s+to\s+next|next\s+page/.test(label)) { score += 100; }
                        if (/\bnext\b/.test(label)) { score += 70; }
                        if (/\bcontinue\b/.test(label)) { score += 55; }
                        if (/lesson/.test(label)) { score += 15; }
                    } else {
                        if (/previous\s+lesson|previous\s+page/.test(label)) { score += 100; }
                        if (/\bprevious\b/.test(label)) { score += 75; }
                        if (/\bprev\b|\bback\b/.test(label)) { score += 55; }
                        if (/lesson/.test(label)) { score += 15; }
                    }
                    if (score > 0) { all.push({node: node, score: score}); }
                });
            } catch (e) {}
        });
        all.sort(function(a, b) { return b.score - a.score; });
        return all.map(function(item) { return item.node; });
    }

    function announceRiseLessonLoaded(doc, previousHeading) {
        let attempts = 0;
        const check = function() {
            attempts += 1;
            makeReadableContentFocusable(doc);
            const heading = riseLessonHeading(doc);
            if (heading && heading !== previousHeading) {
                speakGuidance('New lesson loaded. ' + heading + '. Press Tab to begin navigating the lesson.');
                return;
            }
            if (attempts < 20) {
                setTimeout(check, 400);
            } else {
                speakGuidance(heading ? 'Lesson ready. ' + heading + '. Press Tab to begin navigating the lesson.' : 'Lesson ready. Press Tab to begin navigating the lesson.');
            }
        };
        setTimeout(check, 350);
    }

    function navigateRiseLesson(doc, direction) {
        if (!keyboardListeningEnabled || !isArticulateRiseDocument(doc)) { return false; }
        const candidates = riseNavigationCandidates(doc, direction);
        if (!candidates.length) {
            speakGuidance(direction === 'next' ? 'No next lesson control was found on this page.' : 'No previous lesson control was found on this page.');
            return true;
        }
        const control = candidates[0];
        const previousHeading = riseLessonHeading(doc);
        speakGuidance(direction === 'next' ? 'Moving to the next lesson.' : 'Moving to the previous lesson.');
        try {
            control.click();
        } catch (e) {
            try {
                control.dispatchEvent(new doc.defaultView.MouseEvent('click', {bubbles: true, cancelable: true, view: doc.defaultView}));
            } catch (ignored) {
                return true;
            }
        }
        announceRiseLessonLoaded(doc, previousHeading);
        return true;
    }


    function carouselContainerFor(element) {
        if (!element || !element.closest) { return null; }
        try {
            return element.closest('.h5p-image-slider, .carousel, [class*="carousel"], [class*="slider"], [class*="slideshow"], [aria-roledescription="carousel"]');
        } catch (e) { return null; }
    }

    function carouselControl(container, direction) {
        if (!container) { return null; }
        const wantNext = direction === 'next';
        const selectors = wantNext ? [
            'button[aria-label*="next" i]', '[role="button"][aria-label*="next" i]', '.h5p-image-slider-next',
            '[class*="next"] button', 'button[class*="next"]', '[class*="arrow-right"]', '[class*="right-arrow"]'
        ] : [
            'button[aria-label*="previous" i]', 'button[aria-label*="prev" i]', '[role="button"][aria-label*="previous" i]',
            '.h5p-image-slider-prev', '[class*="prev"] button', 'button[class*="prev"]', '[class*="arrow-left"]', '[class*="left-arrow"]'
        ];
        for (let i = 0; i < selectors.length; i++) {
            try {
                const found = container.querySelector(selectors[i]);
                if (found && isVisible(found)) { return found; }
            } catch (e) {}
        }
        const buttons = Array.from(container.querySelectorAll('button,[role="button"],a[href]')).filter(isVisible);
        const re = wantNext ? /next|forward|right/i : /previous|prev|back|left/i;
        return buttons.find(function(btn) {
            return re.test(cleanText((btn.getAttribute('aria-label') || '') + ' ' + (btn.getAttribute('title') || '') + ' ' + (btn.innerText || '')));
        }) || null;
    }

    function currentCarouselSlide(container) {
        if (!container) { return null; }
        const selectors = [
            '[aria-roledescription="slide"][aria-hidden="false"]', '[role="group"][aria-hidden="false"]',
            '[class*="slide"][aria-hidden="false"]', '[class*="slide"].active', '[class*="slide"].is-active',
            '[class*="slide"][class*="current"]', '.h5p-image-slider-image[aria-hidden="false"]'
        ];
        for (let i = 0; i < selectors.length; i++) {
            try {
                const node = container.querySelector(selectors[i]);
                if (node && isVisible(node)) { return node; }
            } catch (e) {}
        }
        try {
            return Array.from(container.querySelectorAll('[class*="slide"], [aria-roledescription="slide"], .h5p-image-slider-image')).find(isVisible) || container;
        } catch (e) { return container; }
    }

    function announceCarouselSlide(container) {
        setTimeout(function() {
            const slide = currentCarouselSlide(container);
            if (!slide) { return; }
            focusedInteractive = slide;
            focusedInteractiveType = 'slide';
            const slides = Array.from(container.querySelectorAll('[class*="slide"], [aria-roledescription="slide"], .h5p-image-slider-image')).filter(function(n) {
                return cleanText(n.innerText || n.textContent || n.getAttribute('alt') || '').length > 0;
            });
            const index = slides.indexOf(slide);
            const label = accessibleContentLabel(slide, 'slide') || 'Current slide';
            speakGuidance((index >= 0 && slides.length ? 'Slide ' + (index + 1) + ' of ' + slides.length + '. ' : '') + label + '. Press R to read this slide.');
        }, 220);
    }

    function navigateCarousel(element, key) {
        const container = carouselContainerFor(element);
        if (!container) { return false; }
        let direction = null;
        if (key === 'ArrowRight') { direction = 'next'; }
        if (key === 'ArrowLeft') { direction = 'previous'; }
        if (key === 'Home' || key === 'End') {
            const desired = key === 'Home' ? 'previous' : 'next';
            let control = carouselControl(container, desired);
            if (!control) { return false; }
            for (let i = 0; i < 30 && control && !control.disabled && control.getAttribute('aria-disabled') !== 'true'; i++) {
                try { control.click(); } catch (e) { break; }
                control = carouselControl(container, desired);
            }
            announceCarouselSlide(container);
            return true;
        }
        if (!direction) { return false; }
        const control = carouselControl(container, direction);
        if (!control) { return false; }
        try { control.click(); } catch (e) {
            try { control.dispatchEvent(new control.ownerDocument.defaultView.MouseEvent('click', {bubbles:true,cancelable:true})); } catch (ignored) { return false; }
        }
        announceCarouselSlide(container);
        return true;
    }

    function dragLabel(element) {
        return cleanText((element && (element.getAttribute('aria-label') || element.getAttribute('title') || element.innerText || element.textContent)) || 'item');
    }

    function draggableRoot(element) {
        if (!element || !element.closest) { return null; }
        try {
            return element.closest('.h5p-draggable, [draggable="true"], [class*="drag-item"], [class*="dragitem"], [class*="draggable"]');
        } catch (e) { return null; }
    }

    function isDraggableElement(element) {
        const root = draggableRoot(element);
        return !!root && root === element;
    }

    function isDropTargetElement(element) {
        if (!element || !element.matches) { return false; }
        try { return element.matches('.h5p-dropzone, .h5p-drop-zone, [class*="drop-zone"], [class*="dropzone"], [class*="drop-area"], [class*="droptarget"], [aria-dropeffect]'); } catch (e) { return false; }
    }

    function h5pDragActivityFor(source) {
        if (!source || !source.closest) { return null; }
        try {
            return source.closest('.h5p-dragquestion, .h5p-drag-question, .h5p-drag-text, .h5p-question, .h5p-content, .h5p-container');
        } catch (e) { return null; }
    }

    function restoreKeyboardDropZones() {
        keyboardDragDropZones.forEach(function(entry) {
            const zone = entry && entry.element;
            if (!zone || !zone.setAttribute) { return; }
            if (entry.hadTabindex) {
                zone.setAttribute('tabindex', entry.tabindex);
            } else {
                zone.removeAttribute('tabindex');
            }
            zone.removeAttribute('data-morska-keyboard-dropzone');
        });
        keyboardDragDropZones = [];
    }

    function prepareH5PDropZones(source) {
        restoreKeyboardDropZones();
        if (!source || !source.ownerDocument) { return []; }
        const doc = source.ownerDocument;
        const activity = h5pDragActivityFor(source) || doc.body;
        let zones = [];
        try {
            zones = Array.from(activity.querySelectorAll('.h5p-dropzone, .h5p-drop-zone, [class*="drop-zone"], [class*="dropzone"]'));
        } catch (e) {}
        zones = zones.filter(function(zone) {
            if (!zone || !zone.getBoundingClientRect) { return false; }
            const rect = zone.getBoundingClientRect();
            return rect.width > 1 && rect.height > 1;
        });
        zones.forEach(function(zone) {
            keyboardDragDropZones.push({
                element: zone,
                hadTabindex: zone.hasAttribute('tabindex'),
                tabindex: zone.getAttribute('tabindex')
            });
            zone.setAttribute('tabindex', '0');
            zone.setAttribute('data-morska-keyboard-dropzone', '1');
            if (!zone.getAttribute('aria-label')) {
                const label = cleanText(zone.innerText || zone.textContent || '');
                if (label) { zone.setAttribute('aria-label', 'Drop zone. ' + label); }
                else { zone.setAttribute('aria-label', 'Drop zone'); }
            }
        });
        return zones;
    }

    function clearKeyboardDragSelection() {
        if (keyboardDragItem) {
            keyboardDragItem.removeAttribute('aria-grabbed');
        }
        keyboardDragItem = null;
        keyboardDragItemLabel = '';
        keyboardDragSourceDocument = null;
        restoreKeyboardDropZones();
    }

    function dispatchKeyboardDrop(source, target) {
        if (!source || !target) { return false; }
        const doc = source.ownerDocument;
        const win = doc.defaultView;
        let dataTransfer = null;
        try { dataTransfer = new win.DataTransfer(); } catch (e) {}
        const fire = function(node, type) {
            try {
                let ev;
                if (typeof win.DragEvent === 'function') {
                    ev = new win.DragEvent(type, {bubbles:true,cancelable:true,dataTransfer:dataTransfer});
                } else {
                    ev = new win.Event(type, {bubbles:true,cancelable:true});
                    if (dataTransfer) { Object.defineProperty(ev, 'dataTransfer', {value:dataTransfer}); }
                }
                return node.dispatchEvent(ev);
            } catch (e) { return false; }
        };
        fire(source, 'dragstart');
        fire(target, 'dragenter');
        fire(target, 'dragover');
        fire(target, 'drop');
        fire(source, 'dragend');
        return true;
    }

    function handleKeyboardDragDrop(event, target) {
        if (!keyboardListeningEnabled) { return false; }
        const source = draggableRoot(target);
        if ((event.code === 'Space' || event.key === ' ') && source) {
            event.preventDefault(); event.stopPropagation();
            keyboardDragItem = source;
            keyboardDragItemLabel = dragLabel(source);
            keyboardDragSourceDocument = source.ownerDocument;
            source.setAttribute('aria-grabbed', 'true');
            const zones = prepareH5PDropZones(source);
            if (zones.length) {
                speakGuidance(keyboardDragItemLabel + ' selected. ' + zones.length + ' drop zones are available. Press Tab to move to a drop zone, then press Enter to place the item. Press Escape to cancel.');
            } else {
                speakGuidance(keyboardDragItemLabel + ' picked up. Use Tab to move to a drop target, then press Enter to drop it. Press Escape to cancel.');
            }
            return true;
        }
        if (event.key === 'Enter' && keyboardDragItem && isDropTargetElement(target)) {
            event.preventDefault(); event.stopPropagation();
            const label = keyboardDragItemLabel;
            const targetLabel = dragLabel(target);
            dispatchKeyboardDrop(keyboardDragItem, target);
            clearKeyboardDragSelection();
            speakGuidance(label + ' dropped on ' + targetLabel + '.');
            return true;
        }
        if (event.key === 'Escape' && keyboardDragItem) {
            event.preventDefault(); event.stopPropagation();
            const sourceToRefocus = keyboardDragItem;
            clearKeyboardDragSelection();
            try { sourceToRefocus.focus(); } catch (e) {}
            speakGuidance('Drag and drop cancelled.');
            return true;
        }
        return false;
    }

    function bindUnifiedKeyboardReading(doc) {
        if (!doc || !doc.body || doc.body.dataset.morskaFocusedInteractiveBound === '1') {
            return;
        }
        doc.body.dataset.morskaFocusedInteractiveBound = '1';
        makeReadableContentFocusable(doc);
        doc.addEventListener('keydown', function(event) {
            if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && String(event.key).toLowerCase() === 'k') {
                event.preventDefault();
                event.stopPropagation();
                startKeyboardListening();
            }
        }, true);
        doc.addEventListener('focusin', function(event) {
            let target = event.target;
            if (!target || isEditableTarget(target) || target.closest('#morska-widget')) {
                return;
            }
            const dragRoot = draggableRoot(target);
            if (dragRoot && dragRoot !== target) {
                // Internal H5P draggable labels are presentation content, not separate controls.
                // Redirect accidental focus back to the composite draggable item.
                try { dragRoot.focus(); } catch (e) {}
                return;
            }
            const type = contentTypeForElement(target);
            if (!type) { return; }
            if (focusedInteractive !== target) {
                focusedRevealedContent = null;
                focusedRevealedTrigger = null;
            }
            focusedInteractive = target;
            focusedInteractiveType = type;
            speakGuidance(spokenContentLabel(target, type));
        }, true);
        doc.addEventListener('keydown', function(event) {
            const target = event.target;
            if (isEditableTarget(target)) {
                return;
            }
            if (!event.ctrlKey && !event.altKey && !event.metaKey && keyboardListeningEnabled) {
                if (handleKeyboardDragDrop(event, target)) { return; }
                if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End') && carouselContainerFor(target)) {
                    event.preventDefault();
                    event.stopPropagation();
                    navigateCarousel(target, event.key);
                    return;
                }
            }
            if (!event.ctrlKey && !event.altKey && !event.metaKey && keyboardListeningEnabled && isArticulateRiseDocument(doc)) {
                const navigationKey = String(event.key).toLowerCase();
                if (navigationKey === 'n' || navigationKey === 'p') {
                    event.preventDefault();
                    event.stopPropagation();
                    navigateRiseLesson(doc, navigationKey === 'n' ? 'next' : 'previous');
                    return;
                }
            }
            if (!event.ctrlKey && !event.altKey && !event.metaKey && String(event.key).toLowerCase() === 'r') {
                if (!keyboardListeningEnabled) {
                    return;
                }
                if (focusedInteractive && focusedInteractive.ownerDocument === doc) {
                    event.preventDefault();
                    event.stopPropagation();
                    readFocusedContent();
                }
                return;
            }
            // Some H5P/SCORM accordion headings are focusable wrappers rather than native buttons.
            // Native Enter/Space therefore does nothing unless Morska forwards activation to the real control.
            if (!event.ctrlKey && !event.altKey && !event.metaKey && focusedInteractive &&
                    focusedInteractive.ownerDocument === doc &&
                    (event.key === 'Enter' || event.code === 'Space' || event.key === ' ')) {
                const type = focusedInteractiveType || contentTypeForElement(focusedInteractive);
                activateFocusedInteractiveByKeyboard(event, focusedInteractive, type);
            }
        }, true);
        doc.addEventListener('keyup', function(event) {
            if (!keyboardListeningEnabled || !focusedInteractive || focusedInteractive.ownerDocument !== doc || isEditableTarget(event.target)) {
                return;
            }
            const type = focusedInteractiveType || contentTypeForElement(focusedInteractive);
            if (!isInteractiveContentType(type)) { return; }
            if (event.key === 'Enter' || event.code === 'Space') {
                setTimeout(function() {
                    const target = resolveFocusedInteractiveContent(focusedInteractive, type);
                    const expanded = focusedInteractive.getAttribute('aria-expanded');
                    if (target && cleanText(target.innerText || target.textContent || '').length > 1) {
                        focusedRevealedTrigger = focusedInteractive;
                        focusedRevealedContent = target;
                        const state = expanded === 'true' ? 'Expanded. ' : (type === 'tab' ? 'Section activated. ' : 'Interactive content available. ');
                        speakGuidance(state + 'Press R to read this content.');
                    } else {
                        focusedRevealedTrigger = null;
                        focusedRevealedContent = null;
                        speakGuidance('Item activated. Press R to read the available content.');
                    }
                    makeReadableContentFocusable(doc);
                }, 180);
            }
        }, true);
    }

    function bindFocusedInteractiveReading(doc) {
        bindUnifiedKeyboardReading(doc);
    }

    function visiblePopupNear(trigger, root) {
        const doc = trigger.ownerDocument || document;
        const selectors = [
            '.h5p-image-hotspot-popup', '.h5p-image-hotspot-popup-content', '.h5p-popup',
            '[role="dialog"]', '[class*="hotspot"][class*="popup"]', '[class*="tooltip"]',
            '[class*="popover"]', '[class*="modal"]'
        ];
        const candidates = [];
        selectors.forEach(function(selector) {
            try {
                doc.querySelectorAll(selector).forEach(function(node) {
                    if (isVisible(node) && textLength(node) > 2) {
                        candidates.push(node);
                    }
                });
            } catch (e) {}
        });
        return candidates.length ? candidates[candidates.length - 1] : controlledElement(trigger, root);
    }

    function uniqueElements(elements) {
        const seen = new Set();
        return elements.filter(function(element) {
            if (!element || seen.has(element) || !isVisible(element) || unsafeInteractionControl(element)) {
                return false;
            }
            seen.add(element);
            return true;
        });
    }

    function getSequentialInteractionItems(result) {
        const root = result && result.element;
        if (!root || !root.querySelectorAll) {
            return [];
        }
        const items = [];
        function add(type, selectors) {
            const found = [];
            selectors.forEach(function(selector) {
                try { root.querySelectorAll(selector).forEach(function(el) { found.push(el); }); } catch (e) {}
            });
            uniqueElements(found).forEach(function(trigger, index) {
                items.push({type: type, trigger: trigger, id: type + '-' + items.length + '-' + index});
            });
        }

        add('accordion', [
            'details > summary',
            '.h5p-accordion .h5p-panel-title', '.h5p-accordion .h5p-panel-button', '.h5p-accordion [aria-expanded]',
            '[class*="accordion"] [aria-expanded]', '[class*="accordion"] button', '[class*="accordion"] [role="button"]',
            '.exe-accordion [role="button"]', '.exe-accordion button', '.exe-fx-accordion [role="button"]',
            '.exe-accordion h2 a', '.exe-accordion h3 a', '.exe-fx-accordion h2 a', '.exe-fx-accordion h3 a'
        ]);
        add('tab', [
            '[role="tab"]', '[class*="tabs"] [role="tab"]', '.nav-tabs button', '.nav-tabs a',
            '.exe-tabs [role="tab"]', '.exe-tabs a', '.exe-fx-tabs [role="tab"]', '.exe-fx-tabs a',
            '[class*="tab"] button[aria-controls]', '[class*="tab"] a[aria-controls]'
        ]);
        add('flashcard', [
            '.h5p-flashcards .h5p-answer-button', '.h5p-flashcards button[aria-label*="flip" i]',
            '[class*="flashcard"] button[aria-label*="flip" i]', '[class*="flashcard"] [role="button"]',
            '[class*="flip"] button', '[class*="flip"] [role="button"]',
            '.exe-flip-card button', '.exe-flipcards button', '.exe-fx-flip-card [role="button"]',
            '.exe-flip-card [tabindex]', '.exe-flipcards [tabindex]'
        ]);
        add('point-reveal', [
            '[class*="point-to-reveal"]', '[class*="pointtoreveal"]', '[class*="reveal"] [tabindex]',
            '[data-tooltip]', '[aria-describedby]', '.exe-tooltip', '.exe-fx-tooltip', '.exe-point-to-reveal',
            '[class*="hover"] [tabindex]', '[class*="hotspot"] [tabindex]'
        ]);
        add('hotspot', [
            '.h5p-image-hotspot', '.h5p-image-hotspots button', '[class*="hotspot"] button', '[class*="hotspot"] [role="button"]'
        ]);
        return items;
    }

    function getInteractionState(trigger, type, root) {
        const state = {
            id: 'state-' + (++interactionStateCounter),
            type: type || 'unknown',
            trigger: trigger || null,
            target: null,
            label: '',
            before: {},
            after: {},
            activation: 'unknown',
            status: 'discovered'
        };
        if (!trigger) {
            state.status = 'missing-trigger';
            return state;
        }
        state.label = cleanText(trigger.innerText || trigger.textContent || trigger.getAttribute('aria-label') || trigger.getAttribute('title') || type || 'interactive object');
        state.target = readThroughTarget(trigger, root, type) || controlledElement(trigger, root) || trigger.closest('[role="tabpanel"], .h5p-panel, .h5p-accordion-panel, .accordion-item, [class*="accordion-item"], [class*="flashcard"], [class*="hotspot"]');
        state.before = snapshotInteractionState(trigger, state.target);
        state.activation = interactionActivationMethod(trigger, type);
        return state;
    }

    function interactionActivationMethod(trigger, type) {
        if (!trigger) {
            return 'none';
        }
        if (type === 'point-reveal') {
            return 'focus-hover';
        }
        if (trigger.closest('details')) {
            return 'details-open';
        }
        if (trigger.matches('[role="tab"]') || type === 'tab') {
            return 'tab-activate';
        }
        if (trigger.getAttribute('aria-expanded') !== null) {
            return 'aria-expanded-toggle';
        }
        return 'click';
    }

    function snapshotInteractionState(trigger, target) {
        const snap = {
            triggerConnected: !!(trigger && trigger.isConnected),
            expanded: trigger ? trigger.getAttribute('aria-expanded') : null,
            selected: trigger ? trigger.getAttribute('aria-selected') : null,
            pressed: trigger ? trigger.getAttribute('aria-pressed') : null,
            targetFound: !!target,
            targetVisible: !!(target && isVisible(target)),
            targetTextLength: target ? textLength(target) : 0,
            targetDisplay: target && target.ownerDocument && target.ownerDocument.defaultView ? target.ownerDocument.defaultView.getComputedStyle(target).display : null,
            targetVisibility: target && target.ownerDocument && target.ownerDocument.defaultView ? target.ownerDocument.defaultView.getComputedStyle(target).visibility : null
        };
        return snap;
    }

    function confirmInteractionStateChange(before, after, type) {
        if (!before || !after) {
            return false;
        }
        if (before.expanded !== after.expanded || before.selected !== after.selected || before.pressed !== after.pressed) {
            return true;
        }
        if (before.targetVisible !== after.targetVisible || before.targetTextLength !== after.targetTextLength) {
            return true;
        }
        if (type === 'point-reveal' || type === 'hotspot') {
            return after.targetVisible && after.targetTextLength > 0;
        }
        return false;
    }

    function buildInteractionDiagnosticReport(result) {
        result = result || getCurrentVisibleElement();
        const items = getSequentialInteractionItems(result);
        const report = [];
        items.forEach(function(item, index) {
            const state = getInteractionState(item.trigger, item.type, result && result.element);
            report.push({
                index: index + 1,
                type: state.type,
                label: state.label || '(unlabelled)',
                activation: state.activation,
                triggerTag: item.trigger ? item.trigger.tagName : 'none',
                triggerClass: item.trigger ? String(item.trigger.className || '').slice(0, 120) : '',
                ariaControls: item.trigger ? item.trigger.getAttribute('aria-controls') : null,
                expanded: state.before.expanded,
                selected: state.before.selected,
                targetFound: state.before.targetFound,
                targetVisible: state.before.targetVisible,
                readableChars: state.before.targetTextLength,
                contentPreview: state.target ? cleanText(readThroughText(state.target, item.trigger)).slice(0, 220) : '',
                context: result && result.context ? result.context : 'page'
            });
        });
        interactionDiagnostics = report;
        return report;
    }

    function formatInteractionDiagnostics(report) {
        if (!report || !report.length) {
            return 'No supported interactive objects were detected on the current screen.';
        }
        const lines = [];
        lines.push('Morska Interaction Diagnostics');
        lines.push('Objects detected: ' + report.length);
        lines.push('');
        report.forEach(function(item) {
            lines.push('#' + item.index + ' ' + item.type.toUpperCase() + ' — ' + item.label);
            lines.push('  Activation: ' + item.activation);
            lines.push('  Trigger: ' + item.triggerTag + (item.triggerClass ? ' .' + item.triggerClass.replace(/\s+/g, '.') : ''));
            lines.push('  aria-controls: ' + (item.ariaControls || 'none'));
            lines.push('  expanded: ' + (item.expanded === null ? 'n/a' : item.expanded));
            lines.push('  selected: ' + (item.selected === null ? 'n/a' : item.selected));
            lines.push('  target found: ' + (item.targetFound ? 'yes' : 'no'));
            lines.push('  target visible: ' + (item.targetVisible ? 'yes' : 'no'));
            lines.push('  readable characters: ' + item.readableChars);
            lines.push('  content preview: ' + (item.contentPreview || 'none'));
            lines.push('');
        });
        return lines.join('\n');
    }

    function runInteractionDiagnostics() {
        const result = getCurrentVisibleElement();
        const report = buildInteractionDiagnosticReport(result);
        const output = qs('morska-interaction-diagnostics-output');
        if (output) {
            output.textContent = formatInteractionDiagnostics(report);
        }
        announce(report.length + ' interactive object' + (report.length === 1 ? '' : 's') + ' detected. Diagnostic report updated.');
        return report;
    }

    function interactionLabel(item) {
        const trigger = item && item.trigger;
        if (!trigger) {
            return item ? item.type : 'interactive object';
        }
        return cleanText(trigger.innerText || trigger.textContent || trigger.getAttribute('aria-label') || trigger.getAttribute('title') || item.type);
    }

    function activatePointReveal(trigger) {
        if (!trigger) {
            return false;
        }
        const win = trigger.ownerDocument.defaultView;
        try {
            trigger.focus({preventScroll: true});
        } catch (e) {
            try { trigger.focus(); } catch (ignored) {}
        }
        ['pointerenter', 'mouseenter', 'mouseover', 'focusin'].forEach(function(type) {
            try {
                const EventCtor = type.indexOf('mouse') !== -1 || type.indexOf('pointer') !== -1 ? win.MouseEvent : win.FocusEvent;
                trigger.dispatchEvent(new EventCtor(type, {bubbles: true, cancelable: true, view: win}));
            } catch (e) {}
        });
        return true;
    }

    function activateInteractionItem(item) {
        const trigger = item && item.trigger;
        if (!trigger || !trigger.isConnected || unsafeInteractionControl(trigger)) {
            return false;
        }
        if (item.type === 'accordion') {
            const details = trigger.closest('details');
            if (details) {
                details.open = true;
                return true;
            }
            if (trigger.getAttribute('aria-expanded') !== 'true') {
                return safeClick(trigger) || fireActivationEvents(trigger);
            }
            return true;
        }
        if (item.type === 'tab') {
            if (trigger.getAttribute('aria-selected') !== 'true') {
                return safeClick(trigger) || fireActivationEvents(trigger);
            }
            return true;
        }
        if (item.type === 'point-reveal') {
            return activatePointReveal(trigger);
        }
        return safeClick(trigger) || fireActivationEvents(trigger);
    }

    function buildFocusDrivenInteractionQueue(result) {
        return getSequentialInteractionItems(result).map(function(item) {
            return {
                text: interactionLabel(item),
                node: null,
                start: 0,
                end: 0,
                document: result.document || document,
                frame: result.frame || null,
                context: result.context || 'page',
                interactionMarker: true,
                interactionGroup: item.id,
                interactionType: item.type,
                interactionTrigger: item.trigger,
                interactionRoot: result.element,
                interactionResult: result
            };
        });
    }

    function interactionUnitsFromElement(element, result, group) {
        if (!element) {
            return [];
        }
        const localResult = {
            element: element,
            document: element.ownerDocument || result.document || document,
            frame: result.frame || null,
            context: result.context || 'page'
        };
        const units = buildDomReadingQueue(localResult);
        return units.map(function(unit, index) {
            unit.interactionGroup = group.id;
            unit.interactionType = group.type;
            unit.interactionTrigger = group.trigger;
            unit.interactionTarget = element;
            unit.activateInteraction = group.activate;
            unit.interactionFirst = index === 0;
            return unit;
        });
    }

    function targetForInteraction(item, result) {
        const trigger = item.interactionTrigger;
        if (!trigger) {
            return null;
        }
        if (item.interactionType === 'hotspot' || item.interactionType === 'point-reveal') {
            return visiblePopupNear(trigger, result.element);
        }
        return controlledElement(trigger, result.element);
    }


    /**
     * Resolve content associated with an interactive trigger without requiring the visual
     * interaction to be activated. This is the preferred accessibility path for accordions,
     * tabs, flashcards and point-to-reveal objects whose inactive content already exists in
     * the DOM but is hidden with CSS or ARIA state.
     *
     * @param {HTMLElement} trigger Interactive control.
     * @param {HTMLElement} root Current readable root.
     * @param {String} type Interaction type.
     * @returns {HTMLElement|null}
     */
    function textRichness(element) {
        if (!element) {
            return 0;
        }
        const text = cleanText(element.textContent || '');
        return text.length;
    }

    function interactionContentCandidates(trigger, root, type) {
        const doc = trigger.ownerDocument || document;
        const candidates = [];
        const add = function(element, score) {
            if (!element || element === trigger || candidates.some(function(item) { return item.element === element; })) {
                return;
            }
            candidates.push({element: element, score: score + Math.min(400, textRichness(element))});
        };

        // Explicit ARIA/ID relationships are strongest.
        ['aria-controls', 'aria-describedby', 'data-target', 'data-bs-target', 'href'].forEach(function(attribute) {
            const value = trigger.getAttribute(attribute);
            if (!value) {
                return;
            }
            value.split(/\s+/).forEach(function(token) {
                const id = token.replace(/^#/, '');
                if (!id) {
                    return;
                }
                try { add(doc.getElementById(id), 1000); } catch (e) {}
            });
        });

        // H5P accordion/panel patterns.
        const accordionItem = trigger.closest('.h5p-panel, .h5p-accordion-panel, .h5p-accordion-item, .accordion-item, [class*="accordion-item"], details');
        if (accordionItem) {
            accordionItem.querySelectorAll('.h5p-panel-content, .accordion-body, .collapse, [role="region"], [class*="panel-content"], [class*="accordion-content"], [class*="content"], [class*="body"]').forEach(function(el) {
                if (!el.contains(trigger)) { add(el, 850); }
            });
            add(accordionItem, 500);
        }

        // Tab panels: pair by aria-controls first, then by position within the nearest component.
        if (type === 'tab') {
            const component = trigger.closest('[role="tablist"], .nav-tabs, [class*="tabs"], [class*="tabs-container"]');
            const scope = component ? (component.parentElement || root || doc.body) : (root || doc.body);
            if (component) {
                const tabs = Array.from(component.querySelectorAll('[role="tab"], a[aria-controls], button[aria-controls], a[href^="#"], button[data-target], [class*="tab"]'));
                const index = tabs.indexOf(trigger);
                const panels = Array.from(scope.querySelectorAll('[role="tabpanel"], .tab-pane, [class*="tab-panel"], [class*="tabpanel"], [class*="tabs-content"] > *'));
                if (index >= 0 && panels[index]) { add(panels[index], 800); }
            }
        }

        // Flashcard/flip-card: collect both faces, including hidden back faces.
        if (type === 'flashcard') {
            const card = trigger.closest('[class*="flashcard"], [class*="flip-card"], [class*="flipcard"], [class*="card"]');
            if (card) {
                card.querySelectorAll('[class*="front"], [class*="back"], [class*="question"], [class*="answer"], [class*="content"]').forEach(function(el) { add(el, 780); });
                add(card, 550);
            }
        }

        // Hotspot / point-to-reveal content often lives in a sibling, tooltip or hidden popup.
        if (type === 'point-reveal' || type === 'hotspot') {
            const wrapper = trigger.closest('[class*="point-to-reveal"], [class*="pointtoreveal"], [class*="hotspot"], [class*="tooltip"], [class*="reveal"], [class*="labeled"]');
            if (wrapper) {
                wrapper.querySelectorAll('[role="tooltip"], [role="dialog"], [class*="tooltip"], [class*="popup"], [class*="reveal-content"], [class*="description"], [class*="content"], [class*="label"]').forEach(function(el) {
                    if (!el.contains(trigger)) { add(el, 820); }
                });
            }
        }

        // Nearby siblings are useful for eXeLearning and simple SCORM authoring tools.
        // Search from both the trigger and its heading/wrapper because many accordion implementations
        // place the content beside the heading container rather than directly beside the button/link.
        let sibling = trigger.nextElementSibling;
        for (let i = 0; sibling && i < 4; i++, sibling = sibling.nextElementSibling) {
            add(sibling, 430 - (i * 30));
        }

        let wrapper = trigger.parentElement;
        for (let level = 0; wrapper && level < 4; level++, wrapper = wrapper.parentElement) {
            let wrapperSibling = wrapper.nextElementSibling;
            for (let i = 0; wrapperSibling && i < 3; i++, wrapperSibling = wrapperSibling.nextElementSibling) {
                add(wrapperSibling, 650 - (level * 70) - (i * 30));
            }
        }

        // Positional accordion pairing. This covers authoring tools that expose a list of headings
        // and a parallel list of hidden panels without aria-controls relationships.
        if (type === 'accordion') {
            const accordion = trigger.closest('.h5p-accordion, .exe-accordion, .exe-fx-accordion, [class*="accordion"]');
            if (accordion) {
                const triggers = Array.from(accordion.querySelectorAll(
                    'details > summary, .h5p-panel-title, .h5p-panel-button, [aria-expanded], button, [role="button"], h2 a, h3 a'
                )).filter(function(el, index, list) { return list.indexOf(el) === index; });
                const triggerIndex = triggers.indexOf(trigger);
                const panels = Array.from(accordion.querySelectorAll(
                    '.h5p-panel-content, .accordion-body, .collapse, [role="region"], [class*="panel-content"], [class*="accordion-content"], [class*="content"]'
                )).filter(function(el) { return !el.contains(trigger) && textRichness(el) > 1; });
                if (triggerIndex >= 0 && panels[triggerIndex]) {
                    add(panels[triggerIndex], 900);
                }
            }
        }

        // Component-local hidden/aria-hidden regions. We deliberately inspect hidden nodes because
        // read-through is intended to expose inaccessible content without changing the visual state.
        const localRoot = trigger.closest('.h5p-content, .h5p-container, .h5p-interactive-book, .rise-block, [class*="block"], [class*="component"], section, article') || root || doc.body;
        try {
            localRoot.querySelectorAll('[hidden], [aria-hidden="true"], [role="region"], [role="tabpanel"], .collapse, [class*="panel-content"], [class*="accordion-content"], [class*="tab-panel"], [class*="card-back"], [class*="answer"], [class*="reveal-content"]').forEach(function(el) {
                if (!el.contains(trigger) && textRichness(el) > 1) { add(el, 250); }
            });
        } catch (e) {}

        return candidates.sort(function(a, b) { return b.score - a.score; });
    }

    function readThroughTarget(trigger, root, type) {
        if (!trigger) {
            return null;
        }
        const doc = trigger.ownerDocument || document;

        // v3.3.13 DOM mapper: score all plausible associated content regions before falling back
        // to older selector-specific logic. This is intentionally non-destructive.
        const mappedCandidates = interactionContentCandidates(trigger, root, type);
        if (mappedCandidates.length && mappedCandidates[0].element) {
            return mappedCandidates[0].element;
        }

        const ids = [];

        ['aria-controls', 'aria-describedby'].forEach(function(attribute) {
            const value = trigger.getAttribute(attribute);
            if (value) {
                value.split(/\s+/).forEach(function(id) {
                    if (id && ids.indexOf(id) === -1) {
                        ids.push(id);
                    }
                });
            }
        });

        const dataTarget = trigger.getAttribute('data-target') || trigger.getAttribute('data-bs-target');
        if (dataTarget && dataTarget.charAt(0) === '#') {
            ids.push(dataTarget.substring(1));
        }
        const href = trigger.getAttribute('href');
        if (href && href.charAt(0) === '#') {
            ids.push(href.substring(1));
        }

        for (let i = 0; i < ids.length; i++) {
            try {
                const target = doc.getElementById(ids[i]);
                if (target && target !== trigger) {
                    return target;
                }
            } catch (e) {}
        }

        if (type === 'tab') {
            const tablist = trigger.closest('[role="tablist"], .nav-tabs, [class*="tabs"]');
            if (tablist) {
                const tabs = Array.from(tablist.querySelectorAll('[role="tab"], a[aria-controls], button[aria-controls], a[href^="#"], button[data-target]'));
                const index = tabs.indexOf(trigger);
                const scope = tablist.parentElement || root || doc.body;
                const panels = Array.from(scope.querySelectorAll('[role="tabpanel"], .tab-pane, [class*="tab-panel"], [class*="tabpanel"]'));
                if (index >= 0 && panels[index]) {
                    return panels[index];
                }
            }
        }

        if (type === 'accordion') {
            const panel = trigger.closest('.h5p-panel, .h5p-accordion-panel, .accordion-item, [class*="accordion-item"], details');
            if (panel) {
                const content = panel.querySelector('.h5p-panel-content, .accordion-body, .collapse, [role="region"], [class*="panel-content"], [class*="accordion-content"], [class*="content"], [class*="body"]');
                if (content) {
                    return content;
                }
                if (panel.tagName === 'DETAILS') {
                    return panel;
                }
            }
        }

        if (type === 'flashcard') {
            const card = trigger.closest('[class*="flashcard"], [class*="flip-card"], [class*="flipcard"], [class*="card"]');
            if (card) {
                return card;
            }
        }

        if (type === 'point-reveal' || type === 'hotspot') {
            const describedBy = trigger.getAttribute('aria-describedby');
            if (describedBy) {
                const described = doc.getElementById(describedBy.split(/\s+/)[0]);
                if (described) {
                    return described;
                }
            }
            const wrapper = trigger.closest('[class*="point-to-reveal"], [class*="pointtoreveal"], [class*="hotspot"], [class*="tooltip"], [class*="reveal"]');
            if (wrapper) {
                const content = wrapper.querySelector('[role="tooltip"], [role="dialog"], [class*="tooltip"], [class*="popup"], [class*="reveal-content"], [class*="description"], [class*="content"]');
                if (content) {
                    return content;
                }
            }
        }

        // Unlike controlledElement(), do not skip hidden siblings. Hidden content is precisely
        // what the read-through engine is designed to expose to speech without changing UI state.
        let sibling = trigger.nextElementSibling;
        if (sibling) {
            return sibling;
        }
        return controlledElement(trigger, root);
    }

    function readThroughText(target, trigger) {
        if (!target) {
            return '';
        }
        let clone;
        try {
            clone = target.cloneNode(true);
        } catch (e) {
            return cleanText(target.textContent || '');
        }
        try {
            clone.querySelectorAll('script, style, noscript, nav, [role="navigation"], .morska-reading-highlight, .morska-interaction-focus').forEach(function(node) {
                node.remove();
            });
            clone.querySelectorAll('button, [role="button"], a').forEach(function(node) {
                const label = cleanText(node.textContent || node.getAttribute('aria-label') || node.getAttribute('title') || '');
                if (/^(next|previous|submit|summary|results|exit|finish|continue|flip|show answer|hide answer)$/i.test(label)) {
                    node.remove();
                }
            });
        } catch (e) {}

        let text = cleanText(clone.textContent || '');
        const label = interactionLabel({trigger: trigger, type: 'interactive object'});
        if (label && text.toLowerCase().indexOf(label.toLowerCase()) === 0) {
            text = cleanText(text.substring(label.length));
        }
        return text;
    }

    function readThroughUnits(marker, result) {
        const trigger = marker.interactionTrigger;
        const target = readThroughTarget(trigger, result.element, marker.interactionType);
        if (!target) {
            return [];
        }
        const contentText = readThroughText(target, trigger);
        if (!contentText || contentText.length < 2) {
            return [];
        }

        const units = [];
        const label = interactionLabel(marker);
        if (label) {
            units.push({
                text: label,
                node: trigger,
                start: 0,
                end: 0,
                document: trigger.ownerDocument || result.document || document,
                frame: result.frame || null,
                context: result.context || 'page',
                interactionGroup: marker.interactionGroup,
                interactionType: marker.interactionType,
                interactionTrigger: trigger,
                interactionTarget: target,
                readThrough: true,
                interactionFirst: true
            });
        }

        splitIntoSentences(contentText).forEach(function(sentence) {
            if (cleanText(sentence).length < 2) {
                return;
            }
            units.push({
                text: sentence,
                // Hidden content cannot be visually highlighted reliably. Keep the corresponding
                // heading/trigger highlighted while its hidden content is being spoken.
                node: trigger,
                start: 0,
                end: 0,
                document: trigger.ownerDocument || result.document || document,
                frame: result.frame || null,
                context: result.context || 'page',
                interactionGroup: marker.interactionGroup,
                interactionType: marker.interactionType,
                interactionTrigger: trigger,
                interactionTarget: target,
                readThrough: true,
                interactionFirst: false
            });
        });

        return units;
    }

    function unitsForActivatedInteraction(marker, result) {
        const target = targetForInteraction(marker, result);
        if (!target) {
            return [];
        }
        const group = {
            id: marker.interactionGroup,
            type: marker.interactionType,
            trigger: marker.interactionTrigger,
            activate: function() { return activateInteractionItem(marker); }
        };
        let units = interactionUnitsFromElement(target, result, group);
        if (!units.length) {
            const text = cleanText(target.innerText || target.textContent || '');
            units = splitIntoSentences(text).map(function(sentence, index) {
                return {
                    text: sentence,
                    node: null,
                    start: 0,
                    end: 0,
                    document: result.document || document,
                    frame: result.frame || null,
                    context: result.context || 'page',
                    interactionGroup: group.id,
                    interactionType: group.type,
                    interactionTrigger: group.trigger,
                    interactionTarget: target,
                    activateInteraction: group.activate,
                    interactionFirst: index === 0
                };
            });
        }
        return units.filter(function(unit) {
            return cleanText(unit.text || '').length > 1;
        });
    }

    async function activateMarkerAndInject(marker, index) {
        const result = marker.interactionResult || getCurrentVisibleElement();
        const trigger = marker.interactionTrigger;
        if (!trigger || !trigger.isConnected) {
            readingQueue.splice(index, 1);
            updateProgress();
            speakQueue(index);
            return;
        }

        // Move the visible focus to the interactive control before opening it. This makes the
        // interaction understandable for low-vision users and keeps SCORM/H5P content in view.
        try {
            trigger.classList.add('morska-interaction-focus');
            scrollElementToSafeZone(trigger, trigger.ownerDocument.defaultView || window);
            const frame = marker.frame;
            if (frame && frame.ownerDocument === document) {
                scrollElementToSafeZone(frame, window);
            }
        } catch (e) {}

        const diagnosticState = getInteractionState(trigger, marker.interactionType, result.element);

        // Level 1: DOM read-through. Prefer reading associated inactive/hidden content without
        // changing the learning object's visual state. This is significantly more reliable for
        // stateful tab sets, accordions and cards where only one item may be active at a time.
        let units = readThroughUnits(marker, result);
        if (units.length) {
            diagnosticState.after = snapshotInteractionState(trigger, readThroughTarget(trigger, result.element, marker.interactionType));
            diagnosticState.status = 'read-through-success';
            interactionDiagnostics.push({
                index: interactionDiagnostics.length + 1,
                type: diagnosticState.type,
                label: diagnosticState.label,
                activation: 'dom-read-through',
                status: diagnosticState.status,
                targetFound: diagnosticState.after.targetFound,
                targetVisible: diagnosticState.after.targetVisible,
                readableChars: diagnosticState.after.targetTextLength
            });
            try { trigger.classList.remove('morska-interaction-focus'); } catch (e) {}
            readingQueue.splice.apply(readingQueue, [index, 1].concat(units));
            activeInteractionGroup = marker.interactionGroup;
            updateProgress();
            speakQueue(index);
            return;
        }

        // Level 2: controlled activation. Use this only when the content is genuinely not present
        // in the DOM until the learning object is activated (for example some hotspots/popups).
        const activated = activateInteractionItem(marker);
        await waitForInteraction(marker.interactionType === 'hotspot' || marker.interactionType === 'point-reveal' ? 550 : 400);
        diagnosticState.after = snapshotInteractionState(trigger, targetForInteraction(marker, result));
        diagnosticState.status = activated ? (confirmInteractionStateChange(diagnosticState.before, diagnosticState.after, marker.interactionType) ? 'activation-fallback-success' : 'activated-no-confirmed-change') : 'activation-failed';
        interactionDiagnostics.push({
            index: interactionDiagnostics.length + 1,
            type: diagnosticState.type,
            label: diagnosticState.label,
            activation: diagnosticState.activation,
            status: diagnosticState.status,
            targetFound: diagnosticState.after.targetFound,
            targetVisible: diagnosticState.after.targetVisible,
            readableChars: diagnosticState.after.targetTextLength
        });

        units = unitsForActivatedInteraction(marker, result);
        try { trigger.classList.remove('morska-interaction-focus'); } catch (e) {}

        if (units.length) {
            readingQueue.splice.apply(readingQueue, [index, 1].concat(units));
            activeInteractionGroup = marker.interactionGroup;
            updateProgress();
            speakQueue(index);
        } else {
            // Level 3 placeholder: if the package exposes neither DOM content nor readable content
            // after controlled activation, skip safely. A future Accessible Mirror adapter can
            // synthesize a separate representation for proprietary/canvas-based objects.
            readingQueue.splice(index, 1);
            updateProgress();
            speakQueue(index);
        }
    }

    async function prepareInteractiveContent(result) {
        result = result || getCurrentVisibleElement();
        const mode = qs('morska-interaction-mode')?.value || 'assisted';
        const enabled = qs('morska-auto-interact')?.checked !== false;
        if (!enabled || mode === 'passive' || !result || !result.element) {
            preparedInteractionQueue = [];
            return result;
        }

        // Preparation is discovery-only. The read-through engine first attempts to extract
        // associated hidden/inactive content without changing the visual state. Only objects whose
        // content is not present in the DOM fall back to controlled activation during reading.
        preparedInteractionQueue = buildFocusDrivenInteractionQueue(result);
        preparedInteractionSignature = signatureForReadable().signature;
        activeInteractionGroup = null;

        if (preparedInteractionQueue.length) {
            announce('Interactive reading sequence prepared with ' + preparedInteractionQueue.length + ' interactive object' +
                (preparedInteractionQueue.length === 1 ? '' : 's') + '. Press Play to read hidden content where available, with controlled activation only when necessary.');
        } else {
            announce('No supported interactive reading objects were detected on the current screen.');
        }
        return result;
    }

    function collectRiseReadableText(doc) {
        if (!doc || !doc.querySelectorAll) {
            return '';
        }
        const selectors = [
            '.lesson-header', '.lesson-content', '.blocks-lesson',
            '[data-block-id]', '.block-wrapper', '.block',
            '[class*="accordion"]', '[class*="flashcard"]',
            '[class*="labeled-graphic"]', '[class*="timeline"]',
            '[class*="process"]', '[class*="tabs"]'
        ];
        const seen = new Set();
        const parts = [];
        selectors.forEach(function(selector) {
            try {
                doc.querySelectorAll(selector).forEach(function(node) {
                    if (!isVisible(node)) {
                        return;
                    }
                    const clone = node.cloneNode(true);
                    clone.querySelectorAll('nav, header[role="banner"], footer, script, style, noscript, button, [role="navigation"], [aria-hidden="true"], .sidebar, .menu, .progress, .continue-btn').forEach(function(remove) {
                        remove.remove();
                    });
                    const text = cleanText(clone.innerText || clone.textContent || '');
                    if (text.length < 2 || seen.has(text)) {
                        return;
                    }
                    seen.add(text);
                    parts.push(text);
                });
            } catch (e) {}
        });
        return cleanText(parts.join(' '));
    }

    function collectInteractiveText(result) {
        result = result || getCurrentVisibleElement();
        if (!result || !result.element) {
            return '';
        }
        const normalText = result.authoringTool === 'articulate-rise' ?
            collectRiseReadableText(result.document) : cleanText(result.element.innerText || '');
        const interactiveText = describeInteractiveContent(result.element, result.context);
        if (interactiveText && interactiveText.length > normalText.length) {
            return interactiveText;
        }
        if (interactiveText && normalText.indexOf(interactiveText.substring(0, 30)) === -1) {
            return cleanText(normalText + ' ' + interactiveText);
        }
        return normalText;
    }

    function getSelectedText() {
        let text = '';
        try {
            text = window.getSelection().toString().trim();
        } catch (e) {}
        if (text) {
            cachedSelectedText = cleanText(text);
            return cachedSelectedText;
        }
        const frames = document.querySelectorAll('iframe, frame');
        for (const frame of frames) {
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                text = getSelectionFromDocument(doc);
                if (text) {
                    cachedSelectedText = cleanText(text);
                    return cachedSelectedText;
                }
                const nested = getNestedFrameDocuments(doc, 0);
                for (const item of nested) {
                    text = getSelectionFromDocument(item.document);
                    if (text) {
                        cachedSelectedText = cleanText(text);
                        return cachedSelectedText;
                    }
                }
            } catch (e) {
                // Cross-origin frame. Browser security blocks access.
            }
        }
        return cachedSelectedText;
    }

    function rememberSelectedText() {
        const selected = getSelectedText();
        if (selected) {
            cachedSelectedText = selected;
        }
    }

    function isVisible(element) {
        if (!element) {
            return false;
        }
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }

    function cleanText(text) {
        return (text || '')
            .replace(/Skip to Morska Accessibility Reader/gi, '')
            .replace(/Morska Accessibility Reader/gi, '')
            .replace(/Morska Accessibility Suite/gi, '')
            .replace(/Alt \+ Shift \+ M[^\n]*/gi, '')
            .replace(/Ctrl \+ Shift[^\n]*/gi, '')
            .replace(/©\s*KTC[^\n]*/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function textLength(element) {
        return cleanText(element ? element.innerText : '').length;
    }

    function bestVisibleElement(doc, selectors) {
        let best = null;
        let bestScore = 0;
        selectors.forEach(function(selector) {
            doc.querySelectorAll(selector).forEach(function(node) {
                if (!isVisible(node)) {
                    return;
                }
                const score = textLength(node);
                if (score > bestScore) {
                    best = node;
                    bestScore = score;
                }
            });
        });
        return best;
    }

    function detectContext(doc) {
        const bodyClasses = doc.body ? Array.from(doc.body.classList).join(' ') : '';
        const url = doc.location ? doc.location.href : window.location.href;
        const has = function(selector) { return !!doc.querySelector(selector); };

        if (has('.h5p-content, .h5p-container, .h5p-interactive-book, .h5p-course-presentation')) {
            return 'h5p';
        }
        if (/mod\/hvp|mod\/h5pactivity/.test(url) || /\bpath-mod-hvp\b|\bpath-mod-h5pactivity\b/.test(bodyClasses)) {
            return 'h5p';
        }
        if (has('#scorm_object, #contentframe, iframe#scorm_object, iframe#contentframe') || /mod\/scorm/.test(url) || /\bpath-mod-scorm\b/.test(bodyClasses)) {
            return 'scorm';
        }
        if (/\bpath-mod-book\b/.test(bodyClasses) || has('.book_content, .book_content_numbered')) {
            return 'book';
        }
        if (/\bpath-mod-page\b/.test(bodyClasses) || has('.page-content')) {
            return 'page';
        }
        if (/\bpath-mod-lesson\b/.test(bodyClasses) || has('.lesson-content, .lessonbutton, .contents')) {
            return 'lesson';
        }
        if (/\bpath-mod-quiz\b/.test(bodyClasses) || has('.que, .quizattempt')) {
            return 'quiz';
        }
        if (/\bpath-mod-forum\b/.test(bodyClasses) || has('.forumpost, .discussion-list')) {
            return 'forum';
        }
        if (/\bpath-mod-assign\b/.test(bodyClasses) || has('.activity-description, .submissionstatustable')) {
            return 'assignment';
        }
        if (has('.course-content')) {
            return 'course';
        }
        return 'page';
    }

    function getReadableElementForContext(doc, context) {
        const map = {
            h5p: [
                '.h5p-interactive-book-current-page', '.h5p-current', '.h5p-show', '.h5p-slide.h5p-current',
                '.h5p-course-presentation .h5p-slide[aria-hidden="false"]', '.h5p-interactive-book', '.h5p-content', '.h5p-container'
            ],
            scorm: ['#scorm_object', '#contentframe', '.scoframe', '#region-main', 'main'],
            book: ['.book_content', '.book_content_numbered', '#region-main', 'main'],
            page: ['.activity-description', '.page-content', '#region-main', 'main'],
            lesson: ['.lesson-content', '.contents', '#region-main', 'main'],
            quiz: ['.que', '.quizattempt', '#region-main', 'main'],
            forum: ['.forumpost', '.discussion-list', '#region-main', 'main'],
            assignment: ['.activity-description', '.submissionstatustable', '#region-main', 'main'],
            course: ['.course-content', '#region-main', 'main']
        };
        return bestVisibleElement(doc, map[context] || ['#region-main', 'main', 'body']);
    }

    function isScormFrame(frame) {
        const id = (frame.id || '').toLowerCase();
        const name = (frame.name || '').toLowerCase();
        const src = (frame.getAttribute('src') || '').toLowerCase();
        return id.indexOf('scorm') !== -1 || id.indexOf('contentframe') !== -1 ||
            name.indexOf('scorm') !== -1 || name.indexOf('contentframe') !== -1 ||
            src.indexOf('scorm') !== -1 || src.indexOf('sco') !== -1;
    }

    function isH5PFrame(frame) {
        const id = (frame.id || '').toLowerCase();
        const name = (frame.name || '').toLowerCase();
        const src = (frame.getAttribute('src') || '').toLowerCase();
        const cls = (frame.className || '').toString().toLowerCase();
        return id.indexOf('h5p') !== -1 || name.indexOf('h5p') !== -1 ||
            cls.indexOf('h5p') !== -1 || src.indexOf('h5p') !== -1 || src.indexOf('hvp') !== -1;
    }

    function getFrameReadableElement(frame, doc, fallbackContext) {
        let context = fallbackContext || detectContext(doc);
        const authoringTool = detectAuthoringTool(doc);
        if (isScormFrame(frame)) {
            context = 'scorm';
        } else if (isH5PFrame(frame)) {
            context = 'h5p';
        }

        let element = authoringTool === 'articulate-rise' ? getRiseReadableElement(doc) : getReadableElementForContext(doc, context);
        if (!element || textLength(element) < 20) {
            element = bestVisibleElement(doc, [
                '.h5p-interactive-book-current-page', '.h5p-current', '.h5p-show',
                '.h5p-slide[aria-hidden="false"]', '.h5p-content', '.h5p-container',
                '#page', '#main', '#content', 'main', 'article', 'section', 'body'
            ]);
        }
        if ((!element || textLength(element) < 20) && doc.body) {
            element = doc.body;
        }
        return {context: context, element: element, document: doc, frame: frame, authoringTool: authoringTool};
    }

    function getCurrentVisibleElement() {
        const context = detectContext(document);

        // First inspect known H5P/SCORM iframes because their readable content is usually inside the frame.
        const frames = Array.from(document.querySelectorAll('iframe'));
        for (const frame of frames) {
            if (!isH5PFrame(frame) && !isScormFrame(frame)) {
                continue;
            }
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                const nested = getNestedFrameDocuments(doc, 0).reverse();
                for (const item of nested) {
                    const nestedResult = getFrameReadableElement(item.frame, item.document, 'scorm');
                    if (nestedResult.authoringTool === 'articulate-rise' && nestedResult.element && textLength(nestedResult.element) > 20) {
                        nestedResult.frame = frame;
                        return nestedResult;
                    }
                }
                const frameResult = getFrameReadableElement(frame, doc);
                if (frameResult.element && textLength(frameResult.element) > 20) {
                    return frameResult;
                }
            } catch (e) {
                // Cross-origin frame. Browser security blocks access.
            }
        }

        let element = getReadableElementForContext(document, context);
        if (element && textLength(element) > 20) {
            return {context: context, element: element, document: document, frame: null};
        }

        // Inspect nested same-origin frames used by Articulate Rise/Storyline and some SCORM players.
        const nestedFrames = getNestedFrameDocuments(document, 0);
        for (const item of nestedFrames) {
            const nestedResult = getFrameReadableElement(item.frame, item.document, 'scorm');
            if (nestedResult.element && textLength(nestedResult.element) > 20) {
                return nestedResult;
            }
        }

        // Then inspect any remaining same-origin iframe.
        for (const frame of frames) {
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                const frameResult = getFrameReadableElement(frame, doc);
                if (frameResult.element && textLength(frameResult.element) > 20) {
                    return frameResult;
                }
            } catch (e) {
                // Cross-origin frame. Browser security blocks access.
            }
        }
        return {context: context, element: getReadableElementForContext(document, context), document: document, frame: null};
    }

    function updateContextIndicator() {
        const indicator = qs('morska-context');
        if (!indicator) {
            return;
        }
        const result = getCurrentVisibleElement();
        const labels = {
            h5p: 'H5P interactive screen',
            scorm: 'SCORM interactive screen',
            book: 'Moodle Book chapter',
            page: 'Moodle Page',
            lesson: 'Lesson page',
            quiz: 'Quiz content',
            forum: 'Forum discussion',
            assignment: 'Assignment instructions',
            course: 'Course content'
        };
        const toolLabels = {
            'articulate-rise': 'Articulate Rise',
            'articulate-storyline': 'Articulate Storyline',
            'exelearning': 'eXeLearning',
            'adobe-captivate': 'Adobe Captivate',
            'ispring': 'iSpring',
            'generic-scorm': 'Generic SCORM'
        };
        const baseLabel = labels[result.context] || 'Current Moodle page';
        indicator.textContent = result.context === 'scorm' && result.authoringTool ?
            baseLabel + ' · ' + (toolLabels[result.authoringTool] || result.authoringTool) : baseLabel;
    }

    function getVisiblePageText() {
        const result = getCurrentVisibleElement();
        return collectInteractiveText(result);
    }

    function getCurrentParagraph() {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
            let node = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection.anchorNode.parentElement;
            while (node && node !== document.body) {
                if (['P', 'LI', 'TD', 'DIV', 'SECTION', 'ARTICLE'].includes(node.tagName)) {
                    const text = cleanText(node.innerText);
                    if (text) {
                        return text;
                    }
                }
                node = node.parentElement;
            }
        }
        return getSelectedText() || getVisiblePageText();
    }

    function getSmartText() {
        const selected = getSelectedText();
        if (selected) {
            return selected;
        }
        return getVisiblePageText();
    }

    function getTextForMode(forceMode) {
        const mode = forceMode || qs('morska-mode')?.value || 'smart';
        if (mode === 'selection') {
            return getSelectedText();
        }
        if (mode === 'paragraph') {
            return getCurrentParagraph();
        }
        if (mode === 'visible') {
            return getVisiblePageText();
        }
        return getSmartText();
    }

    function splitIntoSentences(text) {
        const cleaned = cleanText(text);
        if (!cleaned) {
            return [];
        }
        const parts = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
        return parts.map(function(part) { return part.trim(); }).filter(function(part) { return part.length > 0; });
    }

    function clearHighlight() {
        if (currentHighlight && currentHighlight.parentNode) {
            isInternalDomUpdate = true;
            const parent = currentHighlight.parentNode;
            parent.replaceChild(currentHighlight.ownerDocument.createTextNode(currentHighlight.textContent), currentHighlight);
            parent.normalize();
            currentHighlight = null;
            setTimeout(function() { isInternalDomUpdate = false; }, 0);
            return;
        }
        currentHighlight = null;
    }

    function normaliseForMatch(value) {
        return (value || '').replace(/\s+/g, ' ').trim();
    }

    function isReadableTextNode(node) {
        if (!node || !node.nodeValue || !node.nodeValue.trim()) {
            return false;
        }
        const parent = node.parentElement;
        if (!parent) {
            return false;
        }
        if (parent.closest('#morska-panel, #morska-floating-button, script, style, noscript, [aria-hidden="true"], [hidden]')) {
            return false;
        }
        return isVisible(parent);
    }

    function splitTextNodeIntoSentenceUnits(node, result) {
        const text = node.nodeValue || '';
        const units = [];
        const regex = /[^.!?]+[.!?]+|[^.!?]+$/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const raw = match[0];
            const leading = raw.search(/\S/);
            if (leading < 0) {
                continue;
            }
            const trimmed = raw.trim();
            if (!trimmed) {
                continue;
            }
            const start = match.index + leading;
            const end = start + trimmed.length;
            units.push({
                text: trimmed,
                node: node,
                start: start,
                end: Math.min(end, text.length),
                document: result.document || document,
                frame: result.frame || null,
                context: result.context || 'page'
            });
        }
        return units;
    }

    function buildDomReadingQueue(result) {
        if (!result || !result.element || !result.document || !result.document.createTreeWalker) {
            return [];
        }
        const queue = [];
        const walker = result.document.createTreeWalker(result.element, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                return isReadableTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        let node;
        while ((node = walker.nextNode())) {
            splitTextNodeIntoSentenceUnits(node, result).forEach(function(unit) {
                if (unit.text.length > 1) {
                    queue.push(unit);
                }
            });
        }
        return queue;
    }

    function buildReadingQueue(text, result, preferDom) {
        if (preferDom !== false && result && result.element) {
            const domQueue = buildDomReadingQueue(result);
            if (domQueue.length) {
                // If a specific text string was requested, keep only units represented in that text.
                const requested = normaliseForMatch(text);
                if (requested && requested.length < normaliseForMatch(result.element.innerText || '').length - 10) {
                    const filtered = domQueue.filter(function(unit) {
                        const probe = normaliseForMatch(unit.text).substring(0, 45);
                        return probe && requested.indexOf(probe) !== -1;
                    });
                    if (filtered.length) {
                        return filtered;
                    }
                }
                return domQueue;
            }
        }
        return splitIntoSentences(text).map(function(sentence) {
            return {text: sentence, node: null, start: 0, end: 0, document: result ? result.document : document,
                frame: result ? result.frame : null, context: result ? result.context : 'page'};
        });
    }

    function isElementComfortablyVisible(element, win) {
        if (!element || !win) {
            return false;
        }
        const rect = element.getBoundingClientRect();
        const topSafe = win.innerHeight * 0.2;
        const bottomSafe = win.innerHeight * 0.78;
        return rect.top >= topSafe && rect.bottom <= bottomSafe;
    }

    function getScrollableAncestor(element) {
        let parent = element ? element.parentElement : null;
        while (parent && parent !== element.ownerDocument.body) {
            try {
                const style = element.ownerDocument.defaultView.getComputedStyle(parent);
                const overflowY = style.overflowY;
                if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight + 5) {
                    return parent;
                }
            } catch (e) {}
            parent = parent.parentElement;
        }
        return null;
    }

    function scrollElementToSafeZone(element, win) {
        if (!element || !win || isElementComfortablyVisible(element, win)) {
            return;
        }
        const scroller = getScrollableAncestor(element);
        if (scroller) {
            const elementRect = element.getBoundingClientRect();
            const scrollerRect = scroller.getBoundingClientRect();
            const desired = scrollerRect.top + (scroller.clientHeight * 0.45);
            scroller.scrollTo({top: Math.max(0, scroller.scrollTop + elementRect.top - desired), behavior: 'smooth'});
            return;
        }
        const rect = element.getBoundingClientRect();
        const targetTop = win.pageYOffset + rect.top - (win.innerHeight * 0.42);
        win.scrollTo({top: Math.max(0, targetTop), behavior: 'smooth'});
    }

    function getFrameChainFromDocument(doc) {
        const chain = [];
        let currentDoc = doc;
        let guard = 0;
        while (currentDoc && currentDoc.defaultView && currentDoc.defaultView !== window && guard < 8) {
            guard++;
            try {
                const frame = currentDoc.defaultView.frameElement;
                if (!frame) {
                    break;
                }
                chain.push(frame);
                currentDoc = frame.ownerDocument;
            } catch (e) {
                break;
            }
        }
        return chain;
    }

    function scrollReadingFocusIntoView(span, unit) {
        if (!span) {
            return;
        }
        try {
            const innerWindow = (span.ownerDocument && span.ownerDocument.defaultView) || window;

            // Step 1: centre the active spoken sentence in its nearest real scroll container.
            scrollElementToSafeZone(span, innerWindow);

            // Step 2: walk outward through every nested iframe. H5P Interactive Book and SCORM
            // players can have more than one nested viewport, so scrolling only the outer iframe
            // leaves the highlighted sentence off-screen inside an inner document.
            const frameChain = getFrameChainFromDocument(span.ownerDocument);
            frameChain.forEach(function(frame, index) {
                const parentWindow = (frame.ownerDocument && frame.ownerDocument.defaultView) || window;
                window.setTimeout(function() {
                    if (!isElementComfortablyVisible(frame, parentWindow)) {
                        scrollElementToSafeZone(frame, parentWindow);
                    }
                }, 40 * (index + 1));
            });

            // Compatibility fallback for units whose original frame reference is available but is
            // not discoverable through frameElement (some Moodle wrappers replace frame nodes).
            const frame = unit && unit.frame ? unit.frame : null;
            if (frame && frame.isConnected) {
                const parentWindow = (frame.ownerDocument && frame.ownerDocument.defaultView) || window;
                window.setTimeout(function() {
                    if (!isElementComfortablyVisible(frame, parentWindow)) {
                        scrollElementToSafeZone(frame, parentWindow);
                    }
                }, 120);
            }
        } catch (e) {
            try {
                span.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
            } catch (ignored) {}
        }
    }

    function locateUnitNode(unit) {
        if (unit && unit.node && unit.node.isConnected) {
            return unit;
        }
        if (!unit || !unit.text) {
            return null;
        }
        const result = getCurrentVisibleElement();
        if (!result.element || !result.document || !result.document.createTreeWalker) {
            return null;
        }
        const needle = normaliseForMatch(unit.text);
        const probe = needle.substring(0, Math.min(needle.length, 45));
        const walker = result.document.createTreeWalker(result.element, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (!isReadableTextNode(node)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return normaliseForMatch(node.nodeValue).indexOf(probe) !== -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        });
        const node = walker.nextNode();
        if (!node) {
            return null;
        }
        const index = normaliseForMatch(node.nodeValue).indexOf(probe);
        return {
            text: unit.text,
            node: node,
            start: Math.max(0, index),
            end: Math.min(node.nodeValue.length, Math.max(0, index) + unit.text.length),
            document: result.document,
            frame: result.frame,
            context: result.context
        };
    }

    function highlightSentence(unit) {
        clearHighlight();
        const sentence = typeof unit === 'string' ? unit : (unit ? unit.text : '');
        if (!qs('morska-highlight')?.checked || !sentence || sentence.length < 2) {
            return;
        }
        const resolved = typeof unit === 'string' ? locateUnitNode({text: sentence}) : locateUnitNode(unit);
        if (!resolved || !resolved.node || !resolved.node.isConnected) {
            return;
        }
        const doc = resolved.document || resolved.node.ownerDocument || document;
        const node = resolved.node;
        const max = node.nodeValue.length;
        const start = Math.max(0, Math.min(resolved.start || 0, max));
        const end = Math.max(start + 1, Math.min(resolved.end || (start + sentence.length), max));
        const range = doc.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        const span = doc.createElement('span');
        span.className = 'morska-reading-highlight';
        span.setAttribute('data-morska-reading-focus', 'true');
        span.style.backgroundColor = '#fff3a3';
        span.style.color = '#000';
        span.style.outline = '2px solid #f2c94c';
        span.style.borderRadius = '2px';
        try {
            isInternalDomUpdate = true;
            range.surroundContents(span);
            currentHighlight = span;
            if (qs('morska-autoscroll')?.checked) {
                scrollReadingFocusIntoView(span, resolved);
            }
            setTimeout(function() { isInternalDomUpdate = false; }, 0);
        } catch (e) {
            isInternalDomUpdate = false;
        }
    }

    function updateProgress() {
        const label = qs('morska-progress-label');
        const bar = qs('morska-progress-bar');
        const total = readingQueue.length;
        const current = total ? queueIndex + 1 : 0;
        if (label) {
            label.textContent = total ? ('Sentence ' + current + ' of ' + total) : 'No reading active';
        }
        if (bar) {
            const percent = total ? Math.round((current / total) * 100) : 0;
            bar.style.width = percent + '%';
            bar.setAttribute('aria-valuenow', String(percent));
        }
    }

    function getSourceKey(result) {
        const url = (result && result.document && result.document.location) ? result.document.location.href : window.location.href;
        const context = result ? result.context : detectContext(document);
        return 'local_morska_resume_' + context + '_' + btoa(unescape(encodeURIComponent(url))).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    }

    function saveReadingPosition() {
        if (!currentReadingSource || !readingQueue.length) {
            return;
        }
        try {
            localStorage.setItem(currentReadingSource, JSON.stringify({index: queueIndex, total: readingQueue.length, time: Date.now()}));
        } catch (e) {}
    }

    function maybeLoadReadingPosition(result) {
        currentReadingSource = getSourceKey(result || getCurrentVisibleElement());
        if (resumePromptShown) {
            return 0;
        }
        resumePromptShown = true;
        try {
            const saved = JSON.parse(localStorage.getItem(currentReadingSource) || 'null');
            if (saved && saved.index > 0 && saved.total === readingQueue.length && confirm('Resume reading from where you stopped?')) {
                return Math.min(saved.index, readingQueue.length - 1);
            }
        } catch (e) {}
        return 0;
    }

    function signatureForReadable() {
        const result = getCurrentVisibleElement();
        const text = cleanText(result.element ? result.element.innerText : '');
        const signature = result.context + ':' + text.substring(0, 180) + ':' + text.length;
        return {result: result, text: text, signature: signature};
    }

    function refreshQueueIfContentChanged(force) {
        const data = signatureForReadable();
        if (!force && data.signature === lastReadableSignature) {
            return false;
        }
        if (preparedInteractionSignature && preparedInteractionSignature !== data.signature) {
            preparedInteractionQueue = [];
            preparedInteractionSignature = '';
            activeInteractionGroup = null;
        }
        lastReadableSignature = data.signature;
        lastReadableContext = data.result.context;
        updateContextIndicator();

        // If the learner is reading smart/current content and the H5P/SCORM screen changes,
        // rebuild the queue so Play/Next uses the new screen automatically.
        if (readingQueue.length && (lastReadableContext === 'h5p' || lastReadableContext === 'scorm')) {
            readingQueue = buildReadingQueue(data.text, data.result, true);
            queueIndex = 0;
            clearHighlight();
            updateProgress();
            announce('Readable content changed. Reading queue updated.');
        }
        return true;
    }

    function observeFrameChanges() {
        const observeDoc = function(doc) {
            if (!doc || !doc.body || doc.body.dataset.morskaObserved === '1') {
                return;
            }
            doc.body.dataset.morskaObserved = '1';
            try {
                const observer = new MutationObserver(function(mutations) {
                    if (isInternalDomUpdate) {
                        return;
                    }
                    const externalChange = mutations.some(function(mutation) {
                        const target = mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
                        return !(target && target.closest && target.closest('[data-morska-reading-focus="true"]'));
                    });
                    if (!externalChange) {
                        return;
                    }
                    clearTimeout(pageChangeTimer);
                    pageChangeTimer = setTimeout(function() {
                        refreshQueueIfContentChanged(false);
                        // Articulate and other SCORM tools frequently inject visual content after initial load.
                        // Re-scan so newly rendered cards, quotations and statements enter the Tab order.
                        makeReadableContentFocusable(doc);
                    }, 500);
                });
                observer.observe(doc.body, {childList: true, subtree: true, attributes: true, characterData: true});
            } catch (e) {}
        };
        observeDoc(document);
        bindFocusedInteractiveReading(document);
        document.querySelectorAll('iframe, frame').forEach(function(frame) {
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                observeDoc(doc);
                bindFocusedInteractiveReading(doc);
            } catch (e) {}
        });
        getNestedFrameDocuments(document, 0).forEach(function(item) {
            observeDoc(item.document);
            bindFocusedInteractiveReading(item.document);
        });
    }

    function configureUtterance(text) {
        utterance = new SpeechSynthesisUtterance(text);
        const voiceSelect = qs('morska-voice');
        if (voiceSelect && voices[voiceSelect.value]) {
            utterance.voice = voices[voiceSelect.value];
            utterance.lang = voices[voiceSelect.value].lang;
        }
        utterance.rate = parseFloat(qs('morska-rate')?.value || '1');
        utterance.pitch = parseFloat(qs('morska-pitch')?.value || '1');
        utterance.volume = parseFloat(qs('morska-volume')?.value || '1');
        return utterance;
    }

    function speakQueue(index) {
        if (!readingQueue.length || index < 0 || index >= readingQueue.length) {
            clearHighlight();
            updateProgress();
            if (currentReadingSource) { try { localStorage.removeItem(currentReadingSource); } catch (e) {} }
            announce('Reading finished.');
            return;
        }
        queueIndex = index;
        updateProgress();
        saveReadingPosition();
        const unit = readingQueue[queueIndex];

        // Focus-driven interaction: markers are not spoken. The object is activated only when
        // the reading queue reaches it, then its newly visible content replaces the marker.
        if (unit && unit.interactionMarker) {
            activateMarkerAndInject(unit, queueIndex);
            return;
        }

        const sentence = typeof unit === 'string' ? unit : unit.text;

        const beginSpeaking = function() {
            highlightSentence(unit);
            utterance = configureUtterance(sentence);
            utterance.onend = function() {
                speakQueue(queueIndex + 1);
            };
            utterance.onerror = function() {
                clearHighlight();
                announce('Reading stopped.');
            };
            window.speechSynthesis.speak(utterance);
        };

        // Sequential interaction reading: reactivate the accordion/tab/card/hotspot when the
        // queue reaches that learning object. This prevents the engine from leaving only the
        // final tab or card visible and ensures each object's content is read in order.
        if (unit && unit.interactionGroup && unit.interactionGroup !== activeInteractionGroup &&
                typeof unit.activateInteraction === 'function') {
            activeInteractionGroup = unit.interactionGroup;
            try { unit.activateInteraction(); } catch (e) {}
            setTimeout(beginSpeaking, unit.interactionType === 'hotspot' ? 350 : 220);
        } else {
            beginSpeaking();
        }
    }

    function speak(text) {
        if (!('speechSynthesis' in window)) {
            announce('Text to speech is not supported in this browser.');
            return;
        }
        if (!text) {
            announce('No readable text found. Select text or choose visible page text.');
            return;
        }
        window.speechSynthesis.cancel();
        clearHighlight();
        const result = getCurrentVisibleElement();
        currentReadingSource = getSourceKey(result);
        lastReadableSignature = signatureForReadable().signature;
        const currentSignature = signatureForReadable().signature;
        const selectedNow = getSelectedText();
        if (!selectedNow && preparedInteractionQueue.length && preparedInteractionSignature === currentSignature) {
            readingQueue = preparedInteractionQueue.slice();
            activeInteractionGroup = null;
        } else {
            readingQueue = buildReadingQueue(text, result, true);
        }
        queueIndex = maybeLoadReadingPosition(result);
        if (!readingQueue.length) {
            updateProgress();
            announce('No readable text found.');
            return;
        }
        updateProgress();
        speakQueue(queueIndex);
        announce('Reading started.');
    }

    function openPanel() {
        const panel = qs('morska-panel');
        if (!panel) {
            return;
        }
        lastFocus = document.activeElement;
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        isOpen = true;
        updatePanelPosition();
        updateContextIndicator();
        const first = qs('morska-play') || panel;
        first.focus();
        announce('Morska Accessibility Suite opened.');
    }

    function closePanel() {
        const panel = qs('morska-panel');
        if (!panel) {
            return;
        }
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        isOpen = false;
        if (lastFocus && typeof lastFocus.focus === 'function') {
            lastFocus.focus();
        }
        announce('Morska Accessibility Suite closed.');
    }

    function togglePanel() {
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    function bindKeyboardTrap(event) {
        if (!isOpen || event.key !== 'Tab') {
            return;
        }
        const panel = qs('morska-panel');
        const focusables = panel.querySelectorAll('button, select, input, summary, [href], [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) {
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function nextSentence() {
        if (!readingQueue.length) {
            announce('No active reading queue.');
            return;
        }
        window.speechSynthesis.cancel();
        speakQueue(Math.min(queueIndex + 1, readingQueue.length - 1));
        announce('Next sentence.');
    }

    function previousSentence() {
        if (!readingQueue.length) {
            announce('No active reading queue.');
            return;
        }
        window.speechSynthesis.cancel();
        speakQueue(Math.max(queueIndex - 1, 0));
        announce('Previous sentence.');
    }


    function openTranslationWindow(text) {
        const cleaned = cleanText(text || '');
        if (!cleaned) {
            announce('No text available for translation.');
            return;
        }
        const source = qs('morska-source-language')?.value || 'auto';
        const target = qs('morska-target-language')?.value || 'sw';
        const limited = cleaned.substring(0, 4500);
        const url = 'https://translate.google.com/?sl=' + encodeURIComponent(source) +
            '&tl=' + encodeURIComponent(target) + '&text=' + encodeURIComponent(limited) + '&op=translate';
        window.open(url, '_blank', 'noopener,noreferrer');
        announce('Translation window opened.');
    }

    function startDictation() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            announce('Speech to text is not supported in this browser. Use Chrome or Edge.');
            return;
        }
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        recognition = new SpeechRecognition();
        recognition.lang = qs('morska-dictation-language')?.value || 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        let finalText = qs('morska-dictation-output')?.value || '';
        recognition.onresult = function(event) {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += (finalText ? ' ' : '') + transcript.trim();
                } else {
                    interim += transcript;
                }
            }
            const output = qs('morska-dictation-output');
            if (output) {
                output.value = (finalText + (interim ? ' ' + interim : '')).trim();
            }
        };
        recognition.onerror = function() {
            announce('Dictation error. Check microphone permission.');
        };
        recognition.onend = function() {
            announce('Dictation stopped.');
        };
        recognition.start();
        announce('Dictation started.');
    }

    function stopDictation() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }

    function rememberEditableField(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const tag = (target.tagName || '').toLowerCase();
        if (tag === 'textarea' || tag === 'input' || target.isContentEditable) {
            lastEditableField = target;
        }
    }

    function insertDictation() {
        const text = qs('morska-dictation-output')?.value || '';
        if (!text) {
            announce('There is no dictated text to insert.');
            return;
        }
        const field = lastEditableField;
        if (!field) {
            navigator.clipboard?.writeText(text);
            announce('No active field found. Dictation copied to clipboard.');
            return;
        }
        if (field.isContentEditable) {
            field.focus();
            document.execCommand('insertText', false, text);
        } else {
            const start = field.selectionStart || field.value.length;
            const end = field.selectionEnd || field.value.length;
            field.value = field.value.substring(0, start) + text + field.value.substring(end);
            field.dispatchEvent(new Event('input', {bubbles: true}));
            field.focus();
        }
        announce('Dictation inserted.');
    }

    function bindEvents() {
        document.querySelectorAll('.morska-section').forEach(function(section) {
            section.addEventListener('toggle', saveSectionState);
        });
        qs('morska-floating-button')?.addEventListener('click', function(event) {
            if (event.currentTarget.dataset.ignoreNextClick === '1') {
                return;
            }
            togglePanel();
        });
        qs('morska-skip-link')?.addEventListener('click', function(e) { e.preventDefault(); openPanel(); });
        qs('morska-close')?.addEventListener('click', closePanel);
        qs('morska-play')?.addEventListener('click', function() {
            // Playback must never activate H5P/SCORM controls. Interaction preparation is explicit.
            const selected = getSelectedText();
            speak(selected || getTextForMode());
            savePrefs();
        });
        qs('morska-pause')?.addEventListener('click', function() { window.speechSynthesis.pause(); announce('Reading paused.'); });
        qs('morska-resume')?.addEventListener('click', function() { window.speechSynthesis.resume(); announce('Reading resumed.'); });
        qs('morska-stop')?.addEventListener('click', function() { window.speechSynthesis.cancel(); clearHighlight(); saveReadingPosition(); updateProgress(); announce('Reading stopped.'); });
        qs('morska-next')?.addEventListener('click', nextSentence);
        qs('morska-prev')?.addEventListener('click', previousSentence);
        qs('morska-prepare-interactions')?.addEventListener('click', function() {
            prepareInteractiveContent();
            runInteractionDiagnostics();
            savePrefs();
        });
        qs('morska-run-interaction-diagnostics')?.addEventListener('click', runInteractionDiagnostics);
        qs('morska-profile')?.addEventListener('change', function(event) {
            applyProfile(event.target.value);
            savePrefs();
            announce('Accessibility profile applied.');
        });
        qs('morska-position')?.addEventListener('change', function(event) {
            localStorage.removeItem(positionKey);
            setPresetPosition(event.target.value);
            savePrefs();
            announce('Widget position changed.');
        });
        qs('morska-reset-position')?.addEventListener('click', function() {
            localStorage.removeItem(positionKey);
            setPresetPosition(qs('morska-position')?.value || defaultPosition);
            announce('Widget position reset.');
        });
        qs('morska-translate-selection')?.addEventListener('click', function() { openTranslationWindow(getSelectedText()); savePrefs(); });
        qs('morska-translate-current')?.addEventListener('click', function() { openTranslationWindow(getTextForMode('smart')); savePrefs(); });
        qs('morska-dictate-start')?.addEventListener('click', function() { startDictation(); savePrefs(); });
        qs('morska-dictate-stop')?.addEventListener('click', stopDictation);
        qs('morska-insert-dictation')?.addEventListener('click', insertDictation);

        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.shiftKey && String(event.key).toLowerCase() === 'd') {
                event.preventDefault();
                openPanel();
                const details = document.querySelector('.morska-section[data-section="interaction"]');
                if (details) { details.open = true; }
                runInteractionDiagnostics();
                qs('morska-run-interaction-diagnostics')?.focus();
            }
        });

        ['morska-voice', 'morska-mode', 'morska-position', 'morska-rate', 'morska-pitch', 'morska-volume', 'morska-autoscroll', 'morska-highlight', 'morska-reading-ruler', 'morska-high-contrast', 'morska-dyslexia-font', 'morska-magnifier', 'morska-text-size', 'morska-line-spacing', 'morska-magnifier-size', 'morska-source-language', 'morska-target-language', 'morska-dictation-language', 'morska-interaction-mode', 'morska-auto-interact', 'morska-remember'].forEach(function(id) {
            const el = qs(id);
            if (el) {
                el.addEventListener('change', function() { updateRangeLabels(); applyVisionTools(); savePrefs(); updateContextIndicator(); });
                el.addEventListener('input', function() { updateRangeLabels(); applyVisionTools(); savePrefs(); });
            }
        });

        document.addEventListener('selectionchange', rememberSelectedText);
        document.addEventListener('mouseup', rememberSelectedText, true);
        document.addEventListener('keyup', rememberSelectedText, true);

        document.addEventListener('keydown', function(event) {
            bindKeyboardTrap(event);
            if (event.key === 'Escape') {
                window.speechSynthesis.cancel();
                clearHighlight();
                if (isOpen) {
                    closePanel();
                }
                return;
            }
            if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                togglePanel();
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
                event.preventDefault();
                speak(getTextForMode('selection'));
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
                event.preventDefault();
                speak(getTextForMode('smart'));
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                window.speechSynthesis.cancel();
                clearHighlight();
                saveReadingPosition();
                updateProgress();
                announce('Reading stopped.');
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'n') {
                event.preventDefault();
                nextSentence();
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'b') {
                event.preventDefault();
                previousSentence();
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.code === 'Space') {
                event.preventDefault();
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                    announce('Reading resumed.');
                } else {
                    window.speechSynthesis.pause();
                    announce('Reading paused.');
                }
            }
        });
    }

    function init() {
        if (!qs('morska-floating-button')) {
            return;
        }
        applyWidgetPosition();
        bindEvents();
        bindDrag();
        window.addEventListener('resize', function() {
            applyWidgetPosition();
            if (isOpen) {
                updatePanelPosition();
            }
        });
        populateVoices();
        applyPrefs();
        restoreSectionState();
        updateContextIndicator();
        updateProgress();
        observeFrameChanges();
        setInterval(function() { updateContextIndicator(); observeFrameChanges(); refreshQueueIfContentChanged(false); }, 2500);
        document.addEventListener('mousemove', updateReadingRuler);
        document.addEventListener('focusin', rememberEditableField);
        document.addEventListener('focusin', function(event) {
            if (qs('morska-reading-ruler')?.checked && event.target && event.target.getBoundingClientRect) {
                const rect = event.target.getBoundingClientRect();
                updateReadingRuler({clientY: rect.top + rect.height / 2});
            }
        });
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoices;
        }
    }

    return { init: init };
});
