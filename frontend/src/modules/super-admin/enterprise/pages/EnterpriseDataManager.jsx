import { useCallback, useEffect, useState } from "react";
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField, Typography } from "@mui/material";

import api from "@services/api";
import usePageTitle from "@platform/hooks/usePageTitle";
import { AppButton, AppCard, AppDataTable, AppPageHeader } from "@platform/ui";

const valueOf = (row, key) => row?.[key] ?? row?.[key[0].toUpperCase() + key.slice(1)] ?? "";
const unwrapRows = (response) => {
  const payload = response?.data;
  const body = payload?.data ?? payload;
  if (Array.isArray(body)) return body;
  return body?.data ?? body?.items ?? body?.rows ?? [];
};

const CONFIG = {
  navigation: {
    title: "Navigation Manager", endpoint: "/navigation-manager", id: "menuId",
    fields: ["menuKey", "menuName", "moduleId", "parentMenuId", "route", "icon", "permissionId", "featureFlagId", "visibilityStatusId", "menuGroupId", "sortOrder", "isPinned", "isCollapsible"],
    required: ["menuKey", "menuName", "moduleId", "visibilityStatusId"],
    columns: ["menuName", "menuKey", "moduleName", "parentMenuName", "route", "groupName", "visibilityStatusName"],
  },
  permissionGroups: {
    title: "Permission Groups", endpoint: "/permission-groups", id: "permissionGroupId",
    fields: ["groupKey", "groupName", "description", "sortOrder"], required: ["groupKey", "groupName"],
    columns: ["groupName", "groupKey", "description", "sortOrder"],
  },
  permissions: {
    title: "Permission Manager", endpoint: "/permissions", id: "permissionId",
    fields: ["permissionKey", "permissionName", "moduleId", "permissionGroupId", "description", "isActive"],
    required: ["permissionKey", "permissionName", "moduleId"],
    columns: ["permissionName", "permissionKey", "moduleName", "permissionGroupName", "isActive"],
  },
  roles: {
    title: "Roles Manager", endpoint: "/roles", id: "roleId",
    fields: ["roleKey", "roleName", "displayName", "accessLevelId", "description", "isSystemRole", "isProtected"],
    required: ["roleKey", "roleName", "displayName", "accessLevelId"],
    columns: ["displayName", "roleKey", "accessLevelDisplayName", "description", "isSystemRole", "isProtected"],
  },
  rolePermissions: {
    title: "Role Permissions", endpoint: "/role-permissions", id: "rolePermissionId",
    fields: ["roleId", "permissionId", "isAllowed"], required: ["roleId", "permissionId"],
    columns: ["roleName", "permissionName", "permissionKey", "permissionGroupName", "isAllowed"],
  },
  userOverrides: {
    title: "User Permission Overrides", endpoint: "/user-permission-overrides", id: "userPermissionOverrideId",
    fields: ["userId", "permissionId", "isAllowed", "reason"], required: ["userId", "permissionId"],
    columns: ["userName", "permissionName", "permissionKey", "isAllowed", "reason"],
  },
};

const labelFor = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const booleanFields = new Set(["isActive", "isAllowed", "isPinned", "isCollapsible", "isSystemRole", "isProtected"]);
const numericFields = new Set(["moduleId", "parentMenuId", "permissionId", "permissionGroupId", "featureFlagId", "visibilityStatusId", "menuGroupId", "sortOrder", "accessLevelId", "roleId", "userId"]);

export default function EnterpriseDataManager({ type }) {
  const config = CONFIG[type];
  usePageTitle(config.title);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const response = await api.get(config.endpoint, { params: { page: 1, limit: 100, search } });
      setRows(unwrapRows(response));
    } catch (err) {
      setError(err?.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
    } finally { setLoading(false); }
  }, [config, search]);

  useEffect(() => {
    // Initial and filter-driven synchronization with the manager API.
     
    load();
  }, [load]);

  const openForm = (row = null) => {
    const values = {};
    config.fields.forEach((field) => { values[field] = row ? valueOf(row, field) : booleanFields.has(field) ? field === "isAllowed" || field === "isActive" : ""; });
    setEditing(row); setForm(values); setError("");
  };

  const save = async () => {
    try {
      setSaving(true); setError("");
      const payload = { ...form };
      numericFields.forEach((field) => { if (field in payload) payload[field] = payload[field] === "" ? null : Number(payload[field]); });
      const id = editing ? valueOf(editing, config.id) : null;
      if (id) await api.put(`${config.endpoint}/${id}`, payload); else await api.post(config.endpoint, payload);
      setEditing(null); setForm({}); await load();
    } catch (err) { setError(err?.response?.data?.message || "Unable to save record."); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    const id = valueOf(row, config.id);
    if (!id || !window.confirm("Delete this record?")) return;
    try { setSaving(true); await api.delete(`${config.endpoint}/${id}`); await load(); }
    catch (err) { setError(err?.response?.data?.message || "Unable to delete record."); }
    finally { setSaving(false); }
  };

  const columns = [
    ...config.columns.map((field) => ({ field, headerName: labelFor(field), render: (row) => {
      const value = valueOf(row, field); return typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—";
    } })),
    { field: "actions", headerName: "Actions", render: (row) => <Stack direction="row" spacing={1}><AppButton size="small" variant="outlined" onClick={() => openForm(row)}>Edit</AppButton><AppButton size="small" variant="outlined" color="error" onClick={() => remove(row)}>Delete</AppButton></Stack> },
  ];

  return <Stack spacing={3}>
    <AppPageHeader title={config.title} subtitle="Database-backed enterprise administration." actions={<AppButton onClick={() => openForm()}>Add Record</AppButton>} />
    <AppCard><Stack spacing={2}><TextField size="small" label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />{error && <Typography color="error">{error}</Typography>}<AppDataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => valueOf(row, config.id)} /></Stack></AppCard>
    <Dialog open={editing !== null || Object.keys(form).length > 0} onClose={() => !saving && (setEditing(null), setForm({}))} maxWidth="md" fullWidth>
      <DialogTitle>{editing ? "Edit" : "Add"} {config.title}</DialogTitle>
      <DialogContent dividers><Stack spacing={2}>{config.fields.map((field) => booleanFields.has(field) ? <FormControlLabel key={field} control={<Checkbox checked={Boolean(form[field])} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.checked }))} />} label={labelFor(field)} /> : <TextField key={field} label={labelFor(field)} required={config.required.includes(field)} type={numericFields.has(field) ? "number" : "text"} multiline={field === "description" || field === "reason"} value={form[field] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} />)}</Stack></DialogContent>
      <DialogActions><AppButton variant="outlined" onClick={() => { setEditing(null); setForm({}); }} disabled={saving}>Cancel</AppButton><AppButton onClick={save} disabled={saving || config.required.some((field) => !form[field])}>{saving ? "Saving..." : "Save"}</AppButton></DialogActions>
    </Dialog>
  </Stack>;
}

export const NavigationManagerPage = () => <EnterpriseDataManager type="navigation" />;
export const PermissionGroupsPage = () => <EnterpriseDataManager type="permissionGroups" />;
export const PermissionManagerPage = () => <EnterpriseDataManager type="permissions" />;
export const RolesManagerPage = () => <EnterpriseDataManager type="roles" />;
export const RolePermissionsPage = () => <EnterpriseDataManager type="rolePermissions" />;
export const UserPermissionOverridesPage = () => <EnterpriseDataManager type="userOverrides" />;
