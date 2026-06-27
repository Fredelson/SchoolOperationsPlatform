// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Upload Controller
//
// Purpose:
// - Count uploaded file pages
// - Save request attachment metadata
// - Support Multer upload flow
// ============================================

const fs = require("fs");

const { poolPromise, sql } = require("../../config/db");
const { countPages } = require("../../shared/utils/pageCounter");

exports.countUploadedPages = async (req, res) => {
  try {
    // ============================================
    // Validate uploaded file
    // ============================================

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // ============================================
    // Get uploaded file information from multer
    // ============================================

    const originalFileName = req.file.originalname;
    const storedFileName = req.file.filename;
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // ============================================
    // Debug uploaded file before counting
    // ============================================

    console.log("Counting File Path:", filePath);
    console.log("Counting Original Name:", originalFileName);
    console.log("Counting Stored Name:", storedFileName);
    console.log("Counting File Type:", fileType);

    // ============================================
    // Count pages/slides using helper
    // PDF  = exact page count
    // DOCX = estimated page count
    // PPTX = slide count
    // ============================================

    const pageCount = await countPages(filePath, originalFileName);

    // ============================================
    // Debug page count result
    // ============================================

    console.log("Detected Page Count:", pageCount);

    // ============================================
    // Optional cleanup
    // This route is only for counting before final submit
    // Final upload happens later in /request-attachment
    // ============================================

    fs.unlink(filePath, (error) => {
      if (error) {
        console.error("Temporary file cleanup error:", error.message);
      }
    });

    // ============================================
    // Return page count to frontend
    // ============================================

    return res.status(200).json({
      message: "Page count completed",
      fileName: originalFileName,
      pageCount: Number(pageCount) || 1,
    });
  } catch (error) {
    // ============================================
    // Handle page count error
    // ============================================

    console.error("Count Pages Error:", error);

    return res.status(500).json({
      message: "Failed to count pages",
      error: error.message,
    });
  }
};

// ============================================
// Upload Request Attachment
// POST /api/uploads/request-attachment
// Saves uploaded file info into RequestAttachments
// Also counts pages again before saving
// ============================================

exports.uploadRequestAttachment = async (req, res) => {
  try {
    // ============================================
    // Get form data from frontend
    // ============================================

    const {
      requestId,
      copies,
      documentName,
      paperSize,
      printType,
      printColor,
      pagesPerSheet,
      pageSelection,
      customPageRange,
      selectedPages,
      sheetsPerSet,
      totalSheets,
    } = req.body;

    if (!requestId) {
      return res.status(400).json({
        message: "Request ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // ============================================
    // Prepare file information from multer
    // ============================================

    const originalFileName = req.file.originalname;
    const storedFileName = req.file.filename;
    const filePath = `/uploads/${storedFileName}`;
    const physicalFilePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileSizeKB = req.file.size / 1024;

    // ============================================
    // Backend still counts pages again for safety
    // PageCount = real detected page count
    // ============================================

    const autoPageCount = await countPages(
      physicalFilePath,
      originalFileName
    );

    const finalPageCount = Number(autoPageCount) || 1;
    const finalCopies = Number(copies) || 1;

    // ============================================
    // Use frontend-calculated values if provided
    // because frontend already applied:
    // - custom pages
    // - pages per sheet
    // - back-to-back
    // - per-file rounding
    // ============================================

    const finalSelectedPages =
      Number(selectedPages) || finalPageCount;

    const finalSheetsPerSet =
      Number(sheetsPerSet) || finalSelectedPages;

    const finalTotalSheets =
      Number(totalSheets) || finalSheetsPerSet * finalCopies;

    console.log("Attachment Metadata:", {
      requestId,
      originalFileName,
      finalPageCount,
      finalSelectedPages,
      finalCopies,
      finalSheetsPerSet,
      finalTotalSheets,
      documentName,
      paperSize,
      printType,
      printColor,
      pagesPerSheet,
      pageSelection,
      customPageRange,
    });

    // ============================================
    // Save attachment information to MSSQL
    // ============================================

    const pool = await poolPromise;

    await pool
      .request()
      .input("RequestId", sql.Int, Number(requestId))
      .input("OriginalFileName", sql.NVarChar, originalFileName)
      .input("StoredFileName", sql.NVarChar, storedFileName)
      .input("FilePath", sql.NVarChar, filePath)
      .input("FileType", sql.NVarChar, fileType)
      .input("FileSizeKB", sql.Decimal(10, 2), fileSizeKB)
      .input("PageCount", sql.Int, finalPageCount)
      .input("Copies", sql.Int, finalCopies)
      .input("TotalSheets", sql.Int, finalTotalSheets)

      // New metadata
      .input("DocumentName", sql.NVarChar, documentName || null)
      .input("PaperSize", sql.NVarChar, paperSize || null)
      .input("PrintType", sql.NVarChar, printType || null)
      .input("PrintColor", sql.NVarChar, printColor || null)
      .input("PagesPerSheet", sql.Int, Number(pagesPerSheet) || 1)
      .input("PageSelection", sql.NVarChar, pageSelection || null)
      .input("CustomPageRange", sql.NVarChar, customPageRange || null)
      .input("SelectedPages", sql.Int, finalSelectedPages)
      .input("SheetsPerSet", sql.Int, finalSheetsPerSet)

      .query(`
        INSERT INTO RequestAttachments
        (
          RequestId,
          OriginalFileName,
          StoredFileName,
          FilePath,
          FileType,
          FileSizeKB,
          PageCount,
          Copies,
          TotalSheets,
          DocumentName,
          PaperSize,
          PrintType,
          PrintColor,
          PagesPerSheet,
          PageSelection,
          CustomPageRange,
          SelectedPages,
          SheetsPerSet
        )
        VALUES
        (
          @RequestId,
          @OriginalFileName,
          @StoredFileName,
          @FilePath,
          @FileType,
          @FileSizeKB,
          @PageCount,
          @Copies,
          @TotalSheets,
          @DocumentName,
          @PaperSize,
          @PrintType,
          @PrintColor,
          @PagesPerSheet,
          @PageSelection,
          @CustomPageRange,
          @SelectedPages,
          @SheetsPerSet
        )
      `);

    return res.status(201).json({
      message: "File uploaded successfully",
      file: {
        originalName: originalFileName,
        storedName: storedFileName,
        filePath,
        fileSizeKB: Math.round(fileSizeKB),
        fileType,
        pageCount: finalPageCount,
        selectedPages: finalSelectedPages,
        copies: finalCopies,
        sheetsPerSet: finalSheetsPerSet,
        totalSheets: finalTotalSheets,
        documentName,
        paperSize,
        printType,
        printColor,
        pagesPerSheet,
        pageSelection,
        customPageRange,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};
