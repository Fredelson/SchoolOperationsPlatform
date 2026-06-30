// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppNotificationProvider
// ============================================
//
// Purpose:
// Reusable global snackbar notification provider.
// Use this across all modules for success/error/info messages.
//
// Usage:
// Wrap the app once in AppNotificationProvider.
// Then call useAppNotification() from any page/hook/component.
// ============================================

import { createContext, useCallback, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

export const AppNotificationContext = createContext(null);

const DEFAULT_NOTIFICATION = {
  open: false,
  message: "",
  severity: "success",
};

export function AppNotificationProvider({ children }) {
  const [notification, setNotification] = useState(DEFAULT_NOTIFICATION);

  const showNotification = useCallback((message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((current) => ({
      ...current,
      open: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      showSuccess: (message) => showNotification(message, "success"),
      showError: (message) => showNotification(message, "error"),
      showInfo: (message) => showNotification(message, "info"),
      showWarning: (message) => showNotification(message, "warning"),
    }),
    [showNotification]
  );

  return (
    <AppNotificationContext.Provider value={value}>
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={3500}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          variant="filled"
          severity={notification.severity}
          onClose={hideNotification}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppNotificationContext.Provider>
  );
}