import { Navigate,Route, Routes } from "react-router-dom";

import AuthGuard from "./components/AuthGuard";
import Layout from "./components/layout";
import NearByTravellers from "./components/NearByTravellers";
import NearHotels from "./components/NearHotels";
import TouristPlaces from "./components/TouristPlaces";
import AboutUs from "./pages/aboutUs";
import BuySubscription from "./pages/Activity/buySubscription";
import CreateActivity from "./pages/Activity/createActivity";
import ActivityNearMe from "./pages/Activity/getNearByActivity";
import PaymentStatus from "./pages/paymentStatus";
import CompleteRegistration from "./pages/User/completeRegistration";
import ProfilePage from "./pages/User/profile";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import HomePage from "./pages/userHome";

function App() {
  return (
    <Routes >
     <Route path="/" element={<Layout />} >
       <Route index element={
         <AuthGuard>
           <HomePage />
         </AuthGuard>
       } />
       <Route path="sign-up/*" element={<SignUpPage />} />
       <Route path="sign-in/*" element={<SignInPage />} />
       <Route path="profile" element={
         <AuthGuard>
           <ProfilePage />
         </AuthGuard>
       } />
       <Route path="complete-registration" element={<CompleteRegistration />} />
       <Route path="about-us" element={<AboutUs />} />

       {/* Map Routes */}
       <Route path="map" element={<AuthGuard><NearByTravellers /></AuthGuard>} />
       <Route path="map/hotels" element={<AuthGuard><NearHotels /></AuthGuard>} />
       <Route path="map/tourist-places" element={<AuthGuard><TouristPlaces /></AuthGuard>} />

       {/* Activity Routes */}
       <Route path="create-activity" element={<AuthGuard><CreateActivity /></AuthGuard>} />
       <Route path="activities" element={<AuthGuard><ActivityNearMe /></AuthGuard>} />
       <Route path="subscription" element={<AuthGuard><BuySubscription /></AuthGuard>} />
       <Route path="payment-status" element={<AuthGuard><PaymentStatus /></AuthGuard>} />
     </Route>
    </Routes>
  );
}

export default App;

