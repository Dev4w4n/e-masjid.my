import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@masjid-suite/auth";
import { MasjidThemeProvider } from "./ui/theme";
import App from "./App.tsx";
import "./index.css";

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
  </React.StrictMode>,
);
