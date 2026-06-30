// Material UI components
import { Box, Button, Chip, Typography } from "@mui/material";

// Reusable approval queue list
export default function ApprovalQueue({ requests = [], onReview }) {
  return (
    <Box>
      {requests.map((request) => (
        <Box
          key={request.id}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Request basic information */}
          <Box>
            <Typography fontWeight={700}>
              {request.requestNumber}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Teacher: {request.teacher}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Purpose: {request.purpose}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Sheets: {request.sheets}
            </Typography>
          </Box>

          {/* Request status and review button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={request.status} color="warning" size="small" />

            <Button
              variant="contained"
              size="small"
              onClick={() => onReview(request)}
            >
              Review
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
