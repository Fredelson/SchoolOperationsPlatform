// ============================================
// Enterprise IT Asset Card Base
// Arab Unity School Operations Platform
//
// Purpose:
// - Compact reusable card for the IT Asset Explorer.
// - Used by Category, Brand, and Model cards.
// - Keeps arrow fixed on the far right.
// - Keeps layout small for responsive 4-column display.
// ============================================

import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const AssetCard = ({
  title,
  assetCount = 0,
  accentKey = "primary",
  selected = false,
  icon,
  stats,
  onClick,
  ariaLabel,
}) => {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel || title}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      sx={(theme) => {
        const accent =
          theme.palette[accentKey]?.main || theme.palette.text.secondary;

        return {
          height: "100%",
          minHeight: 165,
          borderRadius: 3,
          border: selected
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          cursor: "pointer",
          overflow: "hidden",
          outline: "none",
          boxShadow: selected ? theme.shadows[3] : theme.shadows[1],
          transition: theme.transitions.create(
            ["transform", "box-shadow", "border-color"],
            { duration: theme.transitions.duration.short }
          ),

          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[3],
            borderColor: accent,
          },

          "&:focus-visible": {
            borderColor: accent,
          },

          "& .asset-count": {
            color: accent,
          },

          "& .asset-accent-bar": {
            bgcolor: accent,
          },
        };
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          p: 1.15,
          "&:last-child": {
            pb: 1.15,
          },
        }}
      >
        <Stack
          spacing={0.75}
          sx={{
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ width: "100%" }}
          >
            <Box>{icon}</Box>

            <IconButton
              size="small"
              tabIndex={-1}
              sx={(theme) => ({
                width: 26,
                height: 26,
                ml: "auto",
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.primary.main,
                bgcolor: theme.palette.background.paper,
                flexShrink: 0,
              })}
            >
              <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          <Box>
            <Typography fontSize={14.5} fontWeight={850} noWrap>
              {title}
            </Typography>

            <Typography className="asset-count" fontSize={18} fontWeight={900}>
              {assetCount}
            </Typography>
          </Box>

          {stats}

          <Box className="asset-accent-bar" sx={{ height: 3, borderRadius: 2 }} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssetCard;