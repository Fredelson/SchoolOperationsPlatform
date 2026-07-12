// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Paper Purchases Page
// Adds purchased paper to inventory automatically
// ============================================

import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";



import {
  getPurchases,
  addPurchase,
} from "../../../services/purchaseService";

export default function PaperPurchases() {

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    paperType: "A4",
    quantityBoxes: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPurchases();
      setPurchases(data || []);
    } catch (err) {
      console.error("Load purchases error:", err);
      setError("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");

      if (!form.quantityBoxes || Number(form.quantityBoxes) <= 0) {
        setError("Quantity boxes must be greater than 0.");
        return;
      }

      await addPurchase({
        paperType: form.paperType,
        quantityBoxes: Number(form.quantityBoxes),
        purchaseDate: form.purchaseDate,
      });

      setSuccess("Purchase saved and inventory updated.");

      setForm({
        paperType: "A4",
        quantityBoxes: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });

      await loadPurchases();
    } catch (err) {
      console.error("Save purchase error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save purchase."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Paper Purchases
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Add Paper Purchase
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Paper Type"
                  fullWidth
                  value={form.paperType}
                  onChange={(e) =>
                    handleChange("paperType", e.target.value)
                  }
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Quantity Boxes"
                  type="number"
                  fullWidth
                  value={form.quantityBoxes}
                  onChange={(e) =>
                    handleChange("quantityBoxes", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Purchase Date"
                  type="date"
                  fullWidth
                  value={form.purchaseDate}
                  onChange={(e) =>
                    handleChange("purchaseDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  onClick={handleSave}
                  sx={{
                    height: 56,
                    bgcolor: "#2E8B3C",
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#256f31",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save Purchase"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Paper Type</TableCell>
                  <TableCell>Boxes</TableCell>
                  <TableCell>Bundles</TableCell>
                  <TableCell>Sheets Added</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.PurchaseId}>
                    <TableCell>
                      {new Date(purchase.PurchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{purchase.PaperType}</TableCell>
                    <TableCell>{purchase.QuantityBoxes}</TableCell>
                    <TableCell>{purchase.TotalBundles}</TableCell>
                    <TableCell>
                      {Number(purchase.TotalSheets).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}

                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No purchases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}
