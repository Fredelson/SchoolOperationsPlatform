// ============================================
// IT Asset Table
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

const getStatusColor = (statusKey = "") => {
  const key = statusKey.toUpperCase();

  if (key === "AVAILABLE") return "success";
  if (key === "ASSIGNED" || key === "IN_USE") return "primary";
  if (key === "MAINTENANCE" || key === "UNDERREPAIR" || key === "UNDER_MAINTENANCE" || key === "UNDERMAINTENANCE") return "warning";

  return "default";
};

/**
 * Reusable IT Asset table.
 */
const AssetTable = ({
  rows = [],
  loading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  onRowClick,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={900}>
          Assets
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing assets for the selected hierarchy level.
        </Typography>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Asset Tag</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Room</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                  {loading ? "Loading assets..." : "No assets found."}
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {rows.map((asset) => (
            <TableRow
              key={asset.AssetId}
              hover
              onClick={() => onRowClick?.(asset)}
              sx={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              <TableCell>
                <Typography fontWeight={800}>{asset.AssetTag}</Typography>
              </TableCell>
              <TableCell>{asset.CategoryName || "—"}</TableCell>
              <TableCell>{asset.BrandName || "—"}</TableCell>
              <TableCell>{asset.ModelName || "—"}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={asset.StatusName || "Unknown"}
                  color={getStatusColor(asset.StatusKey)}
                />
              </TableCell>
              <TableCell>
                {asset.CurrentAssignedName ||
                  asset.CurrentAssignedEmployeeCode ||
                  asset.RoomName ||
                  "—"}
              </TableCell>
              <TableCell>{asset.LocationName || "—"}</TableCell>
              <TableCell>{asset.RoomName || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Box>

      <TablePagination
        component="div"
        count={total}
        page={Math.max(page - 1, 0)}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onPageChange={(_, newPage) => onPageChange?.(newPage + 1)}
        onRowsPerPageChange={(event) => onLimitChange?.(Number(event.target.value))}
      />
    </Paper>
  );
};

export default AssetTable;
