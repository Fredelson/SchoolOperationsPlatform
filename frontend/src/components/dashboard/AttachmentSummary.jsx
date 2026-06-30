// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Reusable Attachment Summary Component
//
// Purpose:
// Displays attachment statistics.
//
// Reusable:
// - Teacher Dashboard
// - HOD Dashboard
// - HOS Dashboard
// - Printing Admin Dashboard
// - Super Admin Dashboard
//
// Notes:
// - Data is supplied by the parent page.
// - No direct dashboard data imports.
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";
import StorageIcon from "@mui/icons-material/Storage";

import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Returns icon based on summary title
// ============================================

const getSummaryIcon = (title) => {
  if (title.includes("Documents")) return <InsertDriveFileIcon />;
  if (title.includes("Images")) return <ImageIcon />;
  if (title.includes("Downloads")) return <DownloadIcon />;
  if (title.includes("Storage")) return <StorageIcon />;

  return <InsertDriveFileIcon />;
};

// ============================================
// Component
// ============================================

export default function AttachmentSummary({
  items = [],
  storageUsage = 0,
  title = "Attachment Summary",
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${dashboardColors.border}`,
        background: `linear-gradient(
          180deg,
          ${dashboardColors.cardBackground} 0%,
          ${dashboardColors.background} 100%
        )`,
        boxShadow: `0 14px 35px ${dashboardColors.shadow}`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* ==========================================
            Header
        ========================================== */}

        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 900,
            color: dashboardColors.navy,
            mb: 3,
          }}
        >
          {title}
        </Typography>

        {/* ==========================================
            Summary Items
        ========================================== */}

        {items.map((item) => (
          <Box
            key={item.title}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            {/* Left Side */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 3,
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getSummaryIcon(item.title)}
              </Box>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: dashboardColors.textPrimary,
                }}
              >
                {item.title}
              </Typography>
            </Box>

            {/* Right Side */}

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: dashboardColors.textPrimary,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}

        {/* ==========================================
            Storage Usage
        ========================================== */}

        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: dashboardColors.textSecondary,
              }}
            >
              Storage Usage
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: dashboardColors.textPrimary,
              }}
            >
              {storageUsage}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={storageUsage}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: dashboardColors.border,

              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: dashboardColors.info,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
