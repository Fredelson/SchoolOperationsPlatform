// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Audit Logs Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to review
// important system actions and user activity.
//
// Responsibilities:
// - Display audit log entries
// - Show actor, action, module, and time
// - Prepare future filtering and export
// - Support security and accountability
//
// Future Enhancements:
// - Backend audit log API
// - Date range filter
// - User/module/action filters
// - Export audit logs
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

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Audit Log Data
// Later this will come from backend database
// ============================================

const auditLogs = [
  {
    actor: "Super Admin",
    module: "Users",
    action: "Created user",
    time: "Today 08:30 AM",
    severity: "Info",
  },
  {
    actor: "Printing Admin",
    module: "Printing",
    action: "Completed print request",
    time: "Today 09:15 AM",
    severity: "Success",
  },
  {
    actor: "System",
    module: "Security",
    action: "Failed login attempt",
    time: "Today 10:02 AM",
    severity: "Warning",
  },
];

// ============================================
// Audit Logs Component
// ============================================

export default function AuditLogs() {
  usePageTitle("AUS | Audit Logs");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Audit Logs
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Review user actions, security events, and system activity.
        </Typography>
      </Box>

      {/* Audit Logs Table */}
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
                  <b>Actor</b>
                </TableCell>

                <TableCell>
                  <b>Module</b>
                </TableCell>

                <TableCell>
                  <b>Action</b>
                </TableCell>

                <TableCell>
                  <b>Time</b>
                </TableCell>

                <TableCell>
                  <b>Severity</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {auditLogs.map((log, index) => (
                <TableRow key={`${log.actor}-${log.action}-${index}`} hover>
                  <TableCell>{log.actor}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={log.module}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>{log.action}</TableCell>

                  <TableCell>{log.time}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={log.severity}
                      color={
                        log.severity === "Success"
                          ? "success"
                          : log.severity === "Warning"
                          ? "warning"
                          : "default"
                      }
                    />
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
