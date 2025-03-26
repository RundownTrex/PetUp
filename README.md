# PetUp

## Pet Rehoming & Adoption Application with Pet Products Marketplace

PetUp is a comprehensive mobile application designed to connect pet owners who need to rehome their pets with potential adopters. The platform provides a humane alternative to shelters, allowing pets to transition directly from one loving home to another. Additionally, PetUp features a peer-to-peer marketplace for pet-related products and accessories.

![PetUp Logo](/frontend/assets/AppIcons/Logo.png)

## Features

- **Pet Rehoming**:

  - **Profile Management**: Create and manage user profiles
  - **Pet Listings**: Add detailed pet profiles with multiple images, descriptions, and care requirements
  - **Advanced Search**: Find pets based on location, species, breed, age, and other attributes
  - **Application Process**: Structured workflow for adoption applications
  - **Favorites System**: Save pets you're interested in adopting

- **Communication**:

  - **In-app Messaging**: Communicate directly with pet owners or potential adopters
  - **Real-time Notifications**: Get alerts for messages and application updates

- **Location Features**:

  - **Distance Calculation**: See pets and products available near your location
  - **Map Integration**: Get directions to pet owners or product sellers

- **Pet Products Marketplace**:

  - **Product Listings**: List pet accessories, food, toys, and other items for sale
  - **Category Filtering**: Browse products by pet type, category, and price range
  - **Price Sorting**: Sort items by price (low to high, high to low)
  - **Used Item Sales**: List and buy second-hand pet equipment

- **Knowledge Base**:
  - **Pet Care Resources**: Access training videos and care tips for different pet species

## Screenshots

<table>
  <tr>
    <td><img src="/frontend/screenshots/HomeScreen.png" width="200" alt="Home Screen"/></td>
    <td><img src="/frontend/screenshots/PetSearch.png" width="200" alt="Pet Search"/></td>
    <td><img src="/frontend/screenshots/Chat.png" width="200" alt="Chat"/></td>
  </tr>
  <tr>
    <td><img src="/frontend/screenshots/PetDetails.png" width="200" alt="Pet Details"/></td>
    <td><img src="/frontend/screenshots/Favourites.png" width="200" alt="Favourites"/></td>
    <td><img src="/frontend/screenshots/ProductSearch.png" width="200" alt="Product Search"/></td>
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
│   └── server.js           # Server entry point
│
└── README.md               # This file
```

## Running the App

- **Android Emulator**: Use Expo CLI commands or buttons in the Expo Developer Tools
- **Physical Device**: Connect the device via adb and execute the `npx expo run` command
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

Aditya Goriwale - [aditya.goriwale@gmail.com](mailto:aditya.goriwale@gmail.com)

Project Link: [https://github.com/RundownTrex/PetUp](https://github.com/RundownTrex/PetUp)
