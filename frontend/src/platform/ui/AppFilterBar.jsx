import { Box } from "@mui/material";

const compactControlSx = {
  "& .MuiFormControl-root": {
    width: "100%",
    minWidth: "0 !important",
    maxWidth: "none !important",
  },
  "& .MuiAutocomplete-root": {
    width: "100%",
    minWidth: "0 !important",
    maxWidth: "none !important",
  },
  "& .MuiInputBase-root:not(.MuiInputBase-multiline)": {
    minHeight: 36,
  },
};

export default function AppFilterBar({
  children,
  actions = null,
  columns = "auto",
  contained = true,
  sx = {},
}) {
  const fixedColumnCount = Number.isInteger(columns)
    ? Math.min(Math.max(columns, 1), 6)
    : null;
  const desktopColumns = fixedColumnCount
    ? `repeat(${fixedColumnCount}, minmax(0, 1fr))`
    : "repeat(auto-fit, minmax(120px, 1fr))";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { xs: "stretch", lg: "flex-start" },
        justifyContent: "space-between",
        gap: 1,
        width: "100%",
        mb: contained ? 2 : 0,
        p: contained ? 1.25 : 0,
        border: contained ? "1px solid" : 0,
        borderColor: contained ? "divider" : "transparent",
        borderRadius: contained ? 2 : 0,
        bgcolor: contained ? "background.paper" : "transparent",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: fixedColumnCount === 1
              ? "minmax(0, 280px)"
              : "repeat(2, minmax(0, 1fr))",
            md: desktopColumns,
          },
          gap: 1,
          flex: "1 1 auto",
          width: "100%",
          maxWidth: fixedColumnCount === 1 ? 280 : "none",
          minWidth: 0,
          ...compactControlSx,
        }}
      >
        {children}
      </Box>

      {actions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", lg: "flex-end" },
            flexWrap: "wrap",
            flex: "0 0 auto",
            gap: 1,
            minWidth: 0,
            "& .MuiButton-root": {
              minHeight: 36,
              px: 1.5,
              whiteSpace: "nowrap",
            },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
