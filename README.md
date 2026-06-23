# Macros

A local-first food diary and macro tracker. No build step, no backend, no account —
just static files and `localStorage`.

## Run it

Serve the folder over HTTP (ES modules and service workers don't work from `file://`):

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`. On your phone, open the same URL and use your
browser's "Add to Home Screen" to install it as an app.

## How data is stored

Everything lives in a single JSON blob in `localStorage` (see `js/storage.js`).
Use Settings → Export JSON to download a backup; Import JSON restores from one.
The exported shape is plain data with no storage-specific details baked in, so a
Google Drive (or any other) sync provider could later be slotted in behind the
same `load()`/`save()` functions without changing the rest of the app.

## Structure

- `js/storage.js` — persistence layer (localStorage now, swappable later)
- `js/state.js` — in-memory store + mutations, notifies subscribers on change
- `js/seed-foods.js` — built-in food database
- `js/views/*` — Diary / Foods / Goals / Settings tabs
- `js/modals/*` — add-to-meal and food-editor dialogs
