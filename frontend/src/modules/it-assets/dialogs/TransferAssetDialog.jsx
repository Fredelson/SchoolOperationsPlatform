import { useMemo, useState } from "react";

import { AppDialog, AppFormField, AppFormGrid } from "../../../platform/ui";

const TransferAssetDialog = ({
  open,
  asset,
  lookups = {},
  saving = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => ({
      toUserId: asset?.CurrentAssignedUserId || "",
      toDepartmentId: asset?.CurrentDepartmentId || "",
      toLocationId: asset?.CurrentLocationId || "",
      toRoomId: asset?.CurrentRoomId || "",
      transferReason: "",
  }));

  const rooms = useMemo(
    () =>
      (lookups.rooms || []).filter(
        (room) =>
          !form.toLocationId ||
          Number(room.LocationId) === Number(form.toLocationId)
      ),
    [lookups.rooms, form.toLocationId]
  );

  const roomOptions = useMemo(() => {
    if (rooms.length > 0) return rooms;
    if (lookups.rooms?.length) return lookups.rooms;
    return [];
  }, [rooms, lookups.rooms]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changed =
    Number(form.toUserId || 0) !== Number(asset?.CurrentAssignedUserId || 0) ||
    Number(form.toDepartmentId || 0) !== Number(asset?.CurrentDepartmentId || 0) ||
    Number(form.toLocationId || 0) !== Number(asset?.CurrentLocationId || 0) ||
    Number(form.toRoomId || 0) !== Number(asset?.CurrentRoomId || 0);

  const handleSubmit = () => {
    onSubmit({
      assetId: asset?.AssetId,
      toUserId: form.toUserId || null,
      toDepartmentId: form.toDepartmentId || null,
      toLocationId: form.toLocationId || null,
      toRoomId: form.toRoomId || null,
      transferReason: form.transferReason.trim() || null,
    });
  };

  return (
    <AppDialog
      open={open}
      title="Transfer Asset"
      subtitle={asset?.AssetTag || "Selected asset"}
      maxWidth="md"
      loading={saving}
      error={error}
      primaryText="Transfer Asset"
      secondaryText="Cancel"
      disablePrimary={!asset?.AssetId || !changed}
      onPrimary={handleSubmit}
      onClose={onClose}
      onSecondary={onClose}
    >
      <AppFormGrid>
        <AppFormField
          type="autocomplete"
          label="Assigned User"
          value={form.toUserId}
          onChange={(value) => updateField("toUserId", value)}
          options={lookups.users || []}
          valueKey="UserId"
          labelKey="FullName"
          full
        />
        <AppFormField
          type="autocomplete"
          label="Department"
          value={form.toDepartmentId}
          onChange={(value) => updateField("toDepartmentId", value)}
          options={lookups.departments || []}
          valueKey="DepartmentId"
          labelKey="DepartmentName"
        />
        <AppFormField
          type="autocomplete"
          label="Location"
          value={form.toLocationId}
          onChange={(value) => {
            updateField("toLocationId", value);
            updateField("toRoomId", "");
          }}
          options={lookups.locations || []}
          valueKey="LocationId"
          labelKey="LocationName"
        />
        <AppFormField
          type="autocomplete"
          label="Room"
          value={form.toRoomId}
          onChange={(value) => updateField("toRoomId", value)}
          options={roomOptions}
          valueKey="RoomId"
          labelKey="RoomName"
        />
        <AppFormField
          label="Transfer reason"
          value={form.transferReason}
          onChange={(value) => updateField("transferReason", value)}
          multiline
          minRows={3}
          full
        />
      </AppFormGrid>
    </AppDialog>
  );
};

export default TransferAssetDialog;
