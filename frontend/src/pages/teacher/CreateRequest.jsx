// ============================================
// ARAB UNITY SCHOOL
// Teacher - Create Request Page
// Uses reusable DashboardLayout, Sidebar,
// Topbar, PageHeader, and DashboardCard
// ============================================

import { useMemo, useState } from "react";

import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DashboardCard from "../../components/common/DashboardCard";

const purposeOptions = [
  "Worksheet",
  "Board Work",
  "Baseline Assessment",
  "Friday Exam",
  "End of Unit Assessment",
  "Winter Exam",
  "Spring Exam",
  "Summer Exam",
  "Mock Exam",
  "Homework",
  "Revision Material",
  "Other",
];

const createEmptyDocument = () => ({
  id: Date.now(),
  documentName: "",
  file: null,
  pages: 1,
  copies: 1,
  paperSize: "A4",
  printType: "Single-Sided",
  printColor: "Black & White",
});

export default function CreateRequest() {
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [remarks, setRemarks] = useState("");
  const [documents, setDocuments] = useState([createEmptyDocument()]);

  const updateDocument = (id, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    );
  };

  const addDocument = () => {
    setDocuments((prev) => [
      ...prev,
      {
        ...createEmptyDocument(),
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const removeDocument = (id) => {
    setDocuments((prev) =>
      prev.length === 1 ? prev : prev.filter((doc) => doc.id !== id)
    );
  };

  const summary = useMemo(() => {
    return documents.reduce(
      (total, doc) => {
        const pages = Number(doc.pages) || 0;
        const copies = Number(doc.copies) || 0;
        const printedPages = pages * copies;

        const sheets =
          doc.printType === "Double-Sided"
            ? Math.ceil(printedPages / 2)
            : printedPages;

        return {
          totalPages: total.totalPages + printedPages,
          totalSheets: total.totalSheets + sheets,
          totalCopies: total.totalCopies + copies,
          totalA4: total.totalA4 + (doc.paperSize === "A4" ? sheets : 0),
          totalA3: total.totalA3 + (doc.paperSize === "A3" ? sheets : 0),
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

  const approvalFlow =
    summary.totalSheets <= 500
      ? ["Teacher", "HOD", "Admin Printing"]
      : ["Teacher", "HOS", "Admin Printing"];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={<Topbar userName="Ahmed Khan" role="Teacher" />}
    >
      <PageHeader
        title="Create Photocopy Request"
        subtitle="Add multiple documents and review the approval flow before submitting."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr",
          },
          gap: 3,
        }}
      >
        <Box>
          <DashboardCard title="Request Information" sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 3,
              }}
            >
              <TextField
                select
                label="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                fullWidth
              >
                {purposeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
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

              {purpose === "Other" && (
                <TextField
                  label="Custom Purpose"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  fullWidth
                />
              )}

              <TextField
                select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                fullWidth
              >
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </DashboardCard>

          <DashboardCard
            title="Documents"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addDocument}
                sx={{ textTransform: "none" }}
              >
                Add Document
              </Button>
            }
          >
            {documents.map((doc, index) => {
              const printedPages =
                (Number(doc.pages) || 0) * (Number(doc.copies) || 0);

              const sheets =
                doc.printType === "Double-Sided"
                  ? Math.ceil(printedPages / 2)
                  : printedPages;

              return (
                <Box
                  key={doc.id}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography fontWeight={700}>
                      Document #{index + 1}
                    </Typography>

                    <IconButton
                      color="error"
                      disabled={documents.length === 1}
                      onClick={() => removeDocument(doc.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                      },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Document Name"
                      value={doc.documentName}
                      onChange={(e) =>
                        updateDocument(
                          doc.id,
                          "documentName",
                          e.target.value
                        )
                      }
                      fullWidth
                    />

                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadFileIcon />}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        height: 56,
                      }}
                    >
                      {doc.file ? doc.file.name : "Upload File"}
                      <input
                        hidden
                        type="file"
                        onChange={(e) =>
                          updateDocument(doc.id, "file", e.target.files[0])
                        }
                      />
                    </Button>

                    <TextField
                      type="number"
                      label="Pages"
                      value={doc.pages}
                      onChange={(e) =>
                        updateDocument(doc.id, "pages", e.target.value)
                      }
                      fullWidth
                    />

                    <TextField
                      type="number"
                      label="Copies"
                      value={doc.copies}
                      onChange={(e) =>
                        updateDocument(doc.id, "copies", e.target.value)
                      }
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
                      <MenuItem value="Double-Sided">Double-Sided</MenuItem>
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

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Printed Pages
                      </Typography>

                      <Typography fontWeight={800}>{printedPages}</Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                      >
                        Sheets
                      </Typography>

                      <Typography fontWeight={800}>{sheets}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </DashboardCard>
        </Box>

        <Box>
          <DashboardCard title="Request Summary" sx={{ mb: 3 }}>
            <SummaryRow label="Total Pages" value={summary.totalPages} />
            <SummaryRow label="Total Copies" value={summary.totalCopies} />
            <SummaryRow label="Total Sheets" value={summary.totalSheets} />
            <SummaryRow label="A4 Sheets" value={summary.totalA4} />
            <SummaryRow label="A3 Sheets" value={summary.totalA3} />

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" mb={1}>
              Approval Route
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {approvalFlow.map((step) => (
                <Chip
                  key={step}
                  label={step}
                  color={
                    step === "HOD"
                      ? "warning"
                      : step === "HOS"
                      ? "primary"
                      : "default"
                  }
                />
              ))}
            </Box>

            <Typography
              sx={{
                mt: 2,
                fontSize: 13,
                color: "#64748B",
              }}
            >
              {summary.totalSheets <= 500
                ? "Requests with 500 sheets or below go to HOD approval."
                : "Requests above 500 sheets go directly to HOS approval."}
            </Typography>
          </DashboardCard>

          <DashboardCard title="Actions">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SaveIcon />}
              sx={{ mb: 2, textTransform: "none" }}
            >
              Save Draft
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              sx={{ textTransform: "none" }}
            >
              Submit Request
            </Button>
          </DashboardCard>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  );
}