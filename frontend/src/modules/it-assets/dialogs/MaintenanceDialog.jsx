import { useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const MaintenanceDialog = ({ open, asset, saving, error, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    issue: "",
    description: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

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
      disablePrimary={!asset?.AssetId || !form.issue.trim()}
      onPrimary={() =>
        onSubmit({
          assetId: asset.AssetId,
          maintenanceType: form.issue.trim(),
          description: form.description.trim() || null,
        })
      }
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          label="Issue"
          value={form.issue}
          onChange={(value) => updateField("issue", value)}
          required
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
