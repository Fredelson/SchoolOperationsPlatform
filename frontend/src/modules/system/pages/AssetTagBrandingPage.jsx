import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";
import { usePermissions } from "../../../context/PermissionContext";
import buildFileUrl from "../../../platform/utils/buildFileUrl";

import {
  getAssetTagBranding,
  removeAssetTagTemplate,
  saveAssetTagBranding,
  uploadAssetTagTemplate,
} from "../../it-assets/services/assetTagBrandingService";
import RoundedAssetLabel from "../../it-assets/components/labels/RoundedAssetLabel";
import AssetLabel from "../../it-assets/components/labels/AssetLabel";

const sampleAsset = {
  AssetId: 1184,
  AssetTag: "AUS01184",
  AssetCode: "AUS01184",
  ModelName: "Sample Laptop",
};

const labels = {
  schoolTagline: "School Tagline",
  departmentLabel: "Department Label",
  propertyLabel: "Property Label",
  establishedYear: "Established Year",
  websiteQrInstruction: "Website QR Instruction",
  assetQrInstruction: "Asset QR Instruction",
  contentLabel: "Content Label",
};

const colorLabels = {
  outerRing: "Outer Ring",
  innerRing: "Inner Ring",
  accent: "Accent",
  background: "Background",
  mainText: "Main Text",
  secondaryText: "Secondary Text",
  border: "Border",
  barcode: "Barcode",
  qrForeground: "QR Foreground",
  qrBackground: "QR Background",
  propertyText: "Property Text",
  assetCode: "Asset Code",
  departmentText: "Department Text",
};

const visibilityLabels = {
  showWebsite: "Show Website",
  showAddress: "Show Address",
  showEstablishedYear: "Show Established Year",
  showPropertyLabel: "Show Property Label",
  showSocialIcons: "Show Social Icons",
  showSchoolLogo: "Show School Logo",
  showSchoolTagline: "Show School Tagline",
  showWebsiteQr: "Show Website QR",
  showAssetQr: "Show Asset QR",
  showBarcode: "Show Barcode",
  showQrCode: "Show QR Code",
  showLogo: "Show School Logo",
  showBorder: "Show Border",
};

const printLabels = {
  pageSize: "Page Size",
  orientation: "Orientation",
  labelDiameter: "Label Diameter (mm)",
  marginTop: "Top Margin (mm)",
  marginBottom: "Bottom Margin (mm)",
  marginLeft: "Left Margin (mm)",
  marginRight: "Right Margin (mm)",
  horizontalOffset: "Horizontal Offset (mm)",
  verticalOffset: "Vertical Offset (mm)",
  printScale: "Print Scale",
};

const hexPattern = /^#[0-9A-Fa-f]{6}$/;

const clone = (value) => JSON.parse(JSON.stringify(value || {}));

const setNestedValue = (source, group, key, value) => {
  if (!group) {
    return {
      ...source,
      [key]: value,
    };
  }

  return {
    ...source,
    [group]: {
      ...(source[group] || {}),
      [key]: value,
    },
  };
};

const formatLabel = (key) =>
  labels[key] ||
  colorLabels[key] ||
  visibilityLabels[key] ||
  printLabels[key] ||
  key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());

function validateDraft(type, draft) {
  const warnings = [];

  Object.entries(draft?.colors || {}).forEach(([key, value]) => {
    if (!hexPattern.test(String(value || ""))) {
      warnings.push(`${formatLabel(key)} must be a six-digit HEX color.`);
    }
  });

  if (type === "rounded") {
    [
      "schoolTagline",
      "departmentLabel",
      "propertyLabel",
      "websiteQrInstruction",
      "assetQrInstruction",
    ].forEach((key) => {
      if (!String(draft?.[key] || "").trim()) {
        warnings.push(`${formatLabel(key)} is required.`);
      }
    });

    if (!/^\d{4}$/.test(String(draft?.establishedYear || ""))) {
      warnings.push("Established Year must be four digits.");
    }

    if (Number(draft?.print?.labelDiameter || 0) <= 0) {
      warnings.push("Label Diameter must be positive.");
    }
  }

  Object.entries(draft?.visibility || {}).forEach(([key, value]) => {
    if (typeof value !== "boolean") {
      warnings.push(`${formatLabel(key)} must be Boolean.`);
    }
  });

  Object.entries(draft?.print || {}).forEach(([key, value]) => {
    if (["pageSize", "orientation", "templateKey"].includes(key)) return;
    if (!Number.isFinite(Number(value))) {
      warnings.push(`${formatLabel(key)} must be numeric.`);
    }
  });

  return warnings;
}

function ColorField({ name, value, defaultValue, onChange, onReset, disabled = false }) {
  const valid = hexPattern.test(String(value || ""));
  const colorValue = valid ? value : defaultValue || "#000000";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "44px minmax(0, 1fr) 36px auto",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        component="input"
        type="color"
        aria-label={formatLabel(name)}
        value={colorValue}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        disabled={disabled}
        sx={{
          width: 44,
          height: 38,
          p: 0,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          background: "transparent",
        }}
      />

      <TextField
        size="small"
        label={formatLabel(name)}
        value={value || ""}
        error={!valid}
        helperText={valid ? " " : "Use #RRGGBB."}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        disabled={disabled}
      />

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: colorValue,
        }}
      />

      <AppButton size="small" variant="outlined" onClick={onReset} disabled={disabled} sx={{ px: 1.25 }}>
        Reset
      </AppButton>
    </Box>
  );
}

function SectionTitle({ children, helper }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h6" fontWeight={900}>
        {children}
      </Typography>
      {helper && (
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Stack>
  );
}

export default function AssetTagBrandingPage({ type = "rounded" }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateUploading, setTemplateUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { hasPermission } = usePermissions();
  const canManage = hasPermission(`asset_tag_branding.${type}.manage`);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const result = await getAssetTagBranding(type);

        if (!active) return;

        setData(result);
        setDraft(clone(result.settings));
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load asset tag branding."
        );
        setData(null);
        setDraft(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [type]);

  const warnings = useMemo(() => validateDraft(type, draft || {}), [draft, type]);
  const defaults = data?.defaults || {};

  const updateDraft = (group, key, value) => {
    setDraft((current) => setNestedValue(current || {}, group, key, value));
    setMessage("");
  };

  const resetUnsaved = () => {
    setDraft(clone(data?.settings));
    setMessage("Unsaved changes were reset.");
  };

  const restoreDefaults = () => {
    setDraft(clone(defaults));
    setMessage("Recommended defaults restored locally. Save to apply them.");
  };

  const save = async () => {
    if (!canManage || warnings.length) return;

    try {
      setSaving(true);
      setError("");
      const result = await saveAssetTagBranding(type, draft);
      setData(result);
      setDraft(clone(result.settings));
      setMessage("Branding saved.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save asset tag branding."
      );
    } finally {
      setSaving(false);
    }
  };

  const applyBrandingResult = (result) => {
    setData(result);
    setDraft(clone(result.settings));
  };

  const uploadTemplate = async (file) => {
    if (!file || !canManage) return;

    try {
      setTemplateUploading(true);
      setError("");
      setMessage("");
      const result = await uploadAssetTagTemplate(type, file);
      applyBrandingResult(result);
      setMessage("Rounded tag template uploaded and applied.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to upload the rounded tag template."
      );
    } finally {
      setTemplateUploading(false);
    }
  };

  const removeTemplate = async () => {
    if (!canManage) return;

    try {
      setTemplateUploading(true);
      setError("");
      setMessage("");
      const result = await removeAssetTagTemplate(type);
      applyBrandingResult(result);
      setMessage("Rounded tag template removed. The generated label is active again.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to remove the rounded tag template."
      );
    } finally {
      setTemplateUploading(false);
    }
  };

  if (loading) {
    return <AppLoadingState title="Loading asset tag branding..." />;
  }

  if (error && !draft) {
    return (
      <AppCard>
        <AppEmptyState title="Unable to load branding" message={error} />
      </AppCard>
    );
  }

  const isRounded = type === "rounded";
  const title = isRounded
    ? "Rounded Asset Tag Branding"
    : "Rectangular Asset Tag Branding";

  const textFields = isRounded
    ? [
        "schoolTagline",
        "departmentLabel",
        "propertyLabel",
        "establishedYear",
        "websiteQrInstruction",
        "assetQrInstruction",
      ]
    : ["contentLabel", "propertyLabel"];
  const template = draft?.template || null;
  const templateUrl = buildFileUrl(template?.filePath || "");

  return (
    <Box>
      <AppPageHeader
        title={title}
        subtitle="Configure asset-label content, colors, visibility, and print calibration."
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Stack spacing={2.5}>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            {!canManage && (
              <Alert severity="info">
                You can view this branding page, but managing settings requires the manage permission.
              </Alert>
            )}
            {warnings.map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}

            <AppCard>
              <Stack spacing={2}>
                <SectionTitle helper="Visible copy used by the production label component.">
                  Label Content
                </SectionTitle>

                <Grid container spacing={2}>
                  {textFields.map((key) => (
                    <Grid item xs={12} sm={key.includes("Instruction") ? 12 : 6} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        label={formatLabel(key)}
                        value={draft?.[key] || ""}
                        onChange={(event) => updateDraft(null, key, event.target.value)}
                        disabled={!canManage}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </AppCard>

            {isRounded && (
              <AppCard>
                <Stack spacing={2}>
                  <SectionTitle helper="Upload the square artwork without a sample barcode, QR code, or asset number. The live asset data is placed over the template automatically.">
                    Rounded Tag Template
                  </SectionTitle>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", sm: 132 },
                        maxWidth: 180,
                        aspectRatio: "1 / 1",
                        flexShrink: 0,
                        overflow: "hidden",
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.default",
                      }}
                    >
                      {templateUrl ? (
                        <Box
                          component="img"
                          src={templateUrl}
                          alt="Rounded asset tag template"
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                    </Box>

                    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={800}>
                        {template?.fileName || "No template uploaded"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PNG, JPG, or WEBP. A 1:1 image gives the cleanest print result.
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <AppButton
                          component="label"
                          variant="outlined"
                          startIcon={<UploadFileOutlinedIcon />}
                          disabled={!canManage || templateUploading}
                        >
                          {templateUploading ? "Uploading..." : "Upload Template"}
                          <input
                            hidden
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              uploadTemplate(file);
                            }}
                          />
                        </AppButton>

                        <AppButton
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlinedIcon />}
                          disabled={!canManage || templateUploading || !templateUrl}
                          onClick={removeTemplate}
                        >
                          Use Generated Label
                        </AppButton>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </AppCard>
            )}

            <AppCard>
              <Stack spacing={2}>
                <SectionTitle helper="These colors are independent from Platform Colors.">
                  Label Colors
                </SectionTitle>

                <Grid container spacing={1.5}>
                  {Object.entries(draft?.colors || {}).map(([key, value]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <ColorField
                        name={key}
                        value={value}
                        defaultValue={defaults?.colors?.[key]}
                        onChange={(nextValue) => updateDraft("colors", key, nextValue)}
                        onReset={() => updateDraft("colors", key, defaults?.colors?.[key])}
                        disabled={!canManage}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </AppCard>

            <AppCard>
              <Stack spacing={2}>
                <SectionTitle>
                  Visibility
                </SectionTitle>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {Object.entries(draft?.visibility || {}).map(([key, value]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Switch
                          checked={Boolean(value)}
                          onChange={(event) =>
                            updateDraft("visibility", key, event.target.checked)
                          }
                          disabled={!canManage}
                        />
                      }
                      label={formatLabel(key)}
                    />
                  ))}
                </Box>
              </Stack>
            </AppCard>

            <AppCard>
              <Stack spacing={2}>
                <SectionTitle helper={isRounded ? "FULL_A4 is the only enabled rounded template in this phase." : "Foundation settings only; rectangular layout behavior is preserved."}>
                  Full-A4 Print Settings
                </SectionTitle>

                <Grid container spacing={2}>
                  {Object.entries(draft?.print || {}).map(([key, value]) => {
                    if (["templateKey", "rows", "columns", "gapHorizontal", "gapVertical"].includes(key)) {
                      return null;
                    }

                    if (key === "pageSize" || key === "orientation") {
                      return (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label={formatLabel(key)}
                            value={value}
                            disabled={!canManage || key === "pageSize" || (isRounded && key === "orientation")}
                            onChange={(event) => updateDraft("print", key, event.target.value)}
                          >
                            {(key === "pageSize" ? ["A4"] : ["portrait"]).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      );
                    }

                    return (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={formatLabel(key)}
                          value={value}
                          disabled={!canManage}
                          inputProps={{ step: key === "printScale" ? 0.01 : 1 }}
                          onChange={(event) =>
                            updateDraft("print", key, Number(event.target.value))
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </AppCard>

            <AppCard>
              <Stack spacing={2}>
                <SectionTitle>
                  Calibration
                </SectionTitle>
                <Typography color="text.secondary">
                  Use the offset and scale fields above for printer calibration. Print at 100% or Actual Size.
                </Typography>
                <Divider />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <AppButton
                    startIcon={<SaveOutlinedIcon />}
                    onClick={save}
                    disabled={!canManage || saving || warnings.length > 0}
                  >
                    {saving ? "Saving..." : "Save Branding"}
                  </AppButton>
                  <AppButton
                    variant="outlined"
                    startIcon={<RestartAltOutlinedIcon />}
                    onClick={resetUnsaved}
                    disabled={saving}
                  >
                    Reset Unsaved Changes
                  </AppButton>
                  <AppButton
                    variant="outlined"
                    startIcon={<SettingsBackupRestoreOutlinedIcon />}
                    onClick={restoreDefaults}
                    disabled={!canManage || saving}
                  >
                    Restore Recommended Defaults
                  </AppButton>
                </Stack>
              </Stack>
            </AppCard>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={5}>
          <AppCard
            sx={{
              position: { lg: "sticky" },
              top: { lg: 96 },
            }}
          >
            <Stack spacing={2}>
              <SectionTitle helper="This preview renders the production label component.">
                Live Preview
              </SectionTitle>

              {isRounded ? (
                <Box sx={{ width: "100%", maxWidth: 520, mx: "auto" }}>
                  <RoundedAssetLabel
                    asset={sampleAsset}
                    branding={{
                      ...data,
                      settings: draft,
                    }}
                    showWarnings
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 520,
                    height: 180,
                    mx: "auto",
                  }}
                >
                  <AssetLabel
                    asset={sampleAsset}
                    showQrCode={draft?.visibility?.showQrCode}
                    showBarcode={draft?.visibility?.showBarcode}
                    showLogo={draft?.visibility?.showLogo}
                    showBorder={draft?.visibility?.showBorder}
                  />
                </Box>
              )}
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
}
