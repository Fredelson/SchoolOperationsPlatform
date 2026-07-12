// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Inventory Transaction Logs
// Shows all stock movements: deductions, purchases, adjustments
// Rendered inside the shared PlatformLayout.
// ============================================

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";

import api from "../../../services/api";

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paperType, setPaperType] = useState("ALL");
  const [transactionType, setTransactionType] = useState("ALL");
  const [search, setSearch] = useState("");

  // ============================================
  // Load inventory transaction logs
  // ============================================
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/printing/inventory-transactions");

      setTransactions(response.data || []);
      setFiltered(response.data || []);
    } catch (err) {
      console.error("Fetch Inventory Transactions Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load inventory transaction logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ============================================
  // Apply filters
  // ============================================
  useEffect(() => {
    let data = [...transactions];

    if (paperType !== "ALL") {
      data = data.filter((item) => item.PaperType === paperType);
    }

    if (transactionType !== "ALL") {
      data = data.filter(
        (item) => item.TransactionType === transactionType
      );
    }

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.RequestNumber?.toLowerCase().includes(keyword) ||
          item.Remarks?.toLowerCase().includes(keyword) ||
          item.CreatedByName?.toLowerCase().includes(keyword)
      );
    }

    setFiltered(data);
  }, [paperType, transactionType, search, transactions]);

  // ============================================
  // Badge color by transaction type
  // ============================================
  const getTransactionColor = (type) => {
    if (type === "DEDUCTION") return "error";
    if (type === "DISTRIBUTION") return "info";
    if (type === "PURCHASE") return "success";
    if (type === "ADJUSTMENT") return "warning";
    return "default";
    };

  return (
    <>
      <PageHeader
        title="Inventory Transaction Logs"
        subtitle="View all paper stock movements including print deductions and future purchases."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Request number, remarks, user"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Paper Type"
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="A4">A4</MenuItem>
              <MenuItem value="A3">A3</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
            fullWidth
            select
            label="Transaction Type"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="DEDUCTION">Deduction</MenuItem>
            <MenuItem value="DISTRIBUTION">Distribution</MenuItem>
            <MenuItem value="PURCHASE">Purchase</MenuItem>
            <MenuItem value="ADJUSTMENT">Adjustment</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f7fb" }}>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Paper</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Previous Stock</TableCell>
                  <TableCell align="right">New Stock</TableCell>
                  <TableCell>Request No.</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No inventory transactions found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.TransactionId} hover>
                      <TableCell>{item.TransactionId}</TableCell>

                      <TableCell>
                        {item.CreatedAt
                          ? new Date(item.CreatedAt).toLocaleString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.PaperType || "-"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.TransactionType || "-"}
                          size="small"
                          color={getTransactionColor(
                            item.TransactionType
                          )}
                        />
                      </TableCell>

                      <TableCell align="right">
                        {Number(item.Quantity || 0).toLocaleString()}
                      </TableCell>

                      <TableCell align="right">
                        {Number(item.PreviousStock || 0).toLocaleString()}
                      </TableCell>

                      <TableCell align="right">
                        {Number(item.NewStock || 0).toLocaleString()}
                      </TableCell>

                      <TableCell>{item.RequestNumber || "-"}</TableCell>

                      <TableCell>{item.CreatedByName || "-"}</TableCell>

                      <TableCell>{item.Remarks || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};

export default InventoryTransactions;
