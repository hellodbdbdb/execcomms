# Exec Comms — Setup

Uses the same Firebase project as the Michelin app (`michelin-ba03a`). No npm, no build step.

## Files

- `index.html` — main page, loads React from CDN
- `style.css` — design system (colors, fonts, themes)
- `data.js` — all 50 sessions data
- `app.js` — app logic (React components + Firebase auth/sync)
- `manifest.json` — PWA config for homescreen install
- `firebase.json` — Firebase Hosting config

## Firebase Setup

Uses the existing `michelin-ba03a` Firebase project. Data is stored in a separate Firestore collection: `execcomms-users/{uid}`.

### Firestore Security Rules

Add this rule to the existing Firestore rules in the Firebase Console:

```
match /execcomms-users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Authorized Domains

If deploying to a new domain, add it to Firebase Console → Authentication → Settings → Authorized domains.

## Deploy to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the `michelin-ba03a` project
3. Go to Hosting → Get started
4. Follow the steps to connect your GitHub repo
5. Set the public directory to `.` (root)
6. Deploy

## Add to iPhone Homescreen

1. Open the Firebase URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. It runs as a standalone app (no Safari bar)
