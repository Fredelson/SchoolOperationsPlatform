import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";

import {
  importItAssetsService,
  commitItAssetsImportService,
} from "../services/itAssetImportService";

export default function ImportAssetDialog({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [error, setError] = useState("");

  const handlePreview = async () => {
    if (!file) {
      setError("Please select an Excel or CSV file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPreview(null);
      setCommitResult(null);

      const result = await importItAssetsService(file);
      setPreview(result);
    } catch (err) {
      console.error("IT asset import preview failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.join(" ") ||
          "Failed to preview IT asset import."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview?.batchId) {
      setError("No import batch found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await commitItAssetsImportService(preview.batchId);
      setCommitResult(result?.data || result);

      onSuccess?.();
    } catch (err) {
      console.error("IT asset import commit failed:", err);
      setError(
        err?.response?.data?.message || "Failed to commit IT asset import."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setPreview(null);
    setCommitResult(null);
    setError("");
    onClose?.();
  };

  const rows = preview?.rows || [];
  const validRows = preview?.validRows || 0;
  const invalidRows = preview?.invalidRows || 0;
  const updateRows = preview?.updateRows || 0;
  const ignoredRows = preview?.ignoredRows || 0;
  const totalRows = preview?.totalRows || rows.length || 0;

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="xl" fullWidth>
      <DialogTitle>Import IT Assets</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Required columns: AssetCode, Category, Status. Optional columns:
          Brand, Model, Department, Location, Room, Condition, PurchaseDate,
          EmployeeCode, Remarks.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Select File
            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setPreview(null);
                setCommitResult(null);
                setError("");
              }}
            />
          </Button>

          <Typography variant="body2">
            {file ? file.name : "No file selected"}
          </Typography>

          <Button variant="contained" disabled={!file || loading} onClick={handlePreview}>
            {loading ? "Processing..." : "Preview Import"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {preview && (
          <Alert severity={invalidRows > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
            Preview ready. Total: {totalRows}, Valid: {validRows}, Invalid:{" "}
            {invalidRows}, Update: {updateRows}, Ignored: {ignoredRows}
          </Alert>
        )}

        {commitResult && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Import committed. Imported rows: {commitResult.importedRows || 0},
            Updated rows: {commitResult.updatedRows || 0}
          </Alert>
        )}

        {rows.length > 0 && (
          <Box sx={{ maxHeight: 420, overflow: "auto", border: "1px solid #eee" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>AssetCode</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>EmployeeCode</TableCell>
                  <TableCell>Import Status</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.slice(0, 100).map((row) => (
                  <TableRow key={row.ImportStagingId || row.importStagingId}>
                    <TableCell>{row.SourceRow || row.sourceRow}</TableCell>
                    <TableCell>{row.AssetTag || row.assetTag}</TableCell>
                    <TableCell>{row.CategoryName || row.categoryName}</TableCell>
                    <TableCell>{row.BrandName || row.brandName}</TableCell>
                    <TableCell>{row.ModelName || row.modelName}</TableCell>
                    <TableCell>{row.StatusName || row.statusName}</TableCell>
                    <TableCell>{row.EmployeeCode || row.employeeCode}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.ImportStatus || row.importStatus}
                        color={
                          (row.ImportStatus || row.importStatus) === "Valid"
                            ? "success"
                            : (row.ImportStatus || row.importStatus) === "Update"
                            ? "warning"
                            : (row.ImportStatus || row.importStatus) === "Ignored"
                            ? "default"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>{row.ImportMessage || row.importMessage || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={resetAndClose}>Cancel</Button>

          <Button
            variant="contained"
            color="success"
            disabled={!preview?.batchId || (validRows === 0 && updateRows === 0) || loading}
            onClick={handleCommit}
          >
            Commit Import
          </Button>
      </DialogActions>
    </Dialog>
  );
}