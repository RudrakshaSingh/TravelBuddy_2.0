import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import CompleteRegistration from "./pages/User/completeRegistration";
import ProfilePage from "./pages/User/profile";
import HomePage from "./pages/userHome";
import Layout from "./components/layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route
          path="complete-registration"
          element={
            <>
              <SignedIn>
                <CompleteRegistration />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
        <Route
          path="profile"
          element={
            <>
              <SignedIn>
                <ProfilePage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

