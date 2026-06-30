// ============================================
// ARAB UNITY SCHOOL
// Photocopy Management System
// Teacher Dashboard
// Request Progress Tracker Component
// Connected to latest live request status
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// ============================================
// Build Progress Steps Based on Request Status
// ============================================

const buildProgressSteps = (status) => {
  const normalizedStatus = status || "";

  return [
    {
      label: "Submitted",
      description: "Request has been submitted by teacher",
      completed: true,
    },
    {
      label: "Pending HOD",
      description: "Waiting for HOD review and approval",
      completed:
        normalizedStatus.includes("HOD") ||
        normalizedStatus.includes("HOS") ||
        normalizedStatus.includes("Approved") ||
        normalizedStatus.includes("Completed"),
    },
    {
      label: "Pending HOS",
      description: "Waiting for HOS review and approval",
      completed:
        normalizedStatus.includes("HOS") ||
        normalizedStatus.includes("Approved") ||
        normalizedStatus.includes("Completed"),
    },
    {
      label: "Approved",
      description: "Request approved for printing",
      completed:
        normalizedStatus.includes("Approved") ||
        normalizedStatus.includes("Completed"),
    },
    {
      label: "Completed",
      description: "Request completed by printing team",
      completed: normalizedStatus.includes("Completed"),
    },
  ];
};

// ============================================
// Request Progress Tracker Component
// ============================================

export default function RequestProgressTracker({ request }) {
  const steps = request
    ? buildProgressSteps(request.Status)
    : [];

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Request Progress Tracker
          </Typography>

          <Chip
            label={request?.RequestNumber || "Latest"}
            size="small"
            color="primary"
          />
        </Box>

        {/* Empty State */}
        {!request ? (
          <Typography color="text.secondary" fontSize={14}>
            No recent request found.
          </Typography>
        ) : (
          <Box>
            {steps.map((step, index) => (
              <Box
                key={step.label}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  mb: index === steps.length - 1 ? 0 : 2,
                }}
              >
                {/* Step Icon */}
                <Box>
                  {step.completed ? (
                    <CheckCircleIcon
                      sx={{
                        color: "#10B981",
                        fontSize: 22,
                      }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{
                        color: "#94A3B8",
                        fontSize: 22,
                      }}
                    />
                  )}
                </Box>

                {/* Step Text */}
                <Box>
                  <Typography fontWeight={700} fontSize={14}>
                    {step.label}
                  </Typography>

                  <Typography color="text.secondary" fontSize={12}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
