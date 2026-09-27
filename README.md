# JESSIE LIFE OS — V3

Standalone dark-first PWA built from the V3 Master Build Specification.

## Run
For the most reliable experience:
```bash
python -m http.server 8080
```
Then open:
`http://localhost:8080`

Opening `index.html` directly also works for the core UI, but a local server is recommended for PWA/offline features.

## QA date override
The real study start is 2026-10-01. For acceptance testing without changing your computer date, use:
`http://localhost:8080/?date=2026-10-01#dashboard`

The app uses the override only when the `date` query parameter is explicitly present. Remove it to return to the real current date.

## Core systems
- Automatic daily curriculum task generation
- 2 meaningful tasks/day by default (adjustable)
- Overdue preservation/rescheduling
- 12-section Marketing curriculum with 145 structured topics
- Task states: NOT STARTED / IN PROGRESS / COMPLETED / SKIPPED
- Real task, progress, streak, milestone and study-session calculations
- Actual focus sessions stored locally
- Topic pages and notes
- JESSIE Library with material → topic/task connections
- Local backup/restore
- Optional browser-native voice
- Optional generated ambient/UI sound
- PWA service worker
- Responsive mobile layout
- Dark cinematic visual system
- Reference-image-driven JESSIE build reveal using layered masks/clipping

## Material intelligence
The browser app saves references and associations locally. It does not pretend to analyze inaccessible URLs. If a source cannot be read, it explicitly remains a saved reference.


## Quick Test Build
This package is intentionally in TEST MODE so it can be tested before 1 October 2026. It treats the current date as Study Day 1 and automatically generates today's curriculum tasks. Use NEXT TEST DAY to simulate the next study day and verify automatic rescheduling. Use RESET TEST to return to a clean Study Day 1.
