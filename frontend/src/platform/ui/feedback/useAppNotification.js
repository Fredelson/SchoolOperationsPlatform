// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useAppNotification Hook
// ============================================
//
// Purpose:
// Provides access to the reusable platform
// snackbar notification system.
// ============================================

import { useContext } from "react";

import { AppNotificationContext } from "./AppNotificationProvider";

// ============================================
// Hook
// ============================================

export default function useAppNotification() {
  const context = useContext(AppNotificationContext);

  if (!context) {
    throw new Error(
      "useAppNotification must be used inside AppNotificationProvider."
    );
  }

  return context;
}