import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import { useNavigate } from "react-router-dom";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppCard,
  AppFormField,
  AppFormGrid,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";
import {
  createItAssetService,
  getItAssetLookupsService,
} from "../services/itAssetService";

const initialForm = {
  assetTag: "",
  itAssetCategoryId: "",
  itAssetBrandId: "",
  itAssetModelId: "",
  modelDescription: "",
  serialIpMac: "",
  itAssetStatusId: "",
  itAssetConditionId: "",
  currentDepartmentId: "",
  currentLocationId: "",
  currentRoomId: "",
  currentAssignedUserId: "",
  currentAssignedName: "",
  currentAssignedEmployeeCode: "",
  currentAssignedEmail: "",
  acquiredChangedDate: "",
  previousOwner: "",
};

const normalizeKey = (value) =>
  String(value || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

const optionalValue = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const SectionTitle = ({ icon, children }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
    <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
    <Typography variant="subtitle1" fontWeight={900}>
      {children}
    </Typography>
  </Stack>
);

const NewAsset = () => {
  usePageTitle("Add Asset");

  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLookups = async () => {
      try {
        setLoading(true);
        setError("");

        const lookupData = await getItAssetLookupsService();
        if (!active) return;

        const statuses = lookupData?.statuses || [];
        const availableStatus = statuses.find(
          (status) => normalizeKey(status.StatusKey) === "AVAILABLE"
        );

        setLookups(lookupData || {});
        setForm((previous) => ({
          ...previous,
          itAssetStatusId: availableStatus?.ITAssetStatusId || "",
        }));

        if (!availableStatus) {
          setError("The Available asset status is not configured.");
        }
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message || "Unable to load asset form options."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLookups();

    return () => {
      active = false;
    };
  }, []);

  const modelOptions = useMemo(() => {
    const models = lookups.models || [];
    const filteredModels = form.itAssetBrandId
      ? models.filter(
          (model) =>
            String(model.ITAssetBrandId) === String(form.itAssetBrandId)
        )
      : models;

    return filteredModels.map((model) => ({
      ...model,
      AssetModelLabel: [
        model.BrandName,
        model.ModelName,
        model.CategoryName ? `(${model.CategoryName})` : "",
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [form.itAssetBrandId, lookups.models]);

  const roomOptions = useMemo(() => {
    if (!form.currentLocationId) return lookups.rooms || [];

    return (lookups.rooms || []).filter(
      (room) =>
        String(room.LocationId) === String(form.currentLocationId)
    );
  }, [form.currentLocationId, lookups.rooms]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setForm((previous) => ({
      ...previous,
      itAssetCategoryId: categoryId,
    }));
  };

  const handleBrandChange = (brandId) => {
    setForm((previous) => ({
      ...previous,
      itAssetBrandId: brandId,
      itAssetModelId:
        !brandId ||
        String(
          (lookups.models || []).find(
            (model) =>
              String(model.ITAssetModelId) ===
              String(previous.itAssetModelId)
          )?.ITAssetBrandId
        ) === String(brandId)
          ? previous.itAssetModelId
          : "",
    }));
  };

  const handleModelChange = (modelId, model) => {
    setForm((previous) => ({
      ...previous,
      itAssetModelId: modelId,
      itAssetBrandId: model?.ITAssetBrandId || previous.itAssetBrandId,
    }));
  };

  const handleLocationChange = (locationId) => {
    setForm((previous) => ({
      ...previous,
      currentLocationId: locationId,
      currentRoomId: "",
    }));
  };

  const handleRoomChange = (roomId, room) => {
    setForm((previous) => ({
      ...previous,
      currentRoomId: roomId,
      currentLocationId: room?.LocationId || previous.currentLocationId,
    }));
  };

  const handleAssignedUserChange = (userId, user) => {
    setForm((previous) => ({
      ...previous,
      currentAssignedUserId: userId,
      currentAssignedName: user?.FullName || "",
      currentAssignedEmployeeCode: user?.EmployeeId || "",
      currentAssignedEmail: user?.SchoolEmail || "",
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");

      const createdAsset = await createItAssetService({
        assetTag: form.assetTag.trim(),
        itAssetCategoryId: form.itAssetCategoryId,
        itAssetModelId: form.itAssetModelId || null,
        modelDescription: optionalValue(form.modelDescription),
        serialIpMac: optionalValue(form.serialIpMac),
        itAssetStatusId: form.itAssetStatusId,
        itAssetConditionId: form.itAssetConditionId || null,
        currentDepartmentId: form.currentDepartmentId || null,
        currentLocationId: form.currentLocationId || null,
        currentRoomId: form.currentRoomId || null,
        currentAssignedUserId: form.currentAssignedUserId || null,
        currentAssignedName: optionalValue(form.currentAssignedName),
        currentAssignedEmployeeCode: optionalValue(
          form.currentAssignedEmployeeCode
        ),
        currentAssignedEmail: optionalValue(form.currentAssignedEmail),
        acquiredChangedDate: form.acquiredChangedDate || null,
        previousOwner: optionalValue(form.previousOwner),
      });

      if (!createdAsset?.AssetId) {
        throw new Error("The asset was created but no asset ID was returned.");
      }

      navigate(`/it-assets/${createdAsset.AssetId}`, { replace: true });
    } catch (err) {
      const responseErrors = err?.response?.data?.errors;
      setError(
        (Array.isArray(responseErrors) && responseErrors.join(" ")) ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to create the asset."
      );
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    Boolean(form.assetTag.trim()) &&
    Boolean(form.itAssetCategoryId) &&
    Boolean(form.itAssetStatusId) &&
    !saving;

  if (loading) {
    return <AppLoadingState title="Loading asset form..." />;
  }

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Assets", to: "/it-assets/dashboard" },
          { label: "Asset Management", to: "/it-assets/assets" },
          { label: "Add Asset" },
        ]}
      />

      <AppPageHeader
        title="Add Asset"
        subtitle="Create an IT asset record and capture its current placement."
        actions={
          <Stack direction="row" spacing={1}>
            <AppButton
              variant="outlined"
              disabled={saving}
              onClick={() => navigate("/it-assets/assets")}
            >
              Cancel
            </AppButton>
            <AppButton
              startIcon={<AddRoundedIcon />}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {saving ? "Creating..." : "Create Asset"}
            </AppButton>
          </Stack>
        }
      />

      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <AppCard>
          <SectionTitle icon={<DevicesOutlinedIcon />}>
            Asset Information
          </SectionTitle>

          <AppFormGrid>
            <AppFormField
              label="Asset Tag"
              value={form.assetTag}
              onChange={(value) => updateField("assetTag", value)}
              required
            />
            <AppFormField
              type="autocomplete"
              label="Category"
              value={form.itAssetCategoryId}
              onChange={handleCategoryChange}
              options={lookups.categories || []}
              valueKey="ITAssetCategoryId"
              labelKey="CategoryName"
              required
            />
            <AppFormField
              type="autocomplete"
              label="Brand"
              value={form.itAssetBrandId}
              onChange={handleBrandChange}
              options={lookups.brands || []}
              valueKey="ITAssetBrandId"
              labelKey="BrandName"
            />
            <AppFormField
              type="autocomplete"
              label="Model"
              value={form.itAssetModelId}
              onChange={handleModelChange}
              options={modelOptions}
              valueKey="ITAssetModelId"
              labelKey="AssetModelLabel"
            />
            <AppFormField
              label="Serial / IP / MAC"
              value={form.serialIpMac}
              onChange={(value) => updateField("serialIpMac", value)}
            />
            <AppFormField
              type="autocomplete"
              label="Condition"
              value={form.itAssetConditionId}
              onChange={(value) => updateField("itAssetConditionId", value)}
              options={lookups.conditions || []}
              valueKey="ITAssetConditionId"
              labelKey="ConditionName"
            />
            <TextField
              fullWidth
              type="date"
              label="Acquired / Changed Date"
              value={form.acquiredChangedDate}
              onChange={(event) =>
                updateField("acquiredChangedDate", event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <AppFormField
              label="Previous Owner"
              value={form.previousOwner}
              onChange={(value) => updateField("previousOwner", value)}
            />
            <AppFormField
              label="Model Description"
              value={form.modelDescription}
              onChange={(value) => updateField("modelDescription", value)}
              multiline
              minRows={3}
              full
            />
          </AppFormGrid>
        </AppCard>

        <AppCard>
          <SectionTitle icon={<LocationOnOutlinedIcon />}>
            Placement and Assignment
          </SectionTitle>

          <AppFormGrid>
            <AppFormField
              type="autocomplete"
              label="Department"
              value={form.currentDepartmentId}
              onChange={(value) =>
                updateField("currentDepartmentId", value)
              }
              options={lookups.departments || []}
              valueKey="DepartmentId"
              labelKey="DepartmentName"
            />
            <AppFormField
              type="autocomplete"
              label="Location"
              value={form.currentLocationId}
              onChange={handleLocationChange}
              options={lookups.locations || []}
              valueKey="LocationId"
              labelKey="LocationName"
            />
            <AppFormField
              type="autocomplete"
              label="Room"
              value={form.currentRoomId}
              onChange={handleRoomChange}
              options={roomOptions}
              valueKey="RoomId"
              labelKey="RoomName"
            />
            <AppFormField
              type="autocomplete"
              label="Assigned User"
              value={form.currentAssignedUserId}
              onChange={handleAssignedUserChange}
              options={lookups.users || []}
              valueKey="UserId"
              labelKey="FullName"
              full
            />
            <AppFormField
              label="Assigned Name"
              value={form.currentAssignedName}
              onChange={(value) => updateField("currentAssignedName", value)}
            />
            <AppFormField
              label="Employee Code"
              value={form.currentAssignedEmployeeCode}
              onChange={(value) =>
                updateField("currentAssignedEmployeeCode", value)
              }
            />
            <AppFormField
              label="Email"
              value={form.currentAssignedEmail}
              onChange={(value) => updateField("currentAssignedEmail", value)}
              full
            />
          </AppFormGrid>
        </AppCard>
      </Stack>
    </Box>
  );
};

export default NewAsset;
