# Morska Driver Framework v1.0

This build introduces the first implementation scaffold for the Morska Interaction Engine.

## Main components

- `driver_interface`: universal contract for learning object drivers.
- `base_driver`: safe default implementation.
- `driver_registry`: registers and resolves drivers by priority.
- `event_bus`: lightweight event publication layer.
- `interaction_context`: Moodle context snapshot provider.
- H5P and SCORM driver scaffolds.

## Driver lifecycle

1. Detect context.
2. Resolve the highest-priority matching driver.
3. Initialize driver.
4. Prepare interactive object.
5. Extract readable content.
6. Update reading queue.
7. Publish events.

## Next drivers

- H5P Accordion
- H5P Course Presentation
- H5P Flashcards
- H5P Hotspots
- Articulate Rise
- Articulate Storyline
- UniLabel Accordion/Tabs/Cards
