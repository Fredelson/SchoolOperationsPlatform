// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Upload Middleware
// ============================================
//
// Purpose:
// Central reusable Multer upload middleware for
// all platform modules.
//
// Supports:
// - Printing request attachments
// - Branding media
// - Future IT asset files
// - Future helpdesk attachments
//
// Folder Strategy:
// Files are stored by module so uploads stay clean
// as the platform grows.
// ============================================

const fs = require("fs");
const multer = require("multer");
const path = require("path");

// ============================================
// RESOLVE UPLOAD DESTINATION
// ============================================
//
// Purpose:
// Chooses the correct upload folder based on the
// request URL and route parameter.
//
// Examples:
// /api/system/branding/logo
// → uploads/branding/logo
//
// /api/system/branding/favicon
// → uploads/branding/favicon
//
// /api/uploads/request-attachment
// → uploads/printing/attachments
// ============================================

const resolveUploadDestination = (req) => {
  const url = req.originalUrl || "";

  if (url.includes("/system/branding")) {
    const brandingFolderMap = {
      logo: "logo",
      smallLogo: "small-logo",
      darkLogo: "dark-logo",
      favicon: "favicon",
      loginBackground: "login-background",
    };

    const folderName = brandingFolderMap[req.params?.fileType] || "general";

    return path.join("uploads", "branding", folderName);
  }

  if (url.includes("/uploads/count-pages")) {
    return path.join("uploads", "temp");
  }

  if (url.includes("/uploads/request-attachment")) {
    return path.join("uploads", "printing", "attachments");
  }

  return path.join("uploads", "general");
};

// ============================================
// MULTER STORAGE
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = resolveUploadDestination(req);

    fs.mkdirSync(destination, { recursive: true });

    cb(null, destination);
  },

  filename: (req, file, cb) => {
    const safeExtension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      safeExtension;

    cb(null, uniqueName);
  },
});

// ============================================
// FILE TYPE FILTER
// ============================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only PDF, DOCX, PPTX, JPG, PNG, WEBP, SVG, and ICO files are allowed"
    ),
    false
  );
};

// ============================================
// EXPORT MULTER INSTANCE
// ============================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

module.exports = upload;