// ============================================
// Reusable Import Dialog
// Arab Unity School Operations Platform
// ============================================

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

const ImportDialog = ({
  open,
  title = "Import",
  requiredColumns = "",
  file,
  loading = false,
  preview,
  commitResult,
  error = "",
  accept = ".csv,.xlsx,.xls",
  csvTemplateUrl = "",
  excelTemplateUrl = "",
  onClose,
  onFileChange,
  onPreview,
  onCommit,
}) => {
  const totalRows =
    preview?.totalRows || preview?.summary?.totalRows || preview?.rows?.length || 0;

  const validRows = preview?.validRows || preview?.summary?.validRows || 0;
  const invalidRows = preview?.invalidRows || preview?.summary?.invalidRows || 0;

  const importedRows =
    commitResult?.importedRows || commitResult?.summary?.importedRows || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Required columns: {requiredColumns}
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {csvTemplateUrl && (
            <Button variant="outlined" component="a" href={csvTemplateUrl} download>
              Download CSV Template
            </Button>
          )}

          {excelTemplateUrl && (
            <Button variant="outlined" component="a" href={excelTemplateUrl} download>
              Download Excel Template
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button variant="outlined" component="label" startIcon={<UploadFileRoundedIcon />}>
            Select File
            <input
              hidden
              type="file"
              accept={accept}
              onChange={(event) => onFileChange?.(event.target.files?.[0] || null)}
            />
          </Button>

          <Typography variant="body2">
            {file ? file.name : "No file selected"}
          </Typography>

          <Button variant="contained" disabled={!file || loading} onClick={onPreview}>
            {loading ? "Processing..." : "Preview Import"}
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={!preview?.batchId || loading}
            onClick={onCommit}
          >
            Commit Import
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {preview && (
          <Alert severity={invalidRows > 0 ? "warning" : "success"} sx={{ mt: 2 }}>
            Preview ready. Total: {totalRows}, Valid: {validRows}, Invalid:{" "}
            {invalidRows}
          </Alert>
        )}

        {commitResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Import committed. Imported rows: {importedRows}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;