# Blockfall 3D

A static, offline-capable 3D falling-block game for GitHub Pages. No build step or runtime CDN is required. Serve the repository with a local HTTP server and open `/blockfall3d/`.

## Controls

Arrow keys move along the labeled X/Z floor axes. Q/E rotate X, A/D rotate Y, Z/C rotate Z. Space hard-drops, B soft-drops, Shift holds, Enter starts/resumes, and P pauses. Touch controls mirror these actions. Drag the well to orbit; pinch or scroll to zoom. Camera movement never affects game coordinates.

## Rules and saves

The well is 5 × 5 × 12. Each shuffled bag contains the seven four-cube shapes. Only complete horizontal layers clear. Rotations that intersect walls or blocks are rejected, without wall kicks. A grounded piece locks after 500 ms; grounded moves/turns can reset this delay at most 15 times. Layers score 100/300/500/800 times the current level. Gravity speeds up every five layers, from the selected starting difficulty, with an 80 ms floor.

The engine is independent of Three.js. Seeds are trimmed, NFKC-normalized and lowercased. The active game and random generator state persist in `blockfall3d-v1`; Arrow Escape data is never accessed. Imports validate completely before replacing data. Restart keeps records/settings; full reset removes only this game's key. New save formats must increment the version and provide a migration before reading older saves.

Run automated checks with `node --test blockfall3d/*.test.mjs`. Also test WebGL, layout and input in a real browser. A service worker caches assets under this directory only; bump its cache version whenever shipping changed assets. Updates take effect after old game tabs close.

Three.js r160 is vendored under `vendor/` with its MIT license. The game uses no analytics, advertising, accounts or external network dependencies.
