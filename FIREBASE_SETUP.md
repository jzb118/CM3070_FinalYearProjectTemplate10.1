# Firebase Setup Guide

This guide will help you set up Firebase for the disaster reporting feature.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `disaster-preparedness-app` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Disaster Preparedness Mobile App`
3. **DO NOT** check "Also set up Firebase Hosting"
4. Click "Register app"
5. You'll see your Firebase configuration - **KEEP THIS PAGE OPEN**

## Step 3: Enable Realtime Database

1. In the left sidebar, click "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose location: **United States** (or closest to your region)
4. Start in **Test mode** (we'll secure it later)
5. Click "Enable"

## Step 4: Set Up Database Security Rules

1. In Realtime Database, click the "Rules" tab
2. Replace the rules with:

```json
{
  "rules": {
    "reports": {
      ".read": true,
      ".write": true,
      "$reportId": {
        ".validate": "newData.hasChildren(['type', 'latitude', 'longitude', 'description', 'timestamp'])"
      }
    }
  }
}
```

3. Click "Publish"

> **Note**: These rules allow anyone to read/write. For production, you'd add authentication.

## Step 5: Enable Cloud Storage

1. In the left sidebar, click "Build" → "Storage"
2. Click "Get started"
3. Start in **Test mode**
4. Click "Next"
5. Choose location: **Same as your database**
6. Click "Done"

## Step 6: Set Up Storage Security Rules

1. In Storage, click the "Rules" tab
2. Replace the rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /report-photos/{imageId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 7: Update Your App Configuration

1. Go back to the Firebase configuration page (from Step 2)
2. Copy your configuration object
3. Open `src/config/firebase.js` in your project
4. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 8: Test the Integration

1. Start your app: `npx expo start`
2. Create a test report with a photo
3. Check Firebase Console → Realtime Database to see your report
4. Check Firebase Console → Storage to see the uploaded photo

## Database Structure

Your reports in Firebase will look like this:

```
reports/
  ├── -NXxxx123xxx/
  │   ├── type: "Flood"
  │   ├── latitude: 1.3521
  │   ├── longitude: 103.8198
  │   ├── description: "Heavy flooding on Main Street"
  │   ├── timestamp: "2026-01-12T05:30:00.000Z"
  │   ├── photoUrl: "https://firebasestorage.googleapis.com/..."
  │   └── localId: 1
  └── -NXxxx456xxx/
      └── ...
```

## For Markers/Reviewers

If you're reviewing this project:

1. The Firebase configuration is already set up in `src/config/firebase.js`
2. Simply run `npm install` and `npx expo start`
3. The app will connect to the existing Firebase project
4. You can create reports and see them sync in real-time

## Troubleshooting

### "Permission denied" errors
- Check that your Database and Storage rules are set to test mode
- Verify the rules were published

### Photos not uploading
- Ensure Storage is enabled
- Check Storage rules allow write access
- Verify the storage bucket URL in firebase.js

### Reports not syncing
- Check internet connection
- Look at console logs for error messages
- Verify database URL in firebase.js is correct

### "Firebase app not initialized"
- Make sure you've replaced ALL placeholder values in firebase.js
- Restart the Expo dev server

## Security Notes

**IMPORTANT**: The current setup uses test mode rules that allow anyone to read/write data. This is fine for:
- Development
- Academic projects
- Demonstrations

For production deployment, you should:
1. Enable Firebase Authentication
2. Update security rules to require authentication
3. Add user-based access controls
4. Set up data validation rules

## Cost Considerations

Firebase free tier (Spark plan) includes:
- **Realtime Database**: 1GB storage, 10GB/month downloads
- **Cloud Storage**: 5GB storage, 1GB/day downloads
- **Authentication**: Unlimited users

This is more than sufficient for academic projects and small-scale deployments.
