# Firebase Configuration

## How to set up:

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Realtime Database (Start in test mode)
4. Get your config from Project Settings > Web App

## Config format:

```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Security Rules (after testing):

```json
{
  "rules": {
    "notes": {
      ".read": true,
      ".write": true
    }
  }
}
```

For production, implement authentication and proper security rules.
