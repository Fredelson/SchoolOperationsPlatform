import { useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const MaintenanceDialog = ({ open, asset, saving, error, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    maintenanceType: "",
    description: "",
    cost: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const costIsValid =
    form.cost === "" || (Number.isFinite(Number(form.cost)) && Number(form.cost) >= 0);

  return (
    <AppDialog
      open={open}
      title="Record Maintenance"
      subtitle={asset?.AssetTag || "Selected asset"}
      maxWidth="sm"
      loading={saving}
      error={error}
      primaryText="Start Maintenance"
      secondaryText="Cancel"
      disablePrimary={!asset?.AssetId || !form.maintenanceType.trim() || !costIsValid}
      onPrimary={() =>
        onSubmit({
          assetId: asset.AssetId,
          maintenanceType: form.maintenanceType.trim(),
          description: form.description.trim() || null,
          cost: form.cost === "" ? null : Number(form.cost),
        })
      }
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          label="Maintenance Type"
          value={form.maintenanceType}
          onChange={(value) => updateField("maintenanceType", value)}
          required
          full
        />
        <AppFormField
          label="Estimated / Actual Cost"
          value={form.cost}
          onChange={(value) => updateField("cost", value)}
          helperText={
            costIsValid
              ? "Enter the amount without a currency symbol."
              : "Enter a valid amount of zero or more."
          }
          full
        />
        <AppFormField
          label="Description"
          value={form.description}
          onChange={(value) => updateField("description", value)}
          multiline
          minRows={4}
          full
        />
      </AppFormGrid>
    </AppDialog>
  );
};

export default MaintenanceDialog;
