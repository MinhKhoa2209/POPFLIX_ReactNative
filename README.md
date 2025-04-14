# Popflix 🎬

A modern mobile movie app built with **Expo**, **React Native**, **Appwrite**, **TypeScript**, and **Tailwind CSS**.

> 📱 This project uses a **development build** for advanced native module support.  
> 🎥 Movie data is fetched from the **KKPhim API** ([phimapi.com](https://phimapi.com)).

---

## 🛠️ Technologies Used

- **Expo**: Easier development & deployment for React Native apps.
- **React Native**: Build native apps using React.
- **Appwrite**: Handles authentication and backend services.
- **TypeScript**: Type-safe JavaScript.
- **Tailwind CSS**: Utility-first CSS for rapid styling (via NativeWind).

---

## 📦 Prerequisites

Make sure you have:

- **Node.js** (LTS)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Appwrite Server** (or Appwrite Cloud)
- **Android Studio** or **Xcode** for simulators

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd movie_app
```

### 2. Install Dependencies
```bash
npm install
```



### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your Appwrite configuration:

```bash
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_ENDPOINT=https://your-appwrite-server.com/v1
APPWRITE_API_KEY=your_api_key
```

### 4. Start the Project

Run the Expo development server:

```bash
npx expo start
```

You will see options to:
- Open the app in a **development build**
- Run on an **Android emulator**
- Run on an **iOS simulator**
- Use **Expo Go** for testing on a physical device

### 5. Running on a Device or Emulator

- **On a physical device:**
  - Install the **Expo Go** app from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [Apple App Store](https://apps.apple.com/us/app/expo-go/id982107779)
  - Scan the QR code displayed in the terminal or web interface

- **On an emulator/simulator:**
  - Open **Android Studio** or **Xcode**
  - Ensure a virtual device is running
  - Select the emulator option from the Expo CLI menu

### 6. Reset the Project (if needed)

To start fresh, run:

```bash
npm run reset-project
```

This will move the starter code to the `app-example` directory and create a blank `app` directory for development.

## Project Structure

The project follows a modular and scalable structure:
├── app/
│   ├── auth/               # Auth screens & logic
│   ├── movies/             # Movie-related screens
│   ├── (tabs)/             # Tab navigation config
│   ├── _layout.tsx         # App layout and navigation structure
│   └── globals.css         # Global Tailwind styles
│
├── assets/                 # Images, fonts, icons
├── components/             # Shared UI components
├── constants/              # App constants (e.g., colors, configs)
├── interfaces/             # TypeScript interfaces & types
├── services/               # Appwrite + KKPhim API services
├── types/                  # Global TypeScript types
│
├── .env                    # Environment variables
├── app.json                # Expo config
├── eas.json                # EAS build config
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md


## Learn More

For more details on the technologies used:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Community & Support

- [Expo GitHub](https://github.com/expo/expo)
- [React Native GitHub](https://github.com/facebook/react-native)
- [Appwrite GitHub](https://github.com/appwrite/appwrite)
- [Expo Discord](https://chat.expo.dev)

Happy coding! 🚀

