import { Box, Typography } from "@mui/material";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && <Box>{action}</Box>}
    </Box>
  );
}