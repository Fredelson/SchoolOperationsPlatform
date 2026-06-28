// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppCard
// ============================================
//
// Purpose:
// Reusable card wrapper for dashboards, forms,
// reports, tables, and module pages.
// ============================================

import { Card, CardContent, useTheme } from "@mui/material";

// ============================================
// Component
// ============================================

export default function AppCard({
  children,
  sx = {},
  contentSx = {},
  noPadding = false,
  ...props
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        overflow: "hidden",
        ...sx,
      }}
      {...props}
    >
      {noPadding ? (
        children
      ) : (
        <CardContent
          sx={{
            p: { xs: 2, md: 3 },
            "&:last-child": {
              pb: { xs: 2, md: 3 },
            },
            ...contentSx,
          }}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
}