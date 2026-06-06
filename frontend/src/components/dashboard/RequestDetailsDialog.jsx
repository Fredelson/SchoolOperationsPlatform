// Material UI components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Chip,
} from "@mui/material";

// Reusable request details dialog
export default function RequestDetailsDialog({
  open,
  request,
  comment,
  setComment,
  onClose,
  onApprove,
  onReturn,
  onReject,
}) {
  // Do not show dialog if no request is selected
  if (!request) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {/* Dialog title */}
      <DialogTitle fontWeight={700}>
        Request Details - {request.requestNumber}
      </DialogTitle>

      <DialogContent>
        {/* Request information */}
        <Box sx={{ display: "grid", gap: 1.5, mt: 1 }}>
          <Typography>
            <strong>Teacher:</strong> {request.teacher}
          </Typography>

          <Typography>
            <strong>Department:</strong> {request.department}
          </Typography>

          <Typography>
            <strong>Purpose:</strong> {request.purpose}
          </Typography>

          <Typography>
            <strong>Pages:</strong> {request.pages}
          </Typography>

          <Typography>
            <strong>Copies:</strong> {request.copies}
          </Typography>

          <Typography>
            <strong>Total Sheets:</strong> {request.sheets}
          </Typography>

          <Typography>
            <strong>Status:</strong>{" "}
            <Chip label={request.status} color="warning" size="small" />
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Attachment section */}
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Attachments
        </Typography>

        {request.attachments?.length > 0 ? (
          request.attachments.map((file, index) => (
            <Typography key={index} variant="body2">
              📎 {file}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No attachments uploaded.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Approval comment box */}
        <TextField
          label="Approval Comment / Remarks"
          placeholder="Add comment before approving, returning, or rejecting..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
      </DialogContent>

      {/* Dialog action buttons */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

        <Button color="warning" variant="outlined" onClick={onReturn}>
          Return for Revision
        </Button>

        <Button color="error" variant="outlined" onClick={onReject}>
          Reject
        </Button>

        <Button color="success" variant="contained" onClick={onApprove}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}