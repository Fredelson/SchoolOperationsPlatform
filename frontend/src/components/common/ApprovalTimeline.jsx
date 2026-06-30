// ============================================
// ARAB UNITY SCHOOL
// Reusable Approval Timeline
// Used by Teacher, HOD, HOS, and Admin request detail pages
// ============================================

import { Box, Typography, Divider } from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const getStepIcon = (status) => {
  if (status === "Completed" || status === "Approved") {
    return <CheckCircleIcon sx={{ color: "#10B981" }} />;
  }

  if (status === "Pending") {
    return <PendingIcon sx={{ color: "#F59E0B" }} />;
  }

  return <RadioButtonUncheckedIcon sx={{ color: "#94A3B8" }} />;
};

export default function ApprovalTimeline({ steps = [] }) {
  return (
    <Box>
      {steps.map((item, index) => (
        <Box key={item.step}>
          {/* Timeline Item */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 2,
            }}
          >
            {/* Status Icon */}
            {getStepIcon(item.status)}

            {/* Step Details */}
            <Box>
              <Typography fontWeight={700}>{item.step}</Typography>

              <Typography
                color="text.secondary"
                fontSize={13}
              >
                {item.remarks}
              </Typography>
            </Box>
          </Box>

          {/* Divider between steps */}
          {index !== steps.length - 1 && (
            <Divider sx={{ mb: 2 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}
