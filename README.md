# Birthday Love Experience ♡

A romantic, responsive birthday microsite built with:
- HTML5
- CSS3
- Bootstrap 5.3
- jQuery 3.7
- Vanilla JavaScript

## Offline-ready

The project includes local copies of jQuery 3.7.1 and Bootstrap 5.3.x in `vendor/`, so the core page works even when Chrome DevTools shows **Offline**. No CDN is required for the page UI/functionality.

## Quick setup

1. Open `script.js`.
2. Edit the `CONFIG` object:
   - `name`: her name
   - `birthday`: her DOB in `YYYY-MM-DD`
3. Open `index.html` in a browser.

## Optional music
Place your MP3 at:
`assets/birthday-song.mp3`

The page does NOT autoplay music. The visitor must tap the music button, which also avoids browser autoplay restrictions.

## Personalize memories
In `index.html`, search for `memory-item`.
Replace the placeholder memory cards with your own:
- photo `<img>`
- date
- title
- story

Example image:
`<img src="assets/memory-01.jpg" alt="Our memory">`

## QA checklist already handled
- Responsive mobile/tablet/desktop layout
- Reduced-motion accessibility fallback
- Keyboard-accessible buttons
- Bootstrap modal works
- Live clock updates every second
- Age calculation handles whether this year's birthday has passed
- Gift opening state
- Cake candle state + relight
- Puzzle success/failure state
- Scratch-card mouse + touch support
- IntersectionObserver reveal animations
- Lightweight canvas particles
- Confetti cleanup
- Music availability/error fallback
- No external animation library required

## Recommended final customization
Use 4–8 real memories, 3–6 photos, a meaningful birthday song, her actual DOB, and your own final letter. The structure is intentionally easy to edit.

## v5 changes
- Offline-safe romantic typography using system fonts.
- Typewriter animation with blinking caret for surprise popup messages.
- Existing responsive, clock, cake, puzzle, scratch, modal and music behavior preserved.


## V7 changes
- Removed Bootstrap Icons webfont dependency.
- Replaced icon glyphs with inline SVG icons for reliable offline rendering.
- Removed typewriter animation from static paragraphs/headings.
- Typewriter animation is now used only for dynamic/reveal messages.
- Rebuilt the cake as a responsive two-tier CSS cake with cleaner proportions.
- Hardened narrow/mobile/landscape viewport behavior.


## V13 — Personal setup + Velvet Curtain
- First-load "Something big is coming" intro with a Let's create action.
- Personal setup: name, image selection, and birthday date picker.
- Selected image is displayed in the new personal memory section.
- Entered birthday powers live years/months/days age calculation, with hours/minutes/seconds revealed on hover/tap.
- Velvet Curtain Reveal transition opens the existing birthday page.
- Existing birthday sections and interactions are retained.
- No required remote resources; music is optional and can be added as `assets/birthday-song.mp3`.
