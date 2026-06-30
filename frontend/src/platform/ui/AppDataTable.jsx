// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppDataTable
// ============================================
//
// Purpose:
// Reusable enterprise data table.
//
// Features
// - Consistent styling
// - Loading state
// - Empty state
// - Pagination
// - Responsive
// - Custom row ID support
// - Reusable for every module
//
// ============================================

import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import AppCard from "./AppCard";
import AppEmptyState from "./AppEmptyState";

// ============================================
// Component
// ============================================

export default function AppDataTable({
  columns = [],
  rows = [],
  loading = false,

  page = 0,
  rowsPerPage = 10,
  totalRows = rows.length,

  onPageChange,
  onRowsPerPageChange,

  getRowId,

  emptyTitle = "No records found",
  emptyMessage = "There is currently no data available.",

  stickyHeader = false,
  maxHeight = 650,
}) {
  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <AppCard>
        <Box
          sx={{
            py: 8,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </AppCard>
    );
  }

  // ==========================================
  // Empty State
  // ==========================================

  if (!rows.length) {
    return (
      <AppCard>
        <AppEmptyState
          title={emptyTitle}
          message={emptyMessage}
        />
      </AppCard>
    );
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <AppCard noPadding>
      <TableContainer
        sx={{
          maxHeight: stickyHeader ? maxHeight : "unset",
        }}
      >
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                  width={column.width}
                  align={column.align}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, rowIndex) => {
              const rowId = getRowId
                ? getRowId(row)
                : row.id ?? row.Id ?? rowIndex;

              return (
                <TableRow hover key={rowId}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align}
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          component="div"
          page={page}
          rowsPerPage={rowsPerPage}
          count={totalRows}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </AppCard>
  );
}
