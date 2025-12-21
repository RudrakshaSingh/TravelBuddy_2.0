# Travel Buddy 2.0 🌍✈️

Travel Buddy 2.0 is your ultimate travel companion application, designed to connect travelers, simplify trip planning, and discover the world around you. Built with a modern tech stack, it offers real-time interaction, interactive maps, and AI-powered features to make every journey memorable.

## ✨ Key Features

*   **👥 User Authentication**: Secure and seamless sign-up/login using **Clerk**.
*   **🗺️ Interactive Maps**:
    *   Find **Nearby Hotels**, **Tourist Places**, and **Restaurants**.
    *   Locate fellow travelers in your vicinity.
    *   Powered by **Google Maps API**.
*   **💬 Real-Time Chat**: Connect instantly with other travelers using **Socket.io**.
*   **📝 Activity Management**:
    *   Create and manage travel activities.
    *   **AI-Generated Descriptions**: Automatically generate improved descriptions for your activities using **Google Gemini** or **Grok**.
*   **💳 Premium Subscription**: Unlock exclusive features with secure payments via **Cashfree**.
*   **🎨 Modern UI/UX**:
    *   Responsive design with **Tailwind CSS**.
    *   Dark mode and Glassmorphism aesthetics.
    *   Fluid animations and interactive elements.
*   **📸 Media Sharing**: Upload and manage profile and activity photos/videos using **Cloudinary**.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18+ (Vite)
*   **Language**: JavaScript / JSX
*   **State Management**: Redux Toolkit & React Context
*   **Styling**: Tailwind CSS (v4), Lucide React (Icons)
*   **Authentication**: Clerk SDK
*   **Maps**: @react-google-maps/api
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB (with Mongoose ODM)
*   **Real-Time Communication**: Socket.io
*   **File Storage**: Cloudinary
*   **Data Validation**: Zod
*   **AI Integration**: Google Generative AI (Gemini), OpenAI API (compatible with Grok)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
*   **Node.js** (v18 or higher recommended)
*   **MongoDB** (Local instance or Atlas connection string)
*   **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/Raturi-Sahil/TravelBuddy_2.0.git
cd TravelBuddy_2.0
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory based on `.env.sample`. You will need keys for the following services:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST # or PROD

# AI Services
GEMINI_KEY=your_gemini_api_key
# or for Grok/OpenAI
XAI_API_KEY=your_xai_key

# Google Maps (Backend logic if any)
GOOGLE_PLACES_API_KEY=your_google_places_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# Add Google Maps Key if required by the frontend context
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Start the frontend development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 📂 Project Structure

```
TravelBuddy_2.0/
├── backend/                # Node.js/Express Backend
│   ├── controller/         # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares (Auth, Error)
│   ├── utils/              # Utility functions
│   ├── validation/         # Zod schemas
│   └── server.ts           # Entry point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── redux/          # State management
│   │   ├── context/        # React Context (Socket, Maps)
│   │   └── api/            # API service calls
│   └── index.html
│
└── README.md               # Project Documentation
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Travel Buddy, please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
