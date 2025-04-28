# WhatTheFi - WiFi Usage Tracking App 📱

WhatTheFi is a mobile application built with Expo and React Native that helps you track and manage your WiFi usage, specially designed for IUT hall residents.

## Features

- Track daily/monthly WiFi usage
- Set usage thresholds and receive notifications
- Customize reset days for billing cycles
- Clean and intuitive user interface
- Cross-platform (iOS and Android)
- Optimized for IUT hall network monitoring

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/what_the_fi.git
   cd what_the_fi
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## Development

This project uses:
- [Expo](https://expo.dev) for cross-platform development
- [NativeWind](https://nativewind.dev) (TailwindCSS) for styling
- [Expo Router](https://docs.expo.dev/router/introduction) for file-based navigation
- TypeScript for type safety

### Project Structure

- `/app` - Main application code with file-based routing
- `/assets` - Images, fonts, and other static assets
- `/components` - Reusable UI components
- `/constants` - App constants and data

## Running on Device [WILL BE UPDATED SOON]

- Install [Expo Go](https://expo.dev/go) on your mobile device
- Scan the QR code from the terminal after running `npx expo start`
- Alternatively, use an emulator with `--ios` or `--android` flag

## Build & Deploy

To create a production build:

```bash
npx expo prebuild
npx expo build:android
npx expo build:ios
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
