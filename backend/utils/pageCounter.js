// ============================================
// ARAB UNITY SCHOOL
// Page Counter Utility
// Counts PDF / DOCX / PPTX pages
// ============================================

const fs = require("fs");
const AdmZip = require("adm-zip");
const libre = require("libreoffice-convert");
const { promisify } = require("util");

const convertAsync = promisify(libre.convert);
const SOFFICE_PATH =
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

// ============================================
// Count PDF pages from buffer
// ============================================

const countPdfPagesFromBuffer = async (buffer) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjs.getDocument({
    data: uint8Array,
  });

  const pdf = await loadingTask.promise;

  return pdf.numPages || 1;
};

// ============================================
// Count pages from uploaded file
// PDF  = exact page count
// DOCX = convert to PDF, then count PDF pages
// PPTX = slide count
// ============================================

const countPages = async (filePath, originalName) => {
  try {
    const fileName = originalName.toLowerCase();

    // PDF exact page count
    if (fileName.endsWith(".pdf")) {
      const buffer = fs.readFileSync(filePath);
      return await countPdfPagesFromBuffer(buffer);
    }

    // DOCX accurate page count by converting to PDF first
    if (fileName.endsWith(".docx")) {
      const docxBuffer = fs.readFileSync(filePath);

      const pdfBuffer = await convertAsync(
        docxBuffer,
        ".pdf",
        undefined
      );

      return await countPdfPagesFromBuffer(pdfBuffer);
    }

    // PPTX slide count
    if (fileName.endsWith(".pptx")) {
      const zip = new AdmZip(filePath);

      const slides = zip
        .getEntries()
        .filter((entry) =>
          /^ppt\/slides\/slide\d+\.xml$/.test(entry.entryName)
        );

      return Math.max(1, slides.length);
    }

    // ============================================
    // IMAGE count
    // JPG / JPEG / PNG = 1 page
    // ============================================

    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      return 1;
    }

    return 1;
  } catch (error) {
    console.error("Page Count Error:", error);
    return 1;
  }
};

module.exports = {
  countPages,
};