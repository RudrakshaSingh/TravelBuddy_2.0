import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import HomePage from "./pages/userHome";
import Layout from "./components/layout";

function App() {
  return (
    <Routes >
     <Route path="/" element={<Layout />} >
       <Route index element={<HomePage />} />
       <Route path="sign-up/*" element={<SignUpPage />} />
       <Route path="sign-in/*" element={<SignInPage />} />
     </Route>
    </Routes>
  );
}

export default App;
