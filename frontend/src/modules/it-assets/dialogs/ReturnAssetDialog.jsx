// ============================================
// Return Asset Dialog
// Arab Unity School Operations Platform
// ============================================

import { useEffect, useMemo, useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const initialForm = {
  returnConditionId: "",
  returnIssueTypeIds: [],
  notes: "",
};

const ISSUE_REQUIRED_CONDITIONS = ["Fair", "Poor", "Damaged", "Beyond Repair"];

const ReturnAssetDialog = ({
  open,
  asset,
  lookups = {},
  saving = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);

  const conditions = lookups.conditions || [];
  const issueTypes = lookups.issueTypes || [];

  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  const selectedCondition = useMemo(
    () =>
      conditions.find(
        (condition) =>
          String(condition.ITAssetConditionId) ===
          String(form.returnConditionId)
      ) || null,
    [conditions, form.returnConditionId]
  );

  const requiresIssue = ISSUE_REQUIRED_CONDITIONS.includes(
    selectedCondition?.ConditionName
  );

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const canSubmit =
    Boolean(form.returnConditionId) &&
    (!requiresIssue || form.returnIssueTypeIds.length > 0);

  const handleSubmit = () => {
    onSubmit({
      returnConditionId: form.returnConditionId || null,
      returnIssueTypeIds: requiresIssue ? form.returnIssueTypeIds : [],
      notes: form.notes || null,
    });
  };

  return (
    <AppDialog
      open={open}
      title="Return Asset"
      subtitle={asset?.AssetTag || "Selected asset"}
      maxWidth="md"
      loading={saving}
      error={error}
      primaryText="Return Asset"
      secondaryText="Cancel"
      disablePrimary={!canSubmit}
      onPrimary={handleSubmit}
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          type="autocomplete"
          label="Return Condition"
          value={form.returnConditionId}
          onChange={(value) => {
            updateField("returnConditionId", value);
            updateField("returnIssueTypeIds", []);
          }}
          options={conditions}
          valueKey="ITAssetConditionId"
          labelKey="ConditionName"
          required
          full
        />

        {requiresIssue && (
          <AppFormField
            type="autocomplete"
            label="Required Action / Issue"
            value={form.returnIssueTypeIds}
            onChange={(value) => updateField("returnIssueTypeIds", value)}
            options={issueTypes}
            valueKey="IssueTypeId"
            labelKey="IssueTypeName"
            required
            multiple
            full
          />
        )}

        <AppFormField
          label={requiresIssue ? "Issue / Return Remarks" : "Return Remarks"}
          value={form.notes}
          onChange={(value) => updateField("notes", value)}
          multiline
          minRows={4}
          full
        />
      </AppFormGrid>
    </AppDialog>
  );
};

export default ReturnAssetDialog;