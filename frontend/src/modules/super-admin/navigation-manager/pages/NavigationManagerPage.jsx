import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import usePageTitle from "@platform/hooks/usePageTitle";
import {
  AppButton,
  AppCard,
  AppDataTable,
  AppPageHeader,
} from "@platform/ui";
import api from "@services/api";

const blank = {
  menuKey: "",
  menuName: "",
  moduleId: "",
  parentMenuId: "",
  route: "",
  icon: "",
  permissionId: "",
  featureFlagId: "",
  visibilityStatusId: "",
  menuGroupId: "",
  sortOrder: 0,
  isPinned: false,
  isCollapsible: true,
};

export default function NavigationManagerPage() {
  usePageTitle("Navigation Manager");
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/navigation-manager", {
        params: { page: 1, limit: 100, search, rootOnly: false },
      });
      const payload = response?.data;
      const body = payload?.data ?? payload;
      setRows(Array.isArray(body) ? body : (body?.data ?? body?.items ?? body?.rows ?? []));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load navigation menus.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get("/navigation-manager/lookups")
      .then((r) => setLookups(r?.data?.data ?? r?.data ?? {}))
      .catch(() => setError("Unable to load navigation lookups."));
  }, []);

  const tree = rows.reduce((acc, menu) => {
    const parentId = menu.ParentMenuId ?? null;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(menu);
    return acc;
  }, {});

  const parentMenus = (tree[null] || [])
    .slice()
    .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0));

  const toggleExpand = (menuId) => {
    setExpandedParents((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const openAdd = (parentMenuId = null) => {
    setEditing(null);
    setForm({
      ...blank,
      parentMenuId: parentMenuId ? String(parentMenuId) : "",
    });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      menuKey: row.MenuKey || "",
      menuName: row.MenuName || "",
      moduleId: row.ModuleId ? String(row.ModuleId) : "",
      parentMenuId: row.ParentMenuId ? String(row.ParentMenuId) : "",
      route: row.Route || "",
      icon: row.Icon || "",
      permissionId: row.PermissionId ? String(row.PermissionId) : "",
      featureFlagId: row.FeatureFlagId ? String(row.FeatureFlagId) : "",
      visibilityStatusId: row.VisibilityStatusId
        ? String(row.VisibilityStatusId)
        : "",
      menuGroupId: row.MenuGroupId ? String(row.MenuGroupId) : "",
      sortOrder: row.SortOrder ?? 0,
      isPinned: Boolean(row.IsPinned),
      isCollapsible: Boolean(row.IsCollapsible),
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({});
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = {
        menuKey: String(form.menuKey || "").trim(),
        menuName: String(form.menuName || "").trim(),
        moduleId: form.moduleId ? Number(form.moduleId) : null,
        parentMenuId: form.parentMenuId ? Number(form.parentMenuId) : null,
        route: form.route ? String(form.route).trim() : null,
        icon: form.icon ? String(form.icon).trim() : null,
        permissionId: form.permissionId ? Number(form.permissionId) : null,
        featureFlagId: form.featureFlagId ? Number(form.featureFlagId) : null,
        visibilityStatusId: form.visibilityStatusId
          ? Number(form.visibilityStatusId)
          : null,
        menuGroupId: form.menuGroupId ? Number(form.menuGroupId) : null,
        sortOrder: Number(form.sortOrder || 0),
        isPinned: Boolean(form.isPinned),
        isCollapsible: Boolean(form.isCollapsible),
      };

      if (!payload.menuKey || !payload.menuName || !payload.moduleId) {
        throw new Error("Menu Key, Menu Name, and Module are required.");
      }

      const id = editing?.MenuId;
      if (id) {
        await api.put(`/navigation-manager/${id}`, payload);
        setSuccess("Menu updated successfully.");
      } else {
        await api.post("/navigation-manager", payload);
        setSuccess("Menu created successfully.");
      }

      close();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save menu.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.MenuName}"? This will also remove its children.`)) return;
    try {
      setError("");
      await api.delete(`/navigation-manager/${row.MenuId}`);
      setSuccess("Menu deleted successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete menu.");
    }
  };

  const syncChildren = async (parent) => {
    try {
      setError("");
      setSuccess("");
      const children = tree[parent.MenuId] || [];
      if (!children.length) {
        setSuccess("No children to sync.");
        return;
      }

      await Promise.all(
        children.map((child) =>
          api.put(`/navigation-manager/${child.MenuId}`, {
            visibilityStatusId: parent.VisibilityStatusId,
            isPinned: parent.IsPinned,
            isCollapsible: parent.IsCollapsible,
            sortOrder: parent.SortOrder,
          })
        )
      );

      setSuccess(`Synced ${children.length} child menu(s) to match "${parent.MenuName}".`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sync children.");
    }
  };

  const columns = [
    { field: "MenuName", headerName: "Name" },
    { field: "MenuKey", headerName: "Key" },
    { field: "ModuleName", headerName: "Module" },
    { field: "Route", headerName: "Route" },
    {
      field: "VisibilityStatusName",
      headerName: "Status",
      render: (row) => (
        <Typography
          variant="caption"
          color={
            row.VisibilityStatusKey === "enabled"
              ? "success.main"
              : row.VisibilityStatusKey === "hidden"
                ? "text.secondary"
                : "error.main"
          }
        >
          {row.VisibilityStatusName}
        </Typography>
      ),
    },
    {
      field: "IsPinned",
      headerName: "Pinned",
      render: (row) => (row.IsPinned ? "Yes" : "No"),
    },
    {
      field: "SortOrder",
      headerName: "Sort",
    },
  ];

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="Navigation Manager"
        subtitle="Organize menus hierarchically. Parent settings cascade to children."
        actions={<AppButton onClick={() => openAdd(null)}>Add Menu</AppButton>}
      />
      <AppCard>
        <Stack spacing={2}>
          <TextField
            size="small"
            label="Search menus"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 400 }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <AppDataTable
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.MenuId}
          />
        </Stack>
      </AppCard>

      <Stack spacing={2}>
        {parentMenus.map((parent) => {
          const children = (tree[parent.MenuId] || [])
            .slice()
            .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0));
          const isExpanded = expandedParents[parent.MenuId] !== false;

          return (
            <Card key={parent.MenuId} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    flexWrap="wrap"
                  >
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => toggleExpand(parent.MenuId)}
                      sx={{ minWidth: 32, padding: 0 }}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </Button>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                      {parent.MenuName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {parent.MenuKey}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {parent.ModuleName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sort: {parent.SortOrder ?? 0}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEdit(parent)}
                    >
                      Edit Parent
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => syncChildren(parent)}
                    >
                      Sync Children
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openAdd(parent.MenuId)}
                    >
                      Add Child
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => remove(parent)}
                    >
                      Delete
                    </Button>
                  </Stack>

                  {isExpanded && children.length > 0 && (
                    <Stack spacing={1} sx={{ ml: 4, mt: 1 }}>
                      {children.map((child) => (
                        <Card
                          key={child.MenuId}
                          variant="outlined"
                          sx={{
                            borderLeft: (theme) =>
                              `4px solid ${theme.palette.primary.main}`,
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              flexWrap="wrap"
                            >
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {child.MenuName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {child.MenuKey}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {child.Route || "No route"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sort: {child.SortOrder ?? 0}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={
                                  child.VisibilityStatusKey === "enabled"
                                    ? "success.main"
                                    : "text.secondary"
                                }
                              >
                                {child.VisibilityStatusName}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openEdit(child)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => remove(child)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}

                  {isExpanded && children.length === 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 6, mt: 1 }}
                    >
                      No child menus.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Dialog
        open={open}
        onClose={close}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editing ? "Edit Menu" : "Add Menu"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Menu Key"
              value={form.menuKey || ""}
              onChange={(e) =>
                setForm({ ...form, menuKey: e.target.value })
              }
              required
              fullWidth
              disabled={Boolean(editing)}
            />
            <TextField
              label="Menu Name"
              value={form.menuName || ""}
              onChange={(e) =>
                setForm({ ...form, menuName: e.target.value })
              }
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Module</InputLabel>
              <Select
                value={form.moduleId || ""}
                onChange={(e) =>
                  setForm({ ...form, moduleId: e.target.value })
                }
                label="Module"
              >
                {(lookups.modules || []).map((mod) => (
                  <MenuItem key={mod.ModuleId} value={mod.ModuleId}>
                    {mod.ModuleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Parent Menu</InputLabel>
              <Select
                value={form.parentMenuId || ""}
                onChange={(e) =>
                  setForm({ ...form, parentMenuId: e.target.value })
                }
                label="Parent Menu"
              >
                <MenuItem value="">None (Root)</MenuItem>
                {(lookups.menus || [])
                  .filter(
                    (m) => String(m.MenuId) !== String(editing?.MenuId || "")
                  )
                  .map((menu) => (
                    <MenuItem key={menu.MenuId} value={menu.MenuId}>
                      {menu.MenuName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Route"
              value={form.route || ""}
              onChange={(e) =>
                setForm({ ...form, route: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Icon"
              value={form.icon || ""}
              onChange={(e) =>
                setForm({ ...form, icon: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Visibility Status</InputLabel>
              <Select
                value={form.visibilityStatusId || ""}
                onChange={(e) =>
                  setForm({ ...form, visibilityStatusId: e.target.value })
                }
                label="Visibility Status"
              >
                {(lookups.visibilityStatuses || []).map((status) => (
                  <MenuItem
                    key={status.VisibilityStatusId}
                    value={status.VisibilityStatusId}
                  >
                    {status.StatusName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Sort Order"
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.isPinned)}
                  onChange={(e) =>
                    setForm({ ...form, isPinned: e.target.checked })
                  }
                />
              }
              label="Pinned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.isCollapsible)}
                  onChange={(e) =>
                    setForm({ ...form, isCollapsible: e.target.checked })
                  }
                />
              }
              label="Collapsible"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <AppButton
            variant="outlined"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
