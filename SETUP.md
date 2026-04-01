# Exec Comms — Setup

Same setup as the Michelin app. No npm, no build step.

## Files

- `index.html` — main page, loads React from CDN
- `style.css` — design system (colors, fonts, themes)
- `data.js` — all 50 sessions data
- `app.js` — app logic (React components)
- `manifest.json` — PWA config for homescreen install
- `firebase.json` — Firebase Hosting config

## Deploy to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Go to Hosting → Get started
4. Follow the steps to connect your GitHub repo
5. Set the public directory to `.` (root)
6. Deploy

## Add to iPhone Homescreen

1. Open the Firebase URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. It runs as a standalone app (no Safari bar)
