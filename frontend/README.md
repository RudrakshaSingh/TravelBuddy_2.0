# Travel Buddy 2.0 - Frontend

This directory contains the React frontend for **Travel Buddy 2.0** 🌍✈️.

> **Note:** For the complete project documentation, including backend setup and architecture, please verify the root [README.md](../README.md).

## 🛠️ Tech Stack
*   **React 18+** with **Vite**
*   **Tailwind CSS** for styling
*   **Redux Toolkit** for state management
*   **Clerk** for authentication
*   **Google Maps API** for location services

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in this directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Run Development Server
```bash
npm run dev
```

## 📜 Scripts
*   `npm run dev`: Start the development server.
*   `npm run build`: Build for production.
*   `npm run lint`: Run ESLint.
*   `npm run preview`: Preview the production build locally.
