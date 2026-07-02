// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// View Widget Dialog
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Stack,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";
import WidgetStatusChip from "../components/WidgetStatusChip";

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.4}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography fontWeight={700}>{value || "-"}</Typography>
    </Stack>
  );
}

export default function ViewWidgetDialog({ open, widget, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={900}>Widget Details</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DetailItem label="Widget Name" value={widget?.widgetName} />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem label="Widget Key" value={widget?.widgetKey} />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem label="Module" value={widget?.moduleName} />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem label="Widget Type" value={widget?.widgetType} />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem label="Data Source" value={widget?.dataSourceKey} />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem
              label="Visibility"
              value={<WidgetStatusChip status={widget?.visibilityStatusName} />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem
              label="Default Size"
              value={`${widget?.defaultWidth || 0} x ${
                widget?.defaultHeight || 0
              }`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailItem label="Sort Order" value={widget?.sortOrder} />
          </Grid>

          <Grid item xs={12}>
            <DetailItem label="Description" value={widget?.description} />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" justifyContent="flex-end">
              <AppButton variant="outlined" color="inherit" onClick={onClose}>
                Close
              </AppButton>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}