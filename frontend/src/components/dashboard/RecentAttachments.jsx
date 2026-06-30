// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Reusable Recent Attachments Component
//
// Purpose:
// Displays recently uploaded attachments.
//
// Reusable:
// - Teacher Dashboard
// - Printing Admin Dashboard
// - Super Admin Dashboard
// - Future modules
//
// Notes:
// - Data is passed from the parent page.
// - No hardcoded imports.
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import DownloadIcon from "@mui/icons-material/Download";

import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// File Icon Helper
//
// Returns the correct icon based on file type.
// ============================================

const getFileIcon = (type) => {
  switch (type?.toUpperCase()) {
    case "PDF":
      return (
        <PictureAsPdfIcon
          sx={{ color: dashboardColors.danger }}
        />
      );

    case "DOC":
    case "DOCX":
      return (
        <DescriptionIcon
          sx={{ color: dashboardColors.info }}
        />
      );

    case "PNG":
    case "JPG":
    case "JPEG":
      return (
        <ImageIcon
          sx={{ color: dashboardColors.success }}
        />
      );

    case "PPT":
    case "PPTX":
      return (
        <SlideshowIcon
          sx={{ color: dashboardColors.warning }}
        />
      );

    default:
      return (
        <DescriptionIcon
          sx={{ color: dashboardColors.textSecondary }}
        />
      );
  }
};

// ============================================
// Component
// ============================================

export default function RecentAttachments({
  items = [],
  title = "Recent Attachments",
  showViewAll = true,
  onViewAll,
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 900,
              color: dashboardColors.navy,
            }}
          >
            {title}
          </Typography>

          {showViewAll && (
            <Button
              size="small"
              variant="outlined"
              onClick={onViewAll}
            >
              View All
            </Button>
          )}
        </Box>

        {/* ==========================================
            Empty State
        ========================================== */}

        {items.length === 0 && (
          <Typography
            sx={{
              textAlign: "center",
              color: dashboardColors.textSecondary,
              py: 4,
            }}
          >
            No attachments found.
          </Typography>
        )}

        {/* ==========================================
            Attachment List
        ========================================== */}

        {items.map((file, index) => (
          <Box key={file.id ?? index}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
                py: 1.5,
              }}
            >
              {/* File Information */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                {getFileIcon(file.type)}

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontWeight: 700,
                      color: dashboardColors.textPrimary,
                    }}
                  >
                    {file.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: dashboardColors.textSecondary,
                    }}
                  >
                    {file.size} • {file.uploadedDate}
                  </Typography>
                </Box>
              </Box>

              {/* File Actions */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Chip
                  label={file.type}
                  size="small"
                  variant="outlined"
                />

                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  Download
                </Button>
              </Box>
            </Box>

            {index !== items.length - 1 && <Divider />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
