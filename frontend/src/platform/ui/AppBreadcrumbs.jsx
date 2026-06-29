// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppBreadcrumbs
// ============================================
//
// Purpose:
// Reusable breadcrumb navigation for deep
// platform pages and module sub-pages.
// ============================================

import { Breadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as RouterLink } from "react-router-dom";

// ============================================
// Component
// ============================================

export default function AppBreadcrumbs({
  items = [],
  sx = {},
}) {
  if (!items.length) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2, ...sx }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.to) {
          return (
            <Typography
              key={item.label}
              color="text.primary"
              fontWeight={800}
              fontSize={14}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={item.label}
            component={RouterLink}
            to={item.to}
            underline="hover"
            color="text.secondary"
            fontWeight={700}
            fontSize={14}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}