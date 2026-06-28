// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Media Card
// ============================================
//
// Purpose:
// Manages school branding media uploads such as
// logo, small logo, dark logo, favicon, and login
// background using the existing branding API.
// ============================================

import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import UploadIcon from "@mui/icons-material/Upload";

import { AppButton, AppSection } from "../../../../platform/ui";
import { uploadBrandingFile } from "../../services/brandingService";

// ============================================
// API FILE URL HELPER
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const buildFileUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  const normalizedPath = path.replaceAll("\\", "/");

  if (normalizedPath.startsWith("/uploads")) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}/${normalizedPath}`;
};

// ============================================
// BRANDING MEDIA ITEMS
// ============================================

// ============================================
// BRANDING MEDIA ITEMS
// ============================================

const MEDIA_ITEMS = [
  {
    key: "logo",
    label: "Topbar Logo",
    description: "Logo displayed in the platform header.",
    pathKey: "logoPath",
    accept: "image/png,image/jpeg,image/jpg,image/svg+xml",
  },
  {
    key: "smallLogo",
    label: "Login Logo",
    description: "Logo displayed on the login page.",
    pathKey: "smallLogoPath",
    accept: "image/png,image/jpeg,image/jpg,image/svg+xml",
  },
  {
    key: "darkLogo",
    label: "Next Update",
    description: "Next Update",
    pathKey: "darkLogoPath",
    accept: "image/png,image/jpeg,image/jpg,image/svg+xml",
  },
  {
    key: "favicon",
    label: "Favicon",
    description: "Browser tab icon.",
    pathKey: "faviconPath",
    accept: "image/png,image/x-icon,image/vnd.microsoft.icon",
  },
  {
    key: "loginBackground",
    label: "Login Background",
    description: "Background image for the login page.",
    pathKey: "loginBackgroundPath",
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    wide: true,
  },
];

// ============================================
// COMPONENT
// ============================================

export default function BrandingMediaCard({ branding, refreshBranding }) {
  const brandingData = branding?.branding || {};

  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previews = useMemo(() => {
    const result = {};

    MEDIA_ITEMS.forEach((item) => {
      const selectedFile = selectedFiles[item.key];

      if (selectedFile) {
        result[item.key] = URL.createObjectURL(selectedFile);
        return;
      }

      result[item.key] = buildFileUrl(brandingData[item.pathKey]);
    });

    return result;
  }, [selectedFiles, brandingData]);

  const handleFileChange = (fileType, file) => {
    setMessage("");
    setError("");

    if (!file) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  const handleUpload = async (fileType) => {
    const file = selectedFiles[fileType];

    if (!file) {
      setError("Please choose a file before uploading.");
      return;
    }

    try {
      setUploadingKey(fileType);
      setError("");
      setMessage("");

      await uploadBrandingFile(fileType, file);
      await refreshBranding();

      setSelectedFiles((prev) => ({
        ...prev,
        [fileType]: null,
      }));

      setMessage("Branding media uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to upload branding media. Please try again."
      );
    } finally {
      setUploadingKey("");
    }
  };

  return (
    <AppSection
      title="Branding Media"
      subtitle="Upload logos, favicon, and login background used across the platform."
    >
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 2,
          }}
        >
          {MEDIA_ITEMS.map((item) => {
            const previewUrl = previews[item.key];
            const selectedFile = selectedFiles[item.key];
            const isUploading = uploadingKey === item.key;

            return (
              <Box
                key={item.key}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2,
                  gridColumn: item.wide ? { xs: "auto", md: "1 / -1" } : "auto",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {item.wide ? (
                      <Box
                        sx={{
                          width: 180,
                          height: 90,
                          borderRadius: 3,
                          bgcolor: "background.default",
                          border: "1px dashed",
                          borderColor: "divider",
                          backgroundImage: previewUrl
                            ? `url(${previewUrl})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {!previewUrl && <ImageIcon color="disabled" />}
                      </Box>
                    ) : (
                      <Avatar
                        variant="rounded"
                        src={previewUrl || undefined}
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <ImageIcon />
                      </Avatar>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900}>{item.label}</Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {item.description}
                      </Typography>

                      {selectedFile && (
                        <Typography
                          fontSize={12}
                          color="primary"
                          sx={{ mt: 0.5 }}
                          noWrap
                        >
                          Selected: {selectedFile.name}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <AppButton variant="outlined" component="label">
                      Choose File
                      <input
                        hidden
                        type="file"
                        accept={item.accept}
                        onChange={(event) =>
                          handleFileChange(item.key, event.target.files?.[0])
                        }
                      />
                    </AppButton>

                    <AppButton
                      startIcon={
                        isUploading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                      disabled={!selectedFile || isUploading}
                      onClick={() => handleUpload(item.key)}
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </AppButton>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Stack>
    </AppSection>
  );
}