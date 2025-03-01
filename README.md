# PetUp

## Pet Rehoming & Adoption Application

PetUp is a comprehensive mobile application designed to connect pet owners who need to rehome their pets with potential adopters. The platform provides a humane alternative to shelters, allowing pets to transition directly from one loving home to another.

![PetUp Logo](/frontend/assets/AppIcons/Logo.png)

## Features

- **Profile Management**: Create and manage user profiles with verification
- **Pet Listings**: Add detailed pet profiles with multiple images, descriptions, and care requirements
- **Advanced Search**: Find pets based on location, species, breed, age, and other attributes
- **In-app Messaging**: Communicate directly with pet owners or potential adopters
- **Favorites System**: Save pets you're interested in adopting
- **Real-time Notifications**: Get alerts for messages and application updates
- **Pet Care Resources**: Access training videos and care tips for different pet species
- **Distance Calculation**: See pets available near your location

## Screenshots

<table>
  <tr>
    <td><img src="path/to/screenshot1.png" width="200" alt="Home Screen"/></td>
    <td><img src="path/to/screenshot2.png" width="200" alt="Pet Listing"/></td>
    <td><img src="path/to/screenshot3.png" width="200" alt="Chat Interface"/></td>
  </tr>
  <tr>
    <td><img src="path/to/screenshot4.png" width="200" alt="Search Screen"/></td>
    <td><img src="path/to/screenshot5.png" width="200" alt="Profile Page"/></td>
    <td><img src="path/to/screenshot6.png" width="200" alt="Pet Details"/></td>
  </tr>
</table>

## Technologies Used

### Frontend

- **React Native**: Core framework for mobile app development
- **Expo**: Toolchain for React Native development
- **Firebase Authentication**: User authentication and management
- **Firebase Firestore**: Real-time database for app data
- **React Native Paper**: UI components library
- **Expo Location**: Location services for proximity features
- **React Native Gesture Handler**: Touch interactions
- **Geolib**: Geospatial calculations for distance features

### Backend

- **Node.js**: Server environment
- **Express**: Web application framework
- **Firebase Admin**: Server-side Firebase management
- **ImageKit**: Image storage and optimization
- **FCM (Firebase Cloud Messaging)**: Push notifications
- **Multer**: File upload handling

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- ImageKit account

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/PetUp.git
cd PetUp/frontend

# Install dependencies
npm install

# Create .env file with your environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start the development server
npx expo run:android
```

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Create .env file with your environment variables
cp .env.example .env
# Edit .env with your Firebase Admin, ImageKit credentials

# Start the server
npm run dev
```

## Project Structure

```
PetUp/
├── frontend/               # React Native Expo app
│   ├── app/                # App screens using Expo Router
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable components
│   └── utils/              # Helper functions and utilities
│
├── backend/                # Node.js server
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   └── server.js           # Server entry point
│
└── README.md               # This file
```

## Running the App

- **Android Simulator**: Use Expo CLI commands or buttons in the Expo Developer Tools
- **Physical Device**: Scan the QR code with the Expo Go app
- **Backend**: The server needs to be running for full functionality

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Your Name - [aditya.goriwale@gmail.com](mailto:your.email@example.com)

Project Link: [https://github.com/RundownTrex/PetUp](https://github.com/yourusername/PetUp)
