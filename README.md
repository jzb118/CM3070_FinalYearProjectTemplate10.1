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
   cd mobileapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables (If any):**
   - Create a `.env` file in the root directory if you need to set up Firebase or other API keys locally.

## Running the App Locally

Start the Expo development server:

```bash
npm start
# or
npx expo start
```

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
