// ============================================
// ARAB UNITY SCHOOL
// Login Page
// Connected to Backend Authentication
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ============================================
  // Redirect user based on role
  // ============================================
  const redirectByRole = (role) => {
    switch (role) {
      case "Teacher":
        navigate("/teacher");
        break;

      case "HOD":
        navigate("/hod");
        break;

      case "SuperAdmin":
        navigate("/teacher");
        break;

      case "Admin":
        navigate("/teacher");
        break;

      case "PrintingAdmin":
        navigate("/teacher");
        break;

      case "HOS":
        navigate("/teacher");
        break;

      default:
        navigate("/login");
    }
  };

  // ============================================
  // Handle Login
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const loggedUser = await login(
        employeeId.trim(),
        password.trim()
      );

      redirectByRole(loggedUser.role);
    } catch (err) {
      console.error(err);

      setError("Invalid employee ID or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: 500,
          borderRadius: 5,
          boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Title */}
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            ARAB UNITY SCHOOL
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              color: "#334155",
              mb: 3,
            }}
          >
            Photocopy Management System
          </Typography>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Employee ID"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                height: 55,
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              LOGIN
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}