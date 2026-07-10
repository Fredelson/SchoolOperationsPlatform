import { useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const DisposalDialog = ({ open, asset, saving, error, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  return (
    <AppDialog
      open={open}
      title="Request Asset Disposal"
      subtitle={asset?.AssetTag || "Selected asset"}
      maxWidth="sm"
      loading={saving}
      error={error}
      primaryText="Submit for Review"
      secondaryText="Cancel"
      disablePrimary={!asset?.AssetId || !reason.trim()}
      onPrimary={() => onSubmit({ assetId: asset.AssetId, reason: reason.trim() })}
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          label="Disposal Reason"
          value={reason}
          onChange={setReason}
          helperText="This creates a pending request. The asset is not disposed until it is reviewed, approved, and confirmed."
          multiline
          minRows={5}
          required
          full
        />
      </AppFormGrid>
    </AppDialog>
  );
};

export default DisposalDialog;
