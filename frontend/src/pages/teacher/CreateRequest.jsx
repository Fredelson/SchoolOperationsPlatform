// ============================================
// ARAB UNITY SCHOOL
// Teacher / HOD - Create Request Page
// Modern UI Version
// Supports:
// - Multiple files inside one document card
// - PDF / DOCX / PPTX / Image auto page counting
// - Copies applied to all files in one document card
// - Pages per sheet
// - All pages / Custom page range
// - Per-file sheet calculation
// ============================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import RouteIcon from "@mui/icons-material/Route";
import SummarizeIcon from "@mui/icons-material/Summarize";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import InfoIcon from "@mui/icons-material/Info";
import LayersIcon from "@mui/icons-material/Layers";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import usePageTitle from "../../hooks/usePageTitle";

import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================
// Empty document template
// One document card can contain multiple files.
// Copies and print settings apply to all files
// inside the same document card.
// ============================================

const createEmptyDocument = () => ({
  id: Date.now() + Math.random(),
  documentName: "",
  uploadType: "Office Document",
  files: [],
  copies: 1,
  paperSize: "A4",
  printType: "Single-Sided",
  printColor: "Black & White",
  pagesPerSheet: 1,
  pageSelection: "All Pages",
  customPageRange: "",
});

// ============================================
// File Helpers
// ============================================

const getFileExtension = (fileName = "") => {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
};

const isImageFileName = (fileName = "") => {
  const ext = getFileExtension(fileName);
  return ["jpg", "jpeg", "png"].includes(ext);
};

const getFileKind = (fileName = "") => {
  const ext = getFileExtension(fileName);

  if (["jpg", "jpeg", "png"].includes(ext)) return "Image File";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
    return "Office Document";
  }

  return "File";
};

const getFileIconColor = (fileName = "") => {
  const ext = getFileExtension(fileName);

  if (ext === "pdf") return "#DC2626";
  if (ext === "doc" || ext === "docx") return "#2563EB";
  if (ext === "ppt" || ext === "pptx") return "#EA580C";
  if (ext === "xls" || ext === "xlsx") return "#16A34A";
  if (["jpg", "jpeg", "png"].includes(ext)) return "#475569";

  return "#64748B";
};

// ============================================
// Custom Page Range Parser
// Examples:
// "1-3,5,8-10" = pages 1,2,3,5,8,9,10
// The result is capped to the real file page count.
// ============================================

const countCustomPages = (customRange, maxPages) => {
  if (!customRange || !maxPages) return maxPages;

  const selectedPages = new Set();
  const parts = customRange
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  parts.forEach((part) => {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);

      if (!Number.isFinite(start) || !Number.isFinite(end)) return;

      const from = Math.max(1, Math.min(start, end));
      const to = Math.min(maxPages, Math.max(start, end));

      for (let page = from; page <= to; page += 1) {
        selectedPages.add(page);
      }
    } else {
      const page = Number(part);

      if (Number.isFinite(page) && page >= 1 && page <= maxPages) {
        selectedPages.add(page);
      }
    }
  });

  return selectedPages.size > 0 ? selectedPages.size : maxPages;
};

// ============================================
// Selected pages for a file
// Page selection applies to all files in the card.
// ============================================

const getSelectedPagesForFile = (file, doc) => {
  const filePages = Number(file.pages) || 1;

  if (doc.pageSelection === "Custom Pages") {
    return countCustomPages(doc.customPageRange, filePages);
  }

  return filePages;
};

// ============================================
// Sheet calculation per file
// Correct rule:
// 1. Count selected pages
// 2. Apply pages per sheet
// 3. Apply back-to-back / double-sided
// 4. Multiply by copies
// ============================================

const getSheetsPerFile = (file, doc) => {
  const selectedPages = getSelectedPagesForFile(file, doc);
  const pagesPerSheet = Number(doc.pagesPerSheet) || 1;

  // Number of printed sides after pages-per-sheet.
  let printSides = Math.ceil(selectedPages / pagesPerSheet);

  // Back-to-back uses both sides of paper.
  if (doc.printType === "Double-Sided" || doc.printType === "Back-to-Back") {
    return Math.ceil(printSides / 2);
  }

  return printSides;
};

const getFileTotalSheets = (file, doc) => {
  const copies = Number(doc.copies) || 1;
  return getSheetsPerFile(file, doc) * copies;
};

const getDocumentTotals = (doc) => {
  const copies = Number(doc.copies) || 1;

  const totalPages = doc.files.reduce(
    (sum, file) => sum + (Number(file.pages) || 0),
    0
  );

  const selectedPagesPerSet = doc.files.reduce(
    (sum, file) => sum + getSelectedPagesForFile(file, doc),
    0
  );

  const sheetsPerSet = doc.files.reduce(
    (sum, file) => sum + getSheetsPerFile(file, doc),
    0
  );

  return {
    totalPages,
    selectedPagesPerSet,
    sheetsPerSet,
    totalSheets: sheetsPerSet * copies,
  };
};

// ============================================
// Main Component
// ============================================

export default function CreateRequest() {
  usePageTitle("CreateRequest");
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // ============================================
  // Logged-in user information
  // Supports camelCase and PascalCase values
  // ============================================

  const userRole = user?.role || user?.Role;
  const userDepartmentId = user?.departmentId || user?.DepartmentId;
  const userDepartmentName = user?.departmentName || user?.DepartmentName || "";

  const userPosition =
    user?.position || user?.Position || user?.roleName || user?.RoleName || "";

  const userSubject =
    user?.subject ||
    user?.Subject ||
    userPosition.replace(userDepartmentName, "").replace("HOD", "").trim();

  const isHOD = userRole === "HOD";

  const isSecondaryOrSixth =
    userDepartmentName === "Secondary" || userDepartmentName === "Sixth Form";

  const canChooseDepartment = !isHOD && isSecondaryOrSixth;

  // ============================================
  // Lookup Data
  // ============================================

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [purposes, setPurposes] = useState([]);

  // ============================================
  // Selected Request Values
  // ============================================

  const [departmentId, setDepartmentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [purposeId, setPurposeId] = useState("");

  // ============================================
  // Form State
  // ============================================

  const [customPurpose, setCustomPurpose] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [remarks, setRemarks] = useState("");
  const [documents, setDocuments] = useState([createEmptyDocument()]);

  // ============================================
  // Page State
  // ============================================

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // Load Departments, Subjects, and Purposes
  // ============================================

  useEffect(() => {
    const loadLookups = async () => {
      try {
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [deptRes, subjectRes, purposeRes] = await Promise.all([
          axios.get(`${API_URL}/lookups/departments`, { headers }),
          axios.get(`${API_URL}/lookups/subjects`, { headers }),
          axios.get(`${API_URL}/lookups/purposes`, { headers }),
        ]);

        setDepartments(deptRes.data);
        setSubjects(subjectRes.data);
        setPurposes(purposeRes.data);

        // ============================================
        // Default department
        // ============================================

        if (userDepartmentId) {
          setDepartmentId(userDepartmentId);
        } else if (deptRes.data.length > 0) {
          setDepartmentId(deptRes.data[0].DepartmentId);
        }

        // ============================================
        // Default subject
        // HOD subject is locked to their assigned subject
        // ============================================

        if (isHOD) {
          const hodSubject = subjectRes.data.find((subject) =>
            userSubject?.toLowerCase().includes(subject.SubjectName.toLowerCase())
          );

          if (hodSubject) {
            setSubjectId(hodSubject.SubjectId);
          } else if (subjectRes.data.length > 0) {
            setSubjectId(subjectRes.data[0].SubjectId);
          }
        } else if (subjectRes.data.length > 0) {
          setSubjectId(subjectRes.data[0].SubjectId);
        }

        // ============================================
        // Default purpose
        // ============================================

        if (purposeRes.data.length > 0) {
          setPurposeId(purposeRes.data[0].PurposeId);
        }
      } catch (err) {
        console.error("Lookup Load Error:", err);
        setError("Unable to load dropdown data.");
      }
    };

    loadLookups();
  }, [token, userDepartmentId, userDepartmentName, userSubject, isHOD]);

  // ============================================
  // Update One Document Field
  // ============================================

  const updateDocument = (id, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  // ============================================
  // Add New Document Card
  // ============================================

  const addDocument = () => {
    setDocuments((prev) => [...prev, createEmptyDocument()]);
  };

  // ============================================
  // Remove Document Card
  // Keeps at least one document
  // ============================================

  const removeDocument = (id) => {
    setDocuments((prev) =>
      prev.length === 1 ? prev : prev.filter((doc) => doc.id !== id)
    );
  };

  // ============================================
  // Remove one uploaded file from a document card
  // ============================================

  const removeFileFromDocument = (documentId, fileId) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              files: doc.files.filter((file) => file.id !== fileId),
            }
          : doc
      )
    );
  };

  // ============================================
  // Count one file using backend page counter
  // POST /api/uploads/count-pages
  // ============================================

  const countFilePages = async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/uploads/count-pages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return Number(response.data?.pageCount) || 1;
    };

    // ============================================
    // Handle Multiple File Selection
    // Each selected file is counted automatically and
    // saved inside the same document card.
    // ============================================

    const handleMultipleFileSelect = async (documentId, selectedFiles) => {
    const files = Array.from(selectedFiles || []);
    if (!files.length) return;

    const currentDocument = documents.find((doc) => doc.id === documentId);

    if (!currentDocument) return;

    const allowedOffice = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
    const allowedImages = ["jpg", "jpeg", "png"];

    const invalidFiles = files.filter((file) => {
      const ext = getFileExtension(file.name);

      if (currentDocument.uploadType === "Image File") {
        return !allowedImages.includes(ext);
      }

      return !allowedOffice.includes(ext);
    });

    if (invalidFiles.length > 0) {
      setError(
        currentDocument.uploadType === "Image File"
          ? "Please upload image files only: JPG, JPEG, or PNG."
          : "Please upload office documents only: PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX."
      );
      return;
    }

    try {

      // ============================================
      // Add temporary loading files immediately
      // so the teacher sees selected file names.
      // ============================================

      const tempFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        fileName: file.name,
        fileType: getFileKind(file.name),
        pages: isImageFileName(file.name) ? 1 : 1,
        isCounting: !isImageFileName(file.name),
      }));

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                files: [...doc.files, ...tempFiles],
              }
            : doc
        )
      );

      // ============================================
      // Count pages one by one.
      // Images are always 1 page.
      // Office files use the backend page counter.
      // ============================================

      for (const tempFile of tempFiles) {
        let detectedPages = 1;

        if (isImageFileName(tempFile.fileName)) {
          detectedPages = 1;
        } else {
          detectedPages = await countFilePages(tempFile.file);
        }

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  files: doc.files.map((file) =>
                    file.id === tempFile.id
                      ? {
                          ...file,
                          pages: detectedPages,
                          isCounting: false,
                        }
                      : file
                  ),
                }
              : doc
          )
        );
      }
    } catch (err) {
      console.error("Page Count Error:", err);
      console.log("PAGE COUNT BACKEND ERROR:", err.response?.data);
      setError("Some files could not be counted. They were set to 1 page.");

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                files: doc.files.map((file) => ({
                  ...file,
                  isCounting: false,
                  pages: Number(file.pages) || 1,
                })),
              }
            : doc
        )
      );
    }
  };

  // ============================================
  // Calculate Request Summary
  // The approval route should use total sheets,
  // because sheets determine the approval threshold.
  // ============================================

  const summary = useMemo(() => {
    return documents.reduce(
      (total, doc) => {
        const docTotals = getDocumentTotals(doc);

        return {
          totalPages: total.totalPages + docTotals.selectedPagesPerSet,
          totalSheets: total.totalSheets + docTotals.totalSheets,
          totalCopies: total.totalCopies + (Number(doc.copies) || 0),
          totalA4:
            total.totalA4 + (doc.paperSize === "A4" ? docTotals.totalSheets : 0),
          totalA3:
            total.totalA3 + (doc.paperSize === "A3" ? docTotals.totalSheets : 0),
        };
      },
      {
        totalPages: 0,
        totalSheets: 0,
        totalCopies: 0,
        totalA4: 0,
        totalA3: 0,
      }
    );
  }, [documents]);

  // ============================================
  // Selected Lookup Names for Summary
  // ============================================

  const selectedDepartmentName =
    departments.find((d) => Number(d.DepartmentId) === Number(departmentId))
      ?.DepartmentName || "Not selected";

  const selectedSubjectName =
    subjects.find((s) => Number(s.SubjectId) === Number(subjectId))?.SubjectName ||
    "Not selected";

  const selectedPurposeName =
    purposes.find((p) => Number(p.PurposeId) === Number(purposeId))?.PurposeName ||
    "Not selected";

  // ============================================
  // Approval Route Preview
  // ============================================

  const approvalFlow =
    userRole === "HOD"
      ? summary.totalSheets <= 500
        ? ["HOD", "Printing Admin"]
        : ["HOD", "HOS", "Printing Admin"]
      : summary.totalSheets <= 500
      ? ["Teacher", "HOD", "Printing Admin"]
      : ["Teacher", "HOD", "HOS", "Printing Admin"];

  // ============================================
  // Submit Request to Backend
  // Creates request first, then uploads all files
  // from every document card.
  // ============================================

  const handleSubmitRequest = async () => {
    try {
      setError("");

      // ============================================
      // Basic validation
      // ============================================

      if (!token) return setError("You are not logged in.");
      if (!departmentId) return setError("Department is required.");
      if (!subjectId) return setError("Subject is required.");
      if (!purposeId) return setError("Please select a purpose.");

      const totalUploadedFiles = documents.reduce(
        (sum, doc) => sum + doc.files.length,
        0
      );

      if (totalUploadedFiles === 0) {
        return setError("Please upload at least one file.");
      }

      if (summary.totalPages <= 0 || summary.totalSheets <= 0) {
        return setError("Total pages and sheets must be greater than zero.");
      }

      setSubmitting(true);

      const mainDocument = documents[0];

      // ============================================
      // Main request payload
      // Note:
      // Current backend PhotocopyRequests table stores one request-level
      // copies value. Since copies can now differ per document card,
      // the request-level copies uses the first document only.
      // The real per-file/per-card copies are uploaded with attachments.
      // ============================================

      const payload = {
        departmentId: Number(departmentId),
        subjectId: Number(subjectId),
        purposeId: Number(purposeId),
        copies: Number(mainDocument.copies) || 1,
        totalPages: summary.totalPages,
        totalSheets: summary.totalSheets,
        priorityLevel: priority,
      };

      console.log("REQUEST PAYLOAD:", payload);

      // ============================================
      // Step 1: Create photocopy request
      // POST /api/requests
      // ============================================

      const response = await axios.post(`${API_URL}/requests`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Request Created:", response.data);

      const createdRequestId = response.data.requestId;

      if (!createdRequestId) {
        throw new Error("Request was created but no requestId was returned.");
      }

      // ============================================
      // Step 2: Upload every file inside every document card
      // Saves into RequestAttachments.
      // This keeps your current backend upload endpoint working.
      // ============================================

      for (const doc of documents) {
        const docTotals = getDocumentTotals(doc);

        for (const uploadedFile of doc.files) {
          const fileSheetsPerSet = getSheetsPerFile(uploadedFile, doc);
          const fileTotalSheets = getFileTotalSheets(uploadedFile, doc);

          const formData = new FormData();

          formData.append("requestId", createdRequestId);
          formData.append("copies", Number(doc.copies) || 1);
          formData.append("file", uploadedFile.file);

          // ============================================
          // Extra metadata for future backend support.
          // If backend ignores these fields now, upload still works.
          // Later we can save them into RequestAttachments.
          // ============================================

          formData.append("documentName", doc.documentName || "");
          formData.append("paperSize", doc.paperSize);
          formData.append("printType", doc.printType);
          formData.append("printColor", doc.printColor);
          formData.append("pagesPerSheet", Number(doc.pagesPerSheet) || 1);
          formData.append("pageSelection", doc.pageSelection);
          formData.append("customPageRange", doc.customPageRange || "");
          formData.append("detectedPages", Number(uploadedFile.pages) || 1);
          formData.append(
            "selectedPages",
            getSelectedPagesForFile(uploadedFile, doc)
          );
          formData.append("sheetsPerSet", fileSheetsPerSet);
          formData.append("totalSheets", fileTotalSheets);
          formData.append("documentTotalSheets", docTotals.totalSheets);

          console.log("Uploading attachment:", {
            requestId: createdRequestId,
            fileName: uploadedFile.fileName,
            copies: Number(doc.copies) || 1,
            sheetsPerSet: fileSheetsPerSet,
            totalSheets: fileTotalSheets,
          });

          const uploadResponse = await axios.post(
            `${API_URL}/uploads/request-attachment`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("UPLOAD RESPONSE:", uploadResponse.data);
        }
      }

      // ============================================
      // Navigate after successful request + upload
      // ============================================

      if (userRole === "HOD") {
        navigate("/hod/my-requests");
      } else {
        navigate("/teacher/my-requests");
      }
    } catch (err) {
      console.error("Create Request Error:", err);
      console.log("BACKEND ERROR:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Page UI
  // Sidebar and Topbar stay unchanged
  // ============================================

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          userName={user?.fullName || user?.FullName || "User"}
          role={userRole || "User"}
        />
      }
    >
      <PageHeader
        title="Create New Photocopy Request"
        subtitle="Fill in the details below to submit a new photocopy request."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2.2fr 0.9fr",
          },
          gap: 3,
        }}
      >
        {/* Left Main Content */}
        <Box>
          <ModernStepper />

          <RequestInfoCard
            departments={departments}
            subjects={subjects}
            purposes={purposes}
            departmentId={departmentId}
            subjectId={subjectId}
            purposeId={purposeId}
            setDepartmentId={setDepartmentId}
            setSubjectId={setSubjectId}
            setPurposeId={setPurposeId}
            canChooseDepartment={canChooseDepartment}
            isHOD={isHOD}
            requiredDate={requiredDate}
            setRequiredDate={setRequiredDate}
            priority={priority}
            setPriority={setPriority}
            remarks={remarks}
            setRemarks={setRemarks}
            customPurpose={customPurpose}
            setCustomPurpose={setCustomPurpose}
          />

          <DocumentsCard
            documents={documents}
            addDocument={addDocument}
            removeDocument={removeDocument}
            removeFileFromDocument={removeFileFromDocument}
            updateDocument={updateDocument}
            handleMultipleFileSelect={handleMultipleFileSelect}
          />

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                userRole === "HOD"
                  ? navigate("/hod/my-requests")
                  : navigate("/teacher/my-requests")
              }
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmitRequest}
              disabled={submitting}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.2,
                bgcolor: "#0B8F4D",
                textTransform: "none",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#087A41",
                },
              }}
            >
              {submitting ? "Submitting..." : "Review & Submit"}
            </Button>
          </Box>
        </Box>

        {/* Right Sticky Summary */}
        <Box
          sx={{
            position: {
              xs: "static",
              lg: "sticky",
            },
            top: 24,
            alignSelf: "start",
          }}
        >
          <RequestSummaryCard
            selectedDepartmentName={selectedDepartmentName}
            selectedSubjectName={selectedSubjectName}
            selectedPurposeName={selectedPurposeName}
            summary={summary}
            priority={priority}
            requiredDate={requiredDate}
          />

          <ApprovalRouteCard approvalFlow={approvalFlow} />

          <ActionsCard
            submitting={submitting}
            handleSubmitRequest={handleSubmitRequest}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}

// ============================================
// Modern Stepper
// Visual only for now
// ============================================


function ModernStepper() {
  const steps = ["Request Information", "Documents", "Review & Submit"];

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 5,
        border: "1px solid #EAF0F7",
        bgcolor: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ py: 2.4, px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            alignItems: "start",
          }}
        >
          {steps.map((step, index) => {
            const active = index === 0;
            const completedLine = index === 0;

            return (
              <Box key={step} sx={{ position: "relative", textAlign: "center" }}>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 20,
                      left: "50%",
                      width: "100%",
                      height: 4,
                      borderRadius: 99,
                      bgcolor: completedLine ? "#10B981" : "#E2E8F0",
                      zIndex: 0,
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    mx: "auto",
                    bgcolor: active ? "linear-gradient(135deg, #16A34A, #059669)" : "#F8FAFC",
                    border: `2px solid ${active ? "#16A34A" : "#CBD5E1"}`,
                    color: active ? "#FFFFFF" : "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    boxShadow: active
                      ? "0 14px 30px rgba(22, 163, 74, 0.28)"
                      : "0 8px 20px rgba(15, 23, 42, 0.06)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </Box>

                <Typography
                  mt={1.2}
                  fontSize={{ xs: 11, sm: 13 }}
                  fontWeight={900}
                  color={active ? "#059669" : "#334155"}
                >
                  {step}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Request Information Card
// ============================================

function RequestInfoCard({
  departments,
  subjects,
  purposes,
  departmentId,
  subjectId,
  purposeId,
  setDepartmentId,
  setSubjectId,
  setPurposeId,
  canChooseDepartment,
  isHOD,
  requiredDate,
  setRequiredDate,
  priority,
  setPriority,
  remarks,
  setRemarks,
  customPurpose,
  setCustomPurpose,
}) {
  return (
    <ModernCard
      icon={<DescriptionIcon />}
      title="Request Information"
      subtitle="Provide accurate details for faster processing."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2.5,
        }}
      >
        <TextField
          select
          label="Department"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          disabled={!canChooseDepartment}
          fullWidth
        >
          {(canChooseDepartment
            ? departments.filter(
                (d) =>
                  d.DepartmentName === "Secondary" ||
                  d.DepartmentName === "Sixth Form"
              )
            : departments.filter(
                (d) => Number(d.DepartmentId) === Number(departmentId)
              )
          ).map((department) => (
            <MenuItem key={department.DepartmentId} value={department.DepartmentId}>
              {department.DepartmentName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={isHOD}
          fullWidth
        >
          {(isHOD
            ? subjects.filter((s) => Number(s.SubjectId) === Number(subjectId))
            : subjects
          ).map((subject) => (
            <MenuItem key={subject.SubjectId} value={subject.SubjectId}>
              {subject.SubjectName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Purpose"
          value={purposeId}
          onChange={(e) => setPurposeId(e.target.value)}
          fullWidth
        >
          {purposes.map((purpose) => (
            <MenuItem key={purpose.PurposeId} value={purpose.PurposeId}>
              {purpose.PurposeName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Required Date"
          value={requiredDate}
          onChange={(e) => setRequiredDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
        />

        <TextField
          select
          label="Priority Level"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          fullWidth
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
        </TextField>

        {purposeId === "Other" && (
          <TextField
            label="Custom Purpose"
            value={customPurpose}
            onChange={(e) => setCustomPurpose(e.target.value)}
            fullWidth
          />
        )}
      </Box>

      <TextField
        label="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        multiline
        rows={3}
        fullWidth
        sx={{ mt: 2.5 }}
        placeholder="Add any additional information or special instructions..."
      />
    </ModernCard>
  );
}

// ============================================
// Documents Card
// Multiple document cards can be added.
// Each card can contain multiple uploaded files.
// ============================================

function DocumentsCard({
  documents,
  addDocument,
  removeDocument,
  removeFileFromDocument,
  updateDocument,
  handleMultipleFileSelect,
}) {

const [draggingId, setDraggingId] = useState(null);
  
  return (
    <ModernCard
      icon={<DescriptionIcon />}
      title="Documents"
      subtitle="Add one or more documents to support your request."
      action={
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addDocument}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
            color: "#0B8F4D",
            borderColor: "#A7F3D0",
          }}
        >
          Add Document
        </Button>
      }
    >
      {documents.map((doc, index) => {
        const docTotals = getDocumentTotals(doc);

        return (
          <Box
            key={doc.id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #E2E8F0",
              borderRadius: 4,
              bgcolor: "#F8FAFC",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
            }}
          >
            {/* Document Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                alignItems: "center",
              }}
            >
              <Chip
                label={`Document #${index + 1}`}
                sx={{
                  fontWeight: 800,
                  bgcolor: "#EAF7EE",
                  color: "#0B8F4D",
                }}
              />

              <Button
                color="error"
                startIcon={<DeleteIcon />}
                disabled={documents.length === 1}
                onClick={() => removeDocument(doc.id)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Remove
              </Button>
            </Box>

            {/* Upload Area */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "260px 1fr",
                },
                gap: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <UploadTypeButton
                  active={doc.uploadType === "Office Document"}
                  disabled={doc.files.length > 0}
                  icon={<FolderIcon />}
                  title="Office Documents"
                  subtitle="PDF, DOCX, PPTX, XLSX"
                  onClick={() => updateDocument(doc.id, "uploadType", "Office Document")}
                />

                <UploadTypeButton
                  active={doc.uploadType === "Image File"}
                  disabled={doc.files.length > 0}
                  icon={<ImageIcon />}
                  title="Image Files"
                  subtitle="JPG, PNG, JPEG"
                  onClick={() => updateDocument(doc.id, "uploadType", "Image File")}
                />
              </Box>

              <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}

              onDragEnter={(e) => {
                e.preventDefault();
                setDraggingId(doc.id);
              }}

              onDragOver={(e) => {
                e.preventDefault();
                setDraggingId(doc.id);
              }}

              onDragLeave={() => {
                setDraggingId(null);
              }}

              onDrop={(e) => {
                e.preventDefault();
                setDraggingId(null);
                handleMultipleFileSelect(doc.id, e.dataTransfer.files);
              }}
                sx={{
                  minHeight: 150,
                  borderRadius: 3,

                  border:
                    draggingId === doc.id
                      ? "2px dashed #0B8F4D"
                      : "2px dashed #CBD5E1",

                  bgcolor:
                    draggingId === doc.id
                      ? "#EAF7EE"
                      : "#FFFFFF",

                  color:
                    draggingId === doc.id
                      ? "#0B8F4D"
                      : "#64748B",

                  transform:
                    draggingId === doc.id
                      ? "scale(1.02)"
                      : "scale(1)",

                  transition: "all 0.2s ease",

                  textTransform: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography fontWeight={900}>Drag & drop files here</Typography>

                <Typography fontSize={13} color="text.secondary">
                  or click to browse
                </Typography>

                <Typography fontSize={12} color="text.secondary">
                  Maximum file size: 20MB
                </Typography>

                <input
                  hidden
                  multiple
                  type="file"
                  accept={
                    doc.uploadType === "Image File"
                      ? ".jpg,.jpeg,.png"
                      : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  }
                  onChange={(e) => {
                    handleMultipleFileSelect(doc.id, e.target.files);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Box>

            {/* Uploaded Files Table */}
            <UploadedFilesTable
              doc={doc}
              removeFileFromDocument={removeFileFromDocument}
            />

            {/* Document Settings */}
            <Box sx={{ mt: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <DescriptionIcon sx={{ color: "#0B8F4D" }} />
                <Typography fontWeight={900}>
                  Document Settings (applied to all uploaded files)
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Document Name"
                  value={doc.documentName}
                  onChange={(e) =>
                    updateDocument(doc.id, "documentName", e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  type="number"
                  label="Copies (applies to all files)"
                  value={doc.copies}
                  onChange={(e) =>
                    updateDocument(doc.id, "copies", e.target.value)
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />

                <TextField
                  select
                  label="Paper Size"
                  value={doc.paperSize}
                  onChange={(e) =>
                    updateDocument(doc.id, "paperSize", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Print Type"
                  value={doc.printType}
                  onChange={(e) =>
                    updateDocument(doc.id, "printType", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="Single-Sided">Single-Sided</MenuItem>
                  <MenuItem value="Double-Sided">Back-to-Back</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Print Color"
                  value={doc.printColor}
                  onChange={(e) =>
                    updateDocument(doc.id, "printColor", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="Black & White">Black & White</MenuItem>
                  <MenuItem value="Color">Color</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Pages per Sheet"
                  value={doc.pagesPerSheet}
                  onChange={(e) =>
                    updateDocument(doc.id, "pagesPerSheet", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Page Selection"
                  value={doc.pageSelection}
                  onChange={(e) =>
                    updateDocument(doc.id, "pageSelection", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="All Pages">All Pages</MenuItem>
                  <MenuItem value="Custom Pages">Custom Pages</MenuItem>
                </TextField>

                <TextField
                  label="Custom Page Range"
                  value={doc.customPageRange}
                  onChange={(e) =>
                    updateDocument(doc.id, "customPageRange", e.target.value)
                  }
                  disabled={doc.pageSelection !== "Custom Pages"}
                  placeholder="e.g. 1-3,5,8-10"
                  helperText={
                    doc.pageSelection === "Custom Pages"
                      ? "Example: 1-3,5,8-10"
                      : 'Choose "Custom Pages" to enable this field.'
                  }
                  fullWidth
                  sx={{
                    md: {
                      gridColumn: "span 2",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Document Totals */}
            <DocumentTotalsBar doc={doc} docTotals={docTotals} />

            {/* Calculation note */}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#64748B",
              }}
            >
              <InfoIcon fontSize="small" />
              <Typography fontSize={13}>
                Sheets are calculated per file first, then multiplied by copies.
              </Typography>
            </Box>
          </Box>
        );
      })}

      {/* Add Another Document Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addDocument}
        sx={{
          mt: 1,
          borderRadius: 3,
          borderStyle: "dashed",
          textTransform: "none",
          fontWeight: 800,
          color: "#0B8F4D",
          borderColor: "#A7F3D0",
          py: 1.5,
        }}
      >
        Add Another Document
      </Button>
    </ModernCard>
  );
}

// ============================================
// Uploaded Files Table
// Shows each file with:
// File name, pages, pages to print, pages/sheet,
// sheets per file, and total sheets.
// ============================================

function UploadedFilesTable({ doc, removeFileFromDocument }) {
  if (!doc.files || doc.files.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        <Typography color="text.secondary" fontSize={14}>
          No files uploaded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <InsertDriveFileIcon sx={{ color: "#0B8F4D" }} />
        <Typography fontWeight={900}>
          Uploaded Files ({doc.files.length})
        </Typography>
      </Box>

      <Typography color="text.secondary" fontSize={13} sx={{ mb: 1.5 }}>
        The settings below will be applied to all uploaded files in this document.
      </Typography>

      {/* Desktop table */}
      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 0.8fr 1fr 1fr 1fr 1.3fr 0.5fr",
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {[
            "File Name",
            "Pages",
            "Pages to Print",
            "Pages/Sheet",
            "Sheets/File",
            `Total Sheets (${Number(doc.copies) || 1} copies)`,
            "",
          ].map((header) => (
            <Box
              key={header}
              sx={{
                p: 1.5,
                fontWeight: 900,
                fontSize: 13,
                textAlign: header === "File Name" ? "left" : "center",
              }}
            >
              {header}
            </Box>
          ))}
        </Box>

        {doc.files.map((file) => {
          const selectedPages = getSelectedPagesForFile(file, doc);
          const sheetsPerFile = getSheetsPerFile(file, doc);
          const totalSheets = getFileTotalSheets(file, doc);

          return (
            <Box
              key={file.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 0.8fr 1fr 1fr 1fr 1.3fr 0.5fr",
                borderBottom: "1px solid #E2E8F0",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <InsertDriveFileIcon
                  sx={{ color: getFileIconColor(file.fileName) }}
                />
                <Box>
                  <Typography fontWeight={900}>{file.fileName}</Typography>
                  <Typography color="text.secondary" fontSize={12}>
                    {file.fileType}
                    {file.isCounting ? " • Counting pages..." : ""}
                  </Typography>
                </Box>
              </Box>

              <TableCellBox>{file.isCounting ? "..." : file.pages}</TableCellBox>

              <TableCellBox>
                {doc.pageSelection === "Custom Pages"
                  ? `${selectedPages} selected`
                  : "All Pages"}
              </TableCellBox>

              <TableCellBox>{doc.pagesPerSheet}</TableCellBox>

              <TableCellBox>{file.isCounting ? "..." : sheetsPerFile}</TableCellBox>

              <TableCellBox>{file.isCounting ? "..." : totalSheets}</TableCellBox>

              <TableCellBox>
                <Tooltip title="Remove file">
                  <IconButton
                    color="error"
                    onClick={() => removeFileFromDocument(doc.id, file.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCellBox>
            </Box>
          );
        })}
      </Box>

      {/* Mobile cards */}
      <Box
        sx={{
          display: {
            xs: "grid",
            md: "none",
          },
          gap: 1.5,
        }}
      >
        {doc.files.map((file) => {
          const selectedPages = getSelectedPagesForFile(file, doc);
          const sheetsPerFile = getSheetsPerFile(file, doc);
          const totalSheets = getFileTotalSheets(file, doc);

          return (
            <Box
              key={file.id}
              sx={{
                p: 1.5,
                border: "1px solid #E2E8F0",
                borderRadius: 3,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.2 }}>
                  <InsertDriveFileIcon
                    sx={{ color: getFileIconColor(file.fileName) }}
                  />

                  <Box>
                    <Typography fontWeight={900}>{file.fileName}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {file.fileType}
                      {file.isCounting ? " • Counting pages..." : ""}
                    </Typography>
                  </Box>
                </Box>

                <IconButton
                  color="error"
                  onClick={() => removeFileFromDocument(doc.id, file.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <MiniMetric label="Pages" value={file.isCounting ? "..." : file.pages} />
                <MiniMetric
                  label="Print Pages"
                  value={
                    doc.pageSelection === "Custom Pages"
                      ? `${selectedPages} selected`
                      : "All"
                  }
                />
                <MiniMetric label="Pages/Sheet" value={doc.pagesPerSheet} />
                <MiniMetric
                  label="Sheets/File"
                  value={file.isCounting ? "..." : sheetsPerFile}
                />
                <MiniMetric
                  label="Total Sheets"
                  value={file.isCounting ? "..." : totalSheets}
                />
                <MiniMetric label="Copies" value={doc.copies} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ============================================
// Document Totals Bar
// ============================================


function DocumentTotalsBar({ doc, docTotals }) {
  return (
    <Box
      sx={{
        mt: 2.5,
        p: 2,
        borderRadius: 3.5,
        bgcolor: "#FFFFFF",
        border: "1px solid #BFDBFE",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr 1fr 1.15fr",
        },
        gap: 2,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      <TotalMetric
        icon={<DescriptionIcon />}
        label="Total Pages"
        value={`${docTotals.totalPages} pages`}
      />

      <TotalMetric
        icon={<LayersIcon />}
        label="Total Sheets per Set"
        value={`${docTotals.sheetsPerSet} sheets`}
      />

      <TotalMetric
        icon={<ContentCopyIcon />}
        label="Copies"
        value={`${Number(doc.copies) || 1} ${Number(doc.copies) === 1 ? "copy" : "copies"}`}
      />

      <Box
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: "#EEF4FF",
          textAlign: {
            xs: "left",
            md: "right",
          },
        }}
      >
        <Typography color="#06153A" fontWeight={950} fontSize={13}>
          TOTAL SHEETS USED
        </Typography>
        <Typography color="#06153A" fontWeight={950} fontSize={24}>
          {docTotals.totalSheets} sheets
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================
// Upload Type Selector
// ============================================


function UploadTypeButton({ active, icon, title, subtitle, onClick, disabled = false }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `2px solid ${active ? "#22C55E" : "#D9E3F0"}`,
        bgcolor: active ? "#F0FDF4" : "#FFFFFF",
        display: "flex",
        gap: 1.6,
        alignItems: "center",
        opacity: disabled ? 0.55 : 1,
        boxShadow: active
          ? "0 14px 28px rgba(22, 163, 74, 0.12)"
          : "0 8px 18px rgba(15, 23, 42, 0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: disabled ? "none" : "translateY(-2px)",
          borderColor: disabled ? undefined : "#22C55E",
        },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.5,
          bgcolor: active ? "#DCFCE7" : "#EEF4FF",
          color: active ? "#059669" : "#2563EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontWeight={950} color="#06153A">
          {title}
        </Typography>
        <Typography fontSize={12.5} color="#475569" fontWeight={700}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================
// Request Summary Card
// ============================================

function RequestSummaryCard({
  selectedDepartmentName,
  selectedSubjectName,
  selectedPurposeName,
  summary,
  priority,
  requiredDate,
}) {
  return (
    <ModernCard icon={<SummarizeIcon />} title="Request Summary">
      <SummaryRow label="Department" value={selectedDepartmentName} />
      <SummaryRow label="Subject" value={selectedSubjectName} />
      <SummaryRow label="Purpose" value={selectedPurposeName} />

      <Divider sx={{ my: 2 }} />

      <SummaryRow label="Total Pages" value={summary.totalPages} />
      <SummaryRow label="Total Copies" value={summary.totalCopies} />
      <SummaryRow label="Total Sheets" value={summary.totalSheets} />
      <SummaryRow label="A4 Sheets" value={summary.totalA4} />
      <SummaryRow label="A3 Sheets" value={summary.totalA3} />

      <Divider sx={{ my: 2 }} />

      <SummaryRow
        label="Priority"
        value={
          <Chip
            label={priority}
            size="small"
            sx={{
              bgcolor: priority === "Urgent" ? "#FEE2E2" : "#FEF3C7",
              color: priority === "Urgent" ? "#DC2626" : "#D97706",
              fontWeight: 800,
            }}
          />
        }
      />

      <SummaryRow
        label="Required Date"
        value={requiredDate ? requiredDate : "Not selected"}
      />
    </ModernCard>
  );
}

// ============================================
// Approval Route Card
// ============================================


function ApprovalRouteCard({ approvalFlow }) {
  return (
    <ModernCard icon={<RouteIcon />} title="Approval Route">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
        {approvalFlow.map((step, index) => {
          const isHod = step === "HOD";
          const isHos = step === "HOS";
          const isPrinting = step === "Printing Admin";

          return (
            <Box key={step} sx={{ display: "flex", gap: 1.6, alignItems: "center" }}>
              <Box sx={{ position: "relative" }}>
                {index < approvalFlow.length - 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 36,
                      left: 17,
                      width: 3,
                      height: 22,
                      bgcolor: "#D8E2F0",
                      borderRadius: 99,
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: isHod
                      ? "#F97316"
                      : isHos
                      ? "#2563EB"
                      : isPrinting
                      ? "#059669"
                      : "#3B82F6",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 950,
                    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.14)",
                  }}
                >
                  {index + 1}
                </Box>
              </Box>

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: isHod ? "#FFEDD5" : isPrinting ? "#DCFCE7" : "#DBEAFE",
                  color: isHod ? "#EA580C" : isPrinting ? "#059669" : "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isPrinting ? <UploadFileIcon /> : <DescriptionIcon />}
              </Box>

              <Box>
                <Typography fontWeight={950} color="#06153A">
                  {step}
                </Typography>
                <Typography fontSize={13} color="#475569" fontWeight={600}>
                  {step === "Printing Admin"
                    ? "Final printing and processing"
                    : "Approval review required"}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </ModernCard>
  );
}

// ============================================
// Actions Card
// ============================================


function ActionsCard({ submitting, handleSubmitRequest }) {
  return (
    <ModernCard icon={<InfoIcon />} title="Actions">
      <Button
        fullWidth
        variant="outlined"
        startIcon={<SaveIcon />}
        disabled
        sx={{
          mb: 2,
          borderRadius: 3,
          py: 1.25,
          textTransform: "none",
          fontWeight: 900,
          borderColor: "#93C5FD",
          color: "#2563EB",
        }}
      >
        Save as Draft
      </Button>

      <Button
        fullWidth
        variant="contained"
        endIcon={<SendIcon />}
        onClick={handleSubmitRequest}
        disabled={submitting}
        sx={{
          borderRadius: 3,
          py: 1.35,
          background: "linear-gradient(135deg, #10B981 0%, #2563EB 100%)",
          textTransform: "none",
          fontWeight: 950,
          boxShadow: "0 16px 30px rgba(16, 185, 129, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #1D4ED8 100%)",
          },
        }}
      >
        {submitting ? "Submitting..." : "Review & Submit"}
      </Button>

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 3,
          bgcolor: "#ECFDF5",
          color: "#166534",
          border: "1px solid #BBF7D0",
        }}
      >
        <Typography fontSize={13} fontWeight={700}>
          Your request will be saved securely and can be tracked in My Requests.
        </Typography>
      </Box>
    </ModernCard>
  );
}

// ============================================
// Reusable Modern Card
// ============================================


function ModernCard({ icon, title, subtitle, action, children }) {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 5,
        border: "1px solid #EAF0F7",
        bgcolor: "rgba(255,255,255,0.96)",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.07)",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.2, md: 3 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "#FFFFFF",
            minHeight: 54,
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: "#CBD7E6",
            },
            "&:hover fieldset": {
              borderColor: "#60A5FA",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0B8F4D",
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 800,
            color: "#475569",
          },
          "& .MuiInputBase-input": {
            fontWeight: 800,
            color: "#0F172A",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "flex-start",
            mb: 2.8,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {icon && (
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 30% 25%, #DCFCE7 0%, #22C55E 45%, #059669 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 18px 35px rgba(22, 163, 74, 0.28)",
                  "& svg": {
                    fontSize: 28,
                  },
                }}
              >
                {icon}
              </Box>
            )}

            <Box>
              <Typography variant="h5" fontWeight={950} color="#06153A">
                {title}
              </Typography>

              {subtitle && (
                <Typography color="#475569" fontSize={15} fontWeight={600}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {action}
        </Box>

        {children}
      </CardContent>
    </Card>
  );
}

// ============================================
// Reusable Summary Row
// ============================================

function SummaryRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        mb: 1.5,
      }}
    >
      <Typography color="text.secondary" fontWeight={600}>
        {label}
      </Typography>

      <Typography fontWeight={900} textAlign="right">
        {value}
      </Typography>
    </Box>
  );
}

// ============================================
// Table Cell Box
// ============================================

function TableCellBox({ children }) {
  return (
    <Box
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: 800,
      }}
    >
      {children}
    </Box>
  );
}

// ============================================
// Mobile mini metric
// ============================================

function MiniMetric({ label, value }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRight: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
        textAlign: "center",
        "&:nth-of-type(3n)": {
          borderRight: "none",
        },
        "&:nth-of-type(n+4)": {
          borderBottom: "none",
        },
      }}
    >
      <Typography fontSize={11} color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography fontWeight={900}>{value}</Typography>
    </Box>
  );
}

// ============================================
// Total Metric
// ============================================

function TotalMetric({ icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: "#0B8F4D" }}>{icon}</Box>

      <Box>
        <Typography color="text.secondary" fontSize={13} fontWeight={700}>
          {label}
        </Typography>
        <Typography fontWeight={900}>{value}</Typography>
      </Box>
    </Box>
  );
}
