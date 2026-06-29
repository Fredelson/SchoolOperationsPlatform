// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Permissions Matrix Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page will allow Super Admin to view and
// manage role-based permissions in matrix format.
//
// Responsibilities:
// - Display roles
// - Display modules/actions
// - Show permission access status
// - Prepare future permission assignment UI
//
// Future Enhancements:
// - Save permission changes
// - Role permission templates
// - Bulk permission assignment
// - Permission audit history
//
// ============================================

import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Permission Matrix Data
// Later this will come from backend database
// ============================================

const matrixRows = [
  {
    module: "Users",
    action: "View",
    superAdmin: true,
    printingAdmin: false,
    teacher: false,
  },
  {
    module: "Printing",
    action: "View",
    superAdmin: true,
    printingAdmin: true,
    teacher: true,
  },
  {
    module: "Reports",
    action: "Export",
    superAdmin: true,
    printingAdmin: true,
    teacher: false,
  },
];

// ============================================
// Permission Icon Helper
// ============================================

const PermissionIcon = ({ allowed }) => {
  if (allowed) {
    return <CheckCircleIcon color="success" />;
  }

  return <RadioButtonUncheckedIcon color="disabled" />;
};

// ============================================
// Permissions Matrix Component
// ============================================

export default function PermissionsMatrix() {
  usePageTitle("AUS | Permissions Matrix");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Permissions Matrix
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Manage access rules by role, module, and action.
        </Typography>
      </Box>

      {/* Matrix Table Card */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #e5e7eb",
          boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell>
                  <b>Module</b>
                </TableCell>

                <TableCell>
                  <b>Action</b>
                </TableCell>

                <TableCell align="center">
                  <b>Super Admin</b>
                </TableCell>

                <TableCell align="center">
                  <b>Printing Admin</b>
                </TableCell>

                <TableCell align="center">
                  <b>Teacher</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {matrixRows.map((row) => (
                <TableRow key={`${row.module}-${row.action}`} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.module}
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>{row.action}</TableCell>

                  <TableCell align="center">
                    <PermissionIcon allowed={row.superAdmin} />
                  </TableCell>

                  <TableCell align="center">
                    <PermissionIcon allowed={row.printingAdmin} />
                  </TableCell>

                  <TableCell align="center">
                    <PermissionIcon allowed={row.teacher} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
