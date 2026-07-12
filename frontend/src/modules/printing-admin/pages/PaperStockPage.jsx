// ============================================
// ARAB UNITY SCHOOL
// Paper Stock Management
// A4 / A3 Paper Stock Only
// ============================================

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";

import {
  getPaperStock,
  updatePaperStock,
} from "../../../services/paperStockService";

export default function PaperStockPage() {
  const [a4Stock, setA4Stock] = useState(0);
  const [a3Stock, setA3Stock] = useState(0);

  // ============================================
  // Load Paper Stock
  // ============================================

  const loadStock = async () => {
    try {
      const data = await getPaperStock();

      const a4 =
        data.stock.find(
          (item) => item.PaperType === "A4"
        )?.CurrentStock || 0;

      const a3 =
        data.stock.find(
          (item) => item.PaperType === "A3"
        )?.CurrentStock || 0;

      setA4Stock(a4);
      setA3Stock(a3);
    } catch (error) {
      console.error(error);
      alert("Failed to load paper stock");
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  // ============================================
  // Save Paper Stock
  // ============================================

  const handleSave = async () => {
    try {
      await updatePaperStock({
        a4Stock,
        a3Stock,
      });

      alert("Paper stock updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update paper stock");
    }
  };

  return (
    <>
      <PageHeader
        title="Paper Stock"
        subtitle="Manage A4 and A3 paper inventory"
      />

      <Grid container spacing={3}>
        {/* A4 KPI */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              A4 Paper Stock
            </Typography>

            <Typography
              variant="h2"
              color="primary"
              mt={2}
            >
              {a4Stock}
            </Typography>

            <Typography color="text.secondary">
              Reams Available
            </Typography>
          </Paper>
        </Grid>

        {/* A3 KPI */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              A3 Paper Stock
            </Typography>

            <Typography
              variant="h2"
              color="primary"
              mt={2}
            >
              {a3Stock}
            </Typography>

            <Typography color="text.secondary">
              Reams Available
            </Typography>
          </Paper>
        </Grid>

        {/* Update Form */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              mb={3}
            >
              Update Stock
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="A4 Stock"
                type="number"
                value={a4Stock}
                onChange={(e) =>
                  setA4Stock(
                    Number(e.target.value)
                  )
                }
              />

              <TextField
                label="A3 Stock"
                type="number"
                value={a3Stock}
                onChange={(e) =>
                  setA3Stock(
                    Number(e.target.value)
                  )
                }
              />

              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  bgcolor: "#2E8B3C",
                  px: 4,
                }}
              >
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
