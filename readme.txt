npx expo start
# Mobile App

This project is a React Native application built with Expo.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- Expo Go app on your physical device (iOS or Android) if testing on a real device.
- For running on emulators, you will need [Android Studio](https://developer.android.com/studio) (Android) or [Xcode](https://developer.apple.com/xcode/) (iOS/macOS only).

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <project folder which have the src, assets folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

Please use Expo Go 2.32.19
## Running the App Locally

Start the Expo development server:

```bash
npm start
# or
npx expo start
```


To kill expo
taskkill /IM node.exe /F

This will run the Metro Bundler in your terminal. From there, you can:
- **Run on an Android emulator**: Press `a`.
- **Run on an iOS simulator**: Press `i`.
- **Run on the web**: Press `w`.
- **Run on a physical device**: Open the **Expo Go** app on your phone and scan the QR code displayed in the terminal.

## Project Structure

- `src/screens/` - Contains the UI screens of the application.
- `src/navigation/` - Contains the app navigation (Tab Navigators, Stack Navigators).
- `src/services/` - Contains logic for connecting to databases (Firebase, etc.).
- `src/utils/` - Utility functions, themes, and constants.
- `App.js` - The main entry point of the React Native application.


If you're reviewing this project (for firebase):

1. The Firebase configuration is already set up in `src/config/firebase.js`
2. Simply run `npm install`(if there is no node modules) and `npx expo start`
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

**IMPORTANT**: The current setup uses test mode rules that allow anyone to read/write data. 


