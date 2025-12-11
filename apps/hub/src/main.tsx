import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@masjid-suite/auth";
import { MasjidThemeProvider } from "./ui/theme";
import App from "./App.tsx";
import "./index.css";

/**
 * Clear potentially corrupted Supabase auth tokens from localStorage.
 * This is a recovery mechanism for when the auth state becomes corrupted
 * and prevents the app from loading.
 */
function clearCorruptedAuthStorage() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    // Find and validate Supabase auth tokens
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes("-auth-token")) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // Check if the token structure is valid
            if (parsed && typeof parsed === "object") {
              // Check for expired access token
              if (parsed.expires_at) {
                const expiresAt = parsed.expires_at * 1000; // Convert to milliseconds
                const now = Date.now();
                // If token expired more than 7 days ago, clear it
                // (Supabase refresh tokens are typically valid for longer, but if
                // the app has been broken for days, better to clear and re-login)
                const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                if (now - expiresAt > sevenDaysInMs) {
                  console.warn(
                    `Auth token expired more than 7 days ago, clearing: ${key}`
                  );
                  localStorage.removeItem(key);
                }
              }
            }
          }
        } catch (parseError) {
          // If we can't parse the token, it's corrupted - remove it
          console.warn(`Corrupted auth token detected, clearing: ${key}`);
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("Error checking auth storage:", error);
  }
}

// Run auth storage check before React initializes
clearCorruptedAuthStorage();

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render the application with all providers
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MasjidThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MasjidThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
