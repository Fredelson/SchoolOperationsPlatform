// ============================================
// IT Assets Empty State
// Arab Unity School Operations Platform
// ============================================

import { Box, Paper, Typography } from "@mui/material";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const EmptyState = ({
  title = "No records found",
  message = "There is no data available for the selected view.",
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        borderRadius: 4,
        border: "1px dashed",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inventory2RoundedIcon sx={{ fontSize: 36, color: "text.secondary" }} />
      </Box>

      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Paper>
  );
};

export default EmptyState;