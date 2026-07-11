import { useEffect, useState } from "react";
import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const EMPTY_FORM = { assetId: "", borrowedByUserId: "", expectedReturnAt: "", notes: "" };

export default function BorrowAssetDialog({ open, assets = [], users = [], saving = false, error = "", onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  useEffect(() => {
    // Reset the transient form each time the reusable dialog opens.
     
    if (open) setForm(EMPTY_FORM);
  }, [open]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <AppDialog open={open} title="Borrow Asset" subtitle="Record temporary custody with an expected return date."
    maxWidth="md" loading={saving} error={error} primaryText="Borrow Asset" secondaryText="Cancel"
    disablePrimary={!form.assetId || !form.borrowedByUserId || !form.expectedReturnAt}
    onPrimary={() => onSubmit({ ...form, expectedReturnAt: new Date(form.expectedReturnAt).toISOString() })}
    onClose={onClose} onSecondary={onClose}>
    <AppFormGrid>
      <AppFormField type="autocomplete" label="Available Asset" value={form.assetId} onChange={(value) => update("assetId", value)}
        options={assets} valueKey="AssetId" labelKey="AssetDisplayName" required full />
      <AppFormField type="autocomplete" label="Borrower" value={form.borrowedByUserId} onChange={(value) => update("borrowedByUserId", value)}
        options={users} valueKey="UserId" labelKey="FullName" required />
      <AppFormField label="Expected Return" inputType="datetime-local" value={form.expectedReturnAt}
        onChange={(value) => update("expectedReturnAt", value)} required />
      <AppFormField label="Borrow Notes" value={form.notes} onChange={(value) => update("notes", value)} multiline minRows={3} full />
    </AppFormGrid>
  </AppDialog>;
}
