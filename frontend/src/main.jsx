// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Main React Entry Point
// ============================================
//
// Purpose:
// Application bootstrap and global providers.
//
// Provider Order:
// BrowserRouter
// AuthProvider
// PermissionProvider
// FeatureFlagProvider
// BrandingProvider
// PlatformThemeProvider
// ============================================

import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { FeatureFlagProvider } from "./providers/FeatureFlagProvider";
import { BrandingProvider } from "./modules/system/context/BrandingContext";
import PlatformThemeProvider from "./theme/provider/PlatformThemeProvider";
import { AppNotificationProvider } from "./platform/ui/feedback/AppNotificationProvider";


import "./index.css";

if (window.location.hash.startsWith("#liveToken=")) {
  sessionStorage.setItem("liveModeToken", decodeURIComponent(window.location.hash.slice(11)));
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

// ============================================
// Render Application
// ============================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <FeatureFlagProvider>
            <BrandingProvider>
              <PlatformThemeProvider>
                <AppNotificationProvider>
                  <App />
                </AppNotificationProvider>
              </PlatformThemeProvider>
            </BrandingProvider>
          </FeatureFlagProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
