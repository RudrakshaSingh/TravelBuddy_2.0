import './index.css';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx';
import store from './redux/store.js';
import { ClerkProvider } from "@clerk/clerk-react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider 
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    afterSignInUrl="/complete-registration"
    afterSignUpUrl="/complete-registration"
  >
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </Provider>
  </ClerkProvider>
);
