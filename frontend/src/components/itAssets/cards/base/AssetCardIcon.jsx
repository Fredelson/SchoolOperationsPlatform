// ============================================
// Enterprise IT Asset Card Icon
// Arab Unity School Operations Platform
//
// Purpose:
// - Shared themed icon container for IT Asset cards.
// - Prevents duplicate icon-circle styling.
// ============================================

import { Box, alpha } from "@mui/material";

const AssetCardIcon = ({ children, accentKey = "primary" }) => {
  return (
    <Box
      sx={(theme) => {
        const color =
          theme.palette[accentKey]?.main || theme.palette.text.secondary;

        return {
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: alpha(color, 0.12),
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        };
      }}
    >
      {children}
    </Box>
  );
};

export default AssetCardIcon;