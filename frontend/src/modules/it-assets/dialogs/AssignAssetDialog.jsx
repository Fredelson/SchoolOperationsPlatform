// ============================================
// Assign Asset Dialog
// Arab Unity School Operations Platform
// ============================================

import { useEffect, useState } from "react";

import {
  AppDialog,
  AppFormField,
  AppFormGrid,
} from "../../../platform/ui";

const initialForm = {
  assignedToUserId: "",
  assignedToName: "",
  assignedToEmail: "",
  assignedToEmployeeCode: "",
  departmentId: "",
  locationId: "",
  roomId: "",
  notes: "",
};

const AssignAssetDialog = ({
  open,
  asset,
  lookups = {},
  saving = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);

  const users = lookups.users || [];
  const departments = lookups.departments || [];
  const locations = lookups.locations || [];
  const rooms = lookups.rooms || [];

  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleUserChange = (userId, user) => {
    setForm((previous) => ({
      ...previous,
      assignedToUserId: userId || "",
      assignedToName: user?.FullName || "",
      assignedToEmail: user?.SchoolEmail || "",
      assignedToEmployeeCode: user?.EmployeeId || "",
    }));
  };

  const handleSubmit = () => {
    const assignmentTargetType = form.assignedToUserId || form.assignedToName
      ? "USER"
      : form.roomId
      ? "ROOM"
      : form.departmentId
      ? "DEPARTMENT"
      : "LOCATION";

    onSubmit({
      assetId: asset?.AssetId,
      assignmentTargetType,
      assignedToUserId: form.assignedToUserId || null,
      assignedToName: form.assignedToName || null,
      assignedToEmail: form.assignedToEmail || null,
      assignedToEmployeeCode: form.assignedToEmployeeCode || null,
      departmentId: form.departmentId || null,
      locationId: form.locationId || null,
      roomId: form.roomId || null,
      notes: form.notes || null,
    });
  };

  const canSubmit =
    Boolean(asset?.AssetId) &&
    Boolean(
      form.assignedToUserId ||
        form.assignedToName ||
        form.roomId ||
        form.departmentId ||
        form.locationId
    );

  return (
    <AppDialog
      open={open}
      title="Assign Asset"
      subtitle={asset?.AssetTag || "Selected asset"}
      maxWidth="md"
      loading={saving}
      error={error}
      primaryText="Assign Asset"
      secondaryText="Cancel"
      disablePrimary={!canSubmit}
      onPrimary={handleSubmit}
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          type="autocomplete"
          label="Assign To"
          value={form.assignedToUserId}
          onChange={handleUserChange}
          options={users}
          valueKey="UserId"
          labelKey="FullName"
          full
        />

        <AppFormField
          label="Assigned Name"
          value={form.assignedToName}
          onChange={(value) => updateField("assignedToName", value)}
        />

        <AppFormField
          label="Employee Code"
          value={form.assignedToEmployeeCode}
          onChange={(value) => updateField("assignedToEmployeeCode", value)}
        />

        <AppFormField
          label="Email"
          value={form.assignedToEmail}
          onChange={(value) => updateField("assignedToEmail", value)}
          full
        />

        <AppFormField
          type="autocomplete"
          label="Department"
          value={form.departmentId}
          onChange={(value) => updateField("departmentId", value)}
          options={departments}
          valueKey="DepartmentId"
          labelKey="DepartmentName"
        />

        <AppFormField
          type="autocomplete"
          label="Location"
          value={form.locationId}
          onChange={(value) => {
            updateField("locationId", value);
            updateField("roomId", "");
          }}
          options={locations}
          valueKey="LocationId"
          labelKey="LocationName"
        />

        <AppFormField
          type="autocomplete"
          label="Room"
          value={form.roomId}
          onChange={(value) => updateField("roomId", value)}
          options={rooms}
          valueKey="RoomId"
          labelKey="RoomName"
          full
        />

        <AppFormField
          label="Notes"
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

export default AssignAssetDialog;
