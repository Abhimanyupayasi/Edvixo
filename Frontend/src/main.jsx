import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import store from "./store/store";
import { Provider } from 'react-redux'
import { BrowserRouter } from "react-router-dom"
import { maybeRedirectToSubsite } from './utils/subdomain'
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Client-side subdomain routing (e.g., myschool.abhimanyu.tech -> /public-site?site=myschool)
if (typeof window !== 'undefined') {
  try { maybeRedirectToSubsite(); } catch {}
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <Provider store={store}>
      <BrowserRouter>
      <App/>
      </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
);
