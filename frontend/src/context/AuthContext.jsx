// ============================================
// ARAB UNITY SCHOOL
// Authentication Context
//
// Purpose:
// - Handles login/logout
// - Stores authenticated user
// - Stores JWT token
// - Maintains session
//
// Temporary Notice:
// The Permission System is temporarily disabled
// while the dashboard foundation is being completed.
//
// Future Backend:
// - GET /api/permissions/me
// - Dynamic Role Permissions
// - Feature Flags
// - Module Permissions
// ============================================

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  changeCurrentPassword,
  loginUser,
  getCurrentUser,
} from "../services/authService";

// ============================================
// Context
// ============================================

const AuthContext = createContext(null);

// ============================================
// Provider
// ============================================

export function AuthProvider({ children }) {
  // ------------------------------------------
  // User Session
  // ------------------------------------------

  const [user, setUser] = useState(null);

  // ------------------------------------------
  // Temporary Permissions
  // (Frontend Only)
  // ------------------------------------------

  const [permissions, setPermissions] = useState([]);

  // ------------------------------------------
  // Authentication Token
  // ------------------------------------------

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // ------------------------------------------
  // Loading State
  // ------------------------------------------

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Temporary Permission Loader
  //
  // Backend permission APIs are disabled
  // until the Super Admin Permission Module
  // is implemented.
  // ==========================================

  const loadPermissions = useCallback(async (resolvedUser) => {
    setPermissions(resolvedUser?.permissions || []);
  }, []);

  // ==========================================
  // Load Logged-in User
  // ==========================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();

        setUser(currentUser);
        await loadPermissions(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);

        localStorage.removeItem("token");

        setToken(null);
        setUser(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, loadPermissions]);

  // ==========================================
  // Login
  // ==========================================

  const login = async (identifier, password) => {
    const data = await loginUser(identifier, password);

    localStorage.setItem("token", data.token);

    setToken(data.token);
    setUser(data.user);

    await loadPermissions(data.user);

    return data.user;
  };

  const completeRequiredPasswordChange = async ({
    currentPassword,
    newPassword,
  }) => {
    const response = await changeCurrentPassword({
      currentPassword,
      newPassword,
    });
    const refreshedToken = response?.data?.token || response?.token;

    if (refreshedToken) {
      localStorage.setItem("token", refreshedToken);
      setToken(refreshedToken);
    }

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    await loadPermissions(currentUser);

    return currentUser;
  };

  // ==========================================
  // Logout
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeWorkspace");
    localStorage.removeItem("activeWorkspaceId");
    localStorage.removeItem("previewMode");
    sessionStorage.removeItem("liveModeToken");
    sessionStorage.removeItem("liveModeSessionId");
    sessionStorage.removeItem("previewMode");
    sessionStorage.clear();

    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  // ==========================================
  // Context Provider
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        loading,

        login,
        completeRequiredPasswordChange,
        logout,

        reloadPermissions: () => loadPermissions(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
