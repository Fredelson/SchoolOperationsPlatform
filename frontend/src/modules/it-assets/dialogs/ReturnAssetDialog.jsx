// ============================================
// Return Asset Dialog
// Arab Unity School Operations Platform
// ============================================

import { useEffect, useMemo, useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const initialForm = {
  returnConditionId: "",
  requiredPartKeys: [],
  notes: "",
};

const RETURN_PART_OPTIONS = [
  { partKey: "MONITOR", partName: "MONITOR" },
  { partKey: "LCD", partName: "LCD" },
  { partKey: "RAM", partName: "RAM" },
  { partKey: "SSD", partName: "SSD" },
  { partKey: "BATTERY", partName: "BATTERY" },
  { partKey: "KEYBOARD", partName: "KEYBOARD" },
  { partKey: "NETWORK_CARD", partName: "NETWORK CARD" },
  { partKey: "BULB", partName: "BULB" },
  { partKey: "HDMI", partName: "HDMI" },
];

const ELIGIBLE_CATEGORY_KEYS = new Set([
  "laptop",
  "desktop",
  "desktopadminpc",
  "admindesktop",
  "adminpc",
  "computerlabpc",
  "projector",
]);

const normalizeCondition = (condition) =>
  String(condition?.ConditionKey || condition?.ConditionName || "")
    .trim()
    .toLowerCase();

const normalizeIdentifier = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

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

  const conditions = useMemo(
    () =>
      (lookups.conditions || [])
        .filter((condition) => normalizeCondition(condition) !== "fair")
        .map((condition) => {
          const key = normalizeCondition(condition);
          if (key === "damaged") {
            return { ...condition, ConditionName: "Need Parts" };
          }
          if (key === "needmaintenance") {
            return { ...condition, ConditionName: "Need Maintenance" };
          }
          return condition;
        }),
    [lookups.conditions]
  );

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

  const needsParts =
    normalizeIdentifier(selectedCondition?.ConditionKey) === "damaged" ||
    normalizeIdentifier(selectedCondition?.ConditionName) === "needparts";
  const supportsPartSelection = [asset?.CategoryKey, asset?.CategoryName]
    .map(normalizeIdentifier)
    .some((categoryKey) => ELIGIBLE_CATEGORY_KEYS.has(categoryKey));
  const showPartSelection = needsParts && supportsPartSelection;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const canSubmit =
    Boolean(form.returnConditionId) &&
    (!showPartSelection || form.requiredPartKeys.length > 0);

  const handleSubmit = () => {
    onSubmit({
      returnConditionId: form.returnConditionId || null,
      requiredPartKeys: showPartSelection ? form.requiredPartKeys : [],
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
          onChange={(value) =>
            setForm((previous) => ({
              ...previous,
              returnConditionId: value,
              requiredPartKeys: [],
            }))
          }
          options={conditions}
          valueKey="ITAssetConditionId"
          labelKey="ConditionName"
          required
          full
        />

        {showPartSelection && (
          <AppFormField
            type="autocomplete"
            label="Parts Required"
            value={form.requiredPartKeys}
            onChange={(value) => updateField("requiredPartKeys", value)}
            options={RETURN_PART_OPTIONS}
            valueKey="partKey"
            labelKey="partName"
            required
            multiple
            full
          />
        )}

        <AppFormField
          label="Return Remarks"
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
