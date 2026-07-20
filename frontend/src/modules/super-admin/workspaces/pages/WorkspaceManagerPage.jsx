import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import usePageTitle from "@platform/hooks/usePageTitle";
import { usePermissions } from "../../../../context/PermissionContext";
import { useAuth } from "../../../../context/AuthContext";
import {
  getWorkspaceConfiguration,
  listWorkspaces,
  saveWorkspaceAssignments,
  saveWorkspaceDashboard,
  searchWorkspacePreviewUsers,
  startLiveMode,
  syncWorkspaceRolePermissions,
  updateWorkspace,
  getRolePermissions,
  updateRolePermission,
  createRolePermission,
} from "../services/workspaceService";

const tabs = [
  "Settings",
  "Modules",
  "Navigation",
  "Buttons",
  "Widgets",
  "Dashboard",
  "Permissions",
  "Profiles",
  "Preview",
];

const tabDescriptions = {
  Settings: "Basic workspace information and status.",
  Modules: "Enable or disable entire modules for this workspace.",
  Navigation: "Choose which menus and pages appear in the sidebar.",
  Buttons: "Assign action buttons available in this workspace.",
  Widgets: "Control dashboard widgets shown for this workspace.",
  Dashboard: "Set the default dashboard and landing route.",
  Permissions: "Workspace membership controls visibility only.",
  Profiles: "Assign roles and assignment types to this workspace.",
  Preview: "Inspect the resolved configuration or test with Live Mode.",
};

export default function WorkspaceManagerPage() {
  usePageTitle("AUS | Workspace Manager");
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const canConfigure = hasPermission("workspace.configure");
  const isSuperAdmin = String(user?.roleKey || user?.role || "")
    .replace(/[\s_-]/g, "")
    .toLowerCase() === "superadmin";

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [config, setConfig] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [previewUserId, setPreviewUserId] = useState("");
  const [previewUsers, setPreviewUsers] = useState([]);
  const [previewSearch, setPreviewSearch] = useState("");
  const [liveReason, setLiveReason] = useState("");
  const [dashboardId, setDashboardId] = useState("");
  const [defaultRoute, setDefaultRoute] = useState("");
  const [settings, setSettings] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [inlineRolePermissions, setInlineRolePermissions] = useState([]);
  const [inlineRpLoading, setInlineRpLoading] = useState(false);

  const handleSyncPermissions = async () => {
    if (!workspaceId) return;
    try {
      setSyncing(true);
      setSyncMessage("");
      const result = await syncWorkspaceRolePermissions(workspaceId);
      setSyncMessage(result?.message || "Permissions synced successfully.");
      setConfig(await getWorkspaceConfiguration(workspaceId));
    } catch (e) {
      setSyncMessage(e.response?.data?.message || e.message || "Failed to sync permissions.");
    } finally {
      setSyncing(false);
    }
  };

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  useEffect(() => {
    setLoading(true);
    listWorkspaces({ status: statusFilter })
      .then((items) => {
        setWorkspaces(items);
        setWorkspaceId((current) =>
          items.some((x) => String(x.WorkspaceId) === String(current))
            ? current
            : items[0]?.WorkspaceId || ""
        );
      })
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    getWorkspaceConfiguration(workspaceId)
      .then((data) => {
        setConfig(data);
        setDashboardId(data.workspace?.DefaultDashboardId || "");
        setDefaultRoute(data.workspace?.DefaultRoute || "");
        const w = data.workspace || {};
        setSettings({
          workspaceKey: w.WorkspaceKey || "",
          workspaceName: w.WorkspaceName || "",
          workspaceCategory: w.WorkspaceCategory || "CORE",
          description: w.Description || "",
          icon: w.Icon || "",
          defaultRoute: w.DefaultRoute || "",
          visibilityStatusId: w.VisibilityStatusId,
          isDefault: Boolean(w.IsDefault),
          sortOrder: w.SortOrder || 0,
          isActive: Boolean(w.IsActive),
        });
      })
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    if (tab !== 8) return;
    const timer = setTimeout(() => {
      searchWorkspacePreviewUsers(previewSearch)
        .then(setPreviewUsers)
        .catch((e) => setError(e.response?.data?.message || e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [previewSearch, tab]);

  useEffect(() => {
    if (tab !== 2 || !workspaceId) return;
    setInlineRpLoading(true);
    Promise.all([
      getRolePermissions({ limit: 1000 }),
    ])
      .then(([perms]) => {
        setInlineRolePermissions(perms.data || perms || []);
      })
      .catch((e) => console.error("Failed to load inline role permissions:", e))
      .finally(() => setInlineRpLoading(false));
  }, [tab, workspaceId, config?.profiles]);

  const rows =
    tab === 1
      ? config?.modules
      : tab === 2
        ? config?.navigation
        : tab === 3
          ? config?.buttons
          : tab === 4
            ? config?.widgets
            : tab === 5
              ? config?.dashboards
              : tab === 7
                ? config?.profiles
                : null;

  const assignmentType =
    tab === 1
      ? "modules"
      : tab === 2
        ? "navigation"
        : tab === 3
          ? "buttons"
          : tab === 4
            ? "widgets"
            : tab === 7
              ? "profiles"
              : null;

  const assignmentField = {
    modules: "modules",
    navigation: "navigation",
    buttons: "buttons",
    widgets: "widgets",
    profiles: "profiles",
  }[assignmentType];

  const idField = {
    modules: "ModuleId",
    navigation: "MenuId",
    buttons: "ButtonId",
    widgets: "WidgetId",
    profiles: "RoleId",
  }[assignmentType];

  const toggleAssignment = (index) =>
    setConfig((previous) => ({
      ...previous,
      [assignmentField]: previous[assignmentField].map((item, i) =>
        i === index ? { ...item, IsAssigned: !item.IsAssigned } : item
      ),
    }));

  const updateAssignment = (index, field, value) =>
    setConfig((previous) => ({
      ...previous,
      [assignmentField]: previous[assignmentField].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

  const saveAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const items = config[assignmentField]
        .filter((x) => x.IsAssigned)
        .map((x) => ({
          id: x[idField],
          isVisible: true,
          isEnabled: x.IsEnabled !== false,
          isDefault: true,
          sortOrder: x.SortOrder,
          groupKey: x.GroupKey,
          groupName: x.GroupName,
          groupSortOrder: x.GroupSortOrder,
          parentMenuId: x.ParentMenuId,
        }));
      setConfig(await saveWorkspaceAssignments(workspaceId, assignmentType, items));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setError("");
    try {
      await updateWorkspace(workspaceId, settings);
      setConfig(await getWorkspaceConfiguration(workspaceId));
      const refreshed = await listWorkspaces({ status: statusFilter });
      setWorkspaces(refreshed);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedWorkspace = () =>
    workspaces.find((w) => String(w.WorkspaceId) === String(workspaceId));

  const renderSettingsTab = () => (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>
        Workspace Settings
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure the basic information and behavior of this workspace.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            disabled={!canConfigure}
            fullWidth
            label="Workspace name"
            value={settings.workspaceName || ""}
            onChange={(e) =>
              setSettings({ ...settings, workspaceName: e.target.value })
            }
            helperText="The display name shown in the sidebar and workspace picker."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            disabled
            fullWidth
            label="Workspace key"
            value={settings.workspaceKey || ""}
            helperText="System key used in code. Cannot be changed."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              disabled={!canConfigure}
              label="Category"
              value={settings.workspaceCategory || "CORE"}
              onChange={(e) =>
                setSettings({ ...settings, workspaceCategory: e.target.value })
              }
            >
              <MenuItem value="CORE">Core</MenuItem>
              <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
              <MenuItem value="LEGACY">Legacy</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            disabled={!canConfigure}
            fullWidth
            type="number"
            label="Sort order"
            value={settings.sortOrder ?? 0}
            onChange={(e) =>
              setSettings({ ...settings, sortOrder: Number(e.target.value) })
            }
            helperText="Lower numbers appear first in lists."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={!canConfigure}
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={settings.description || ""}
            onChange={(e) =>
              setSettings({ ...settings, description: e.target.value })
            }
            helperText="Optional description shown in workspace configuration."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              disabled={!canConfigure}
              label="Status"
              value={settings.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setSettings({ ...settings, isActive: e.target.value === "active" })
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Default landing route
            </Typography>
            <Chip
              label={settings.defaultRoute || "No landing route"}
              sx={{ width: "fit-content" }}
              color={settings.defaultRoute ? "primary" : "default"}
              variant={settings.defaultRoute ? "filled" : "outlined"}
            />
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              The route users land on when opening this workspace.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {canConfigure && (
        <Box>
          <Button variant="contained" onClick={saveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save workspace settings"}
          </Button>
        </Box>
      )}
    </Stack>
  );

  const renderAssignmentTab = (title, description, rowsData, type) => {
    if (!rowsData) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
          <Typography color="text.secondary">
            Select a workspace to view {title.toLowerCase()}.
          </Typography>
        </Stack>
      );
    }

    const buildNavigationTree = (items) => {
      const map = new Map();
      const roots = [];

      items.forEach((item) => {
        map.set(item.MenuId, { ...item, children: [] });
      });

      map.forEach((item) => {
        const parentId = item.ParentMenuId;
        if (parentId && map.has(parentId)) {
          map.get(parentId).children.push(item);
        } else {
          roots.push(item);
        }
      });

      return roots;
    };

    const renderNavigationItem = (item) => {
      const hasParent = Boolean(item.ParentMenuId);
      const inheritedGroup = hasParent ? item.GroupName || "Main" : null;
      const displayGroup = item.GroupName || inheritedGroup || "Main";

      return (
        <Card
          key={item.MenuId}
          variant="outlined"
          sx={{
            borderLeft: (theme) =>
              item.IsAssigned
                ? `4px solid ${theme.palette.primary.main}`
                : `4px solid transparent`,
            bgcolor: item.IsAssigned ? "action.hover" : "background.paper",
            transition: "all 0.2s",
            ml: hasParent ? 4 : 0,
            "&:hover": {
              boxShadow: 1,
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Checkbox
                checked={Boolean(item.IsAssigned)}
                onChange={() =>
                  toggleAssignment(
                    rowsData.findIndex((r) => r.MenuId === item.MenuId)
                  )
                }
                disabled={!canConfigure}
                sx={{ padding: 0.5 }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography fontWeight={600} noWrap>
                    {item.MenuName}
                  </Typography>
                  {hasParent && (
                    <Chip label="Child menu" size="small" variant="outlined" sx={{ height: 20 }} />
                  )}
                  {!item.IsActive && (
                    <Chip label="Inactive" size="small" color="warning" sx={{ height: 20 }} />
                  )}
                  {item.IsAssigned && (
                    <Chip label="Assigned" size="small" color="success" sx={{ height: 20 }} />
                  )}
                </Stack>
                <Typography variant="caption" display="block" color="text.secondary">
                  {item.Route || item.ModuleKey || "Menu item"}
                </Typography>
                {hasParent && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Group inherited from parent: <strong>{displayGroup}</strong>
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                <TextField
                  size="small"
                  type="number"
                  label="Sort"
                  value={item.SortOrder ?? 0}
                  onChange={(e) =>
                    updateAssignment(
                      rowsData.findIndex((r) => r.MenuId === item.MenuId),
                      "SortOrder",
                      Number(e.target.value)
                    )
                  }
                  disabled={!canConfigure}
                  sx={{ width: 80 }}
                  inputProps={{ sx: { px: 1, py: 0.5 } }}
                />
                <TextField
                  size="small"
                  label="Group"
                  value={displayGroup}
                  onChange={(e) =>
                    updateAssignment(
                      rowsData.findIndex((r) => r.MenuId === item.MenuId),
                      "GroupName",
                      e.target.value
                    )
                  }
                  disabled={!canConfigure || hasParent}
                  sx={{ width: 150 }}
                  helperText={hasParent ? "Inherited from parent" : ""}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Group sort"
                  value={item.GroupSortOrder ?? 0}
                  onChange={(e) =>
                    updateAssignment(
                      rowsData.findIndex((r) => r.MenuId === item.MenuId),
                      "GroupSortOrder",
                      Number(e.target.value)
                    )
                  }
                  disabled={!canConfigure || hasParent}
                  sx={{ width: 100 }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      );
    };

    const renderStandardItem = (row, index) => {
      const name =
        row.ModuleName ||
        row.ButtonName ||
        row.WidgetName ||
        row.DashboardName ||
        row.RoleName;

      return (
        <Card
          key={row.ModuleId || row.ButtonId || row.WidgetId || row.DashboardId || row.RoleId || index}
          variant="outlined"
          sx={{
            borderLeft: (theme) =>
              row.IsAssigned
                ? `4px solid ${theme.palette.primary.main}`
                : `4px solid transparent`,
            bgcolor: row.IsAssigned ? "action.hover" : "background.paper",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: 1,
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Checkbox
                checked={Boolean(row.IsAssigned)}
                onChange={() => toggleAssignment(index)}
                disabled={!canConfigure}
                sx={{ padding: 0.5 }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography fontWeight={600} noWrap>
                    {name}
                  </Typography>
                  {!row.IsActive && (
                    <Chip label="Inactive" size="small" color="warning" sx={{ height: 20 }} />
                  )}
                  {row.IsAssigned && (
                    <Chip label="Assigned" size="small" color="success" sx={{ height: 20 }} />
                  )}
                </Stack>
                <Typography variant="caption" display="block" color="text.secondary">
                  {row.BaseRoute || row.ModuleKey || row.RoleKey || "Configured record"}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                {type !== "profiles" && (
                  <TextField
                    size="small"
                    type="number"
                    label="Sort"
                    value={row.SortOrder ?? 0}
                    onChange={(e) =>
                      updateAssignment(index, "SortOrder", Number(e.target.value))
                    }
                    disabled={!canConfigure}
                    sx={{ width: 80 }}
                    inputProps={{ sx: { px: 1, py: 0.5 } }}
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      );
    };

    return (
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        {canConfigure && (
          <Button
            variant="contained"
            onClick={saveAssignments}
            disabled={loading}
            sx={{ alignSelf: "flex-start" }}
          >
            {loading ? "Saving..." : `Save ${type} assignments`}
          </Button>
        )}

        <Stack spacing={1}>
          {rowsData.length === 0 ? (
            <Alert severity="info">
              No {type} available. They may need to be created in the platform first.
            </Alert>
          ) : type === "navigation" ? (
            buildNavigationTree(rowsData)
              .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0))
              .flatMap((root) => [
                ...(root.children || [])
                  .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0))
                  .map((child) => renderNavigationItem(child, 1)),
                renderNavigationItem(root, 0),
              ])
          ) : (
            rowsData.map((row, index) => renderStandardItem(row, index))
          )}
        </Stack>
      </Stack>
    );
  };

  const renderCombinedModuleNavigationTab = () => {
    const modules = (config?.modules || [])
      .slice()
      .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0));

    const navigationByModule = (config?.navigation || []).reduce((acc, menu) => {
      const moduleId = menu.ModuleId ?? "ungrouped";
      if (!acc[moduleId]) acc[moduleId] = [];
      acc[moduleId].push(menu);
      return acc;
    }, {});

    const toggleModuleAssignment = (moduleId) => {
      setConfig((previous) => ({
        ...previous,
        modules: previous.modules.map((m) =>
          m.ModuleId === moduleId ? { ...m, IsAssigned: !m.IsAssigned } : m
        ),
      }));
    };

    const toggleMenuAssignment = (menuId) => {
      setConfig((previous) => ({
        ...previous,
        navigation: previous.navigation.map((m) =>
          m.MenuId === menuId ? { ...m, IsAssigned: !m.IsAssigned } : m
        ),
      }));
    };

    const updateModuleField = (moduleId, field, value) => {
      setConfig((previous) => ({
        ...previous,
        modules: previous.modules.map((m) =>
          m.ModuleId === moduleId ? { ...m, [field]: value } : m
        ),
      }));
    };

    const updateMenuField = (menuId, field, value) => {
      setConfig((previous) => ({
        ...previous,
        navigation: previous.navigation.map((m) =>
          m.MenuId === menuId ? { ...m, [field]: value } : m
        ),
      }));
    };

    const syncModuleToChildren = (moduleId) => {
      setConfig((previous) => ({
        ...previous,
        navigation: previous.navigation.map((m) =>
          m.ModuleId === moduleId
            ? { ...m, IsEnabled: previous.modules.find((mod) => mod.ModuleId === moduleId)?.IsEnabled ?? m.IsEnabled, SortOrder: previous.modules.find((mod) => mod.ModuleId === moduleId)?.SortOrder ?? m.SortOrder }
            : m
        ),
      }));
    };

    const rolePermissionMap = new Map();
    inlineRolePermissions.forEach((rp) => {
      const key = `${rp.RoleId}-${rp.PermissionId}`;
      rolePermissionMap.set(key, rp);
    });

    const getMenuAccessMode = (menu) => {
      if (!menu.IsAssigned) return "disabled";
      if (!menu.IsEnabled) return "view";
      return "active";
    };

    const setMenuAccessMode = async (menu, mode) => {
      if (!canConfigure) return;
      setInlineRpLoading(true);
      try {
        const assignedRoleIds = (config?.profiles || [])
          .filter((p) => p.IsAssigned)
          .map((p) => p.RoleId);

        const isAssigned = mode !== "disabled";
        const isEnabled = mode === "active" || mode === "view";
        const isAllowed = mode === "active";

        updateMenuField(menu.MenuId, "IsAssigned", isAssigned);
        updateMenuField(menu.MenuId, "IsEnabled", isEnabled);

        if (assignedRoleIds.length === 0 || !menu.PermissionId) {
          setSyncMessage(`Access mode updated to "${mode}" for "${menu.MenuName}".`);
          return;
        }

        const promises = assignedRoleIds.map((roleId) => {
          const key = `${roleId}-${menu.PermissionId}`;
          const existing = rolePermissionMap.get(key);
          if (existing) {
            if (existing.IsAllowed === isAllowed) return Promise.resolve();
            return updateRolePermission(existing.RolePermissionId, { isAllowed });
          }
          if (!isAllowed) return Promise.resolve();
          return createRolePermission({ roleId, permissionId: menu.PermissionId, isAllowed });
        });

        await Promise.all(promises);

        const [perms] = await Promise.all([
          getRolePermissions({ limit: 1000 }),
        ]);
        setInlineRolePermissions(perms.data || perms || []);

        perms.data.forEach((rp) => {
          const key = `${rp.RoleId}-${rp.PermissionId}`;
          rolePermissionMap.set(key, rp);
        });

        await saveCombinedSilent();
        setSyncMessage(`Access mode updated to "${mode}" for "${menu.MenuName}".`);
      } catch (e) {
        setSyncMessage(e.response?.data?.message || e.message || "Failed to update access mode.");
      } finally {
        setInlineRpLoading(false);
      }
    };

    const saveCombinedSilent = async () => {
      const assignedModuleIds = new Set(
        config.modules.filter((m) => m.IsAssigned).map((m) => m.ModuleId)
      );

      const moduleItems = config.modules
        .filter((m) => m.IsAssigned)
        .map((m) => ({
          id: m.ModuleId,
          isVisible: true,
          isEnabled: m.IsEnabled !== false,
          sortOrder: m.SortOrder,
        }));

      const navItems = config.navigation
        .filter((m) => m.IsAssigned && assignedModuleIds.has(m.ModuleId))
        .map((m) => ({
          id: m.MenuId,
          isVisible: true,
          isEnabled: m.IsEnabled !== false,
          sortOrder: m.SortOrder,
          groupKey: m.GroupKey,
          groupName: m.GroupName,
          groupSortOrder: m.GroupSortOrder,
          parentMenuId: m.ParentMenuId,
        }));

      await withTimeout(saveWorkspaceAssignments(workspaceId, "modules", moduleItems));
      await withTimeout(saveWorkspaceAssignments(workspaceId, "navigation", navItems));

      const refreshed = await getWorkspaceConfiguration(workspaceId);
      setConfig(refreshed);
    };

    const withTimeout = (promise, ms = 30000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms)
        ),
      ]);
    };

    const saveCombined = async () => {
      setLoading(true);
      setError("");
      setSyncMessage("");
      try {
        const assignedModuleIds = new Set(
          config.modules.filter((m) => m.IsAssigned).map((m) => m.ModuleId)
        );

        const moduleItems = config.modules
          .filter((m) => m.IsAssigned)
          .map((m) => ({
            id: m.ModuleId,
            isVisible: true,
            isEnabled: m.IsEnabled !== false,
            sortOrder: m.SortOrder,
          }));

        const navItems = config.navigation
          .filter((m) => m.IsAssigned && assignedModuleIds.has(m.ModuleId))
          .map((m) => ({
            id: m.MenuId,
            isVisible: true,
            isEnabled: m.IsEnabled !== false,
            sortOrder: m.SortOrder,
            groupKey: m.GroupKey,
            groupName: m.GroupName,
            groupSortOrder: m.GroupSortOrder,
            parentMenuId: m.ParentMenuId,
          }));

        await withTimeout(saveWorkspaceAssignments(workspaceId, "modules", moduleItems));
        await withTimeout(saveWorkspaceAssignments(workspaceId, "navigation", navItems));
        
        const refreshed = await getWorkspaceConfiguration(workspaceId);
        setConfig(refreshed);
        setSyncMessage("Modules and navigation saved successfully.");
      } catch (e) {
        console.error("Save combined error:", e);
        setError(e?.response?.data?.message || e?.message || "Failed to save modules and navigation.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Modules & Navigation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enable or disable entire modules and their child navigation menus together.
          </Typography>
        </Box>

        {canConfigure && (
          <Button
            variant="contained"
            onClick={saveCombined}
            disabled={loading}
            sx={{ alignSelf: "flex-start" }}
          >
            {loading ? "Saving..." : "Save modules & navigation"}
          </Button>
        )}

        <Stack spacing={2}>
          {modules.length === 0 ? (
            <Alert severity="info">No modules available.</Alert>
          ) : (
            modules.map((module) => {
              const menus = (navigationByModule[module.ModuleId] || [])
                .slice()
                .sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0));
              const isExpanded = expandedModules[module.ModuleId] !== false;

              return (
                <Card key={module.ModuleId} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => toggleModuleExpand(module.ModuleId)}
                          sx={{ minWidth: 32, padding: 0 }}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </Button>
                        <Checkbox
                          checked={Boolean(module.IsAssigned)}
                          onChange={() => toggleModuleAssignment(module.ModuleId)}
                          disabled={!canConfigure}
                          sx={{ padding: 0.5 }}
                        />
                        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                          {module.ModuleName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {module.ModuleKey}
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          label="Sort"
                          value={module.SortOrder ?? 0}
                          onChange={(e) =>
                            updateModuleField(module.ModuleId, "SortOrder", Number(e.target.value))
                          }
                          disabled={!canConfigure}
                          sx={{ width: 80 }}
                          inputProps={{ sx: { px: 1, py: 0.5 } }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(module.IsEnabled)}
                              onChange={(e) =>
                                updateModuleField(module.ModuleId, "IsEnabled", e.target.checked)
                              }
                              disabled={!canConfigure}
                            />
                          }
                          label="Enabled"
                        />
                        {canConfigure && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => syncModuleToChildren(module.ModuleId)}
                          >
                            Sync to menus
                          </Button>
                        )}
                      </Stack>

                      {isExpanded && menus.length > 0 && (
                        <Stack spacing={1} sx={{ ml: 6, mt: 1, borderLeft: (theme) => `1px solid ${theme.palette.divider}`, pl: 2 }}>
                          {menus.map((menu) => (
                            <Card
                              key={menu.MenuId}
                              variant="outlined"
                              sx={{
                                borderLeft: (theme) =>
                                  menu.IsAssigned
                                    ? `4px solid ${theme.palette.primary.main}`
                                    : `4px solid transparent`,
                                bgcolor: menu.IsAssigned ? "action.hover" : "background.paper",
                              }}
                            >
                              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                  <Checkbox
                                    checked={Boolean(menu.IsAssigned)}
                                    onChange={() => toggleMenuAssignment(menu.MenuId)}
                                    disabled={!canConfigure || !module.IsAssigned}
                                    sx={{ padding: 0.5 }}
                                  />
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {menu.MenuName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {menu.MenuKey}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {menu.Route || "No route"}
                                  </Typography>
                                  <TextField
                                    size="small"
                                    type="number"
                                    label="Sort"
                                    value={menu.SortOrder ?? 0}
                                    onChange={(e) =>
                                      updateMenuField(menu.MenuId, "SortOrder", Number(e.target.value))
                                    }
                                    disabled={!canConfigure || !module.IsAssigned}
                                    sx={{ width: 80 }}
                                    inputProps={{ sx: { px: 1, py: 0.5 } }}
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={Boolean(menu.IsEnabled)}
                                        onChange={(e) =>
                                          updateMenuField(menu.MenuId, "IsEnabled", e.target.checked)
                                        }
                                        disabled={!canConfigure || !module.IsAssigned}
                                      />
                                    }
                                    label="Enabled"
                                  />
                                 </Stack>
                               </CardContent>
                               <CardContent sx={{ pt: 0, "&:last-child": { pb: 2 } }}>
                                 <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                   <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                     Access:
                                   </Typography>
                                   <ToggleButtonGroup
                                     size="small"
                                     value={getMenuAccessMode(menu)}
                                     exclusive
                                     onChange={(_, value) => {
                                       if (value) setMenuAccessMode(menu, value);
                                     }}
                                     disabled={!canConfigure || !module.IsAssigned || inlineRpLoading}
                                   >
                                     <ToggleButton value="active" color="success">
                                       <Typography variant="caption">Active</Typography>
                                     </ToggleButton>
                                     <ToggleButton value="view" color="warning">
                                       <Typography variant="caption">View</Typography>
                                     </ToggleButton>
                                     <ToggleButton value="disabled" color="error">
                                       <Typography variant="caption">Disabled</Typography>
                                     </ToggleButton>
                                   </ToggleButtonGroup>
                                 </Stack>
                               </CardContent>
                             </Card>
                          ))}
                        </Stack>
                      )}

                      {isExpanded && menus.length === 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: 1 }}>
                          No navigation menus for this module.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Stack>
    );
  };

  const renderDashboardTab = () => (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>
        Dashboard Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Set the default dashboard and landing route for this workspace.
      </Typography>

      <Grid container spacing={2} maxWidth={600}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Default dashboard</InputLabel>
            <Select
              disabled={!canConfigure}
              label="Default dashboard"
              value={dashboardId}
              onChange={(e) => setDashboardId(e.target.value)}
            >
              <MenuItem value="">No dashboard</MenuItem>
              {(config?.dashboards || []).map((item) => (
                <MenuItem key={item.DashboardId} value={item.DashboardId}>
                  {item.DashboardName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Default landing route</InputLabel>
            <Select
              disabled={!canConfigure}
              label="Default landing route"
              value={defaultRoute}
              onChange={(e) => setDefaultRoute(e.target.value)}
            >
              {(config?.navigation || [])
                .filter((item) => item.IsAssigned && item.Route)
                .map((item) => (
                  <MenuItem key={item.MenuId} value={item.Route}>
                    {item.MenuName} — {item.Route}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {canConfigure && (
        <Button
          variant="contained"
          onClick={async () => {
            setLoading(true);
            try {
              const data = await saveWorkspaceDashboard(workspaceId, dashboardId, defaultRoute);
              setConfig(data);
            } catch (e) {
              setError(e.response?.data?.message || e.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save dashboard and landing route"}
        </Button>
      )}
    </Stack>
  );

  const renderPreviewTab = () => (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>
        Configuration Preview
      </Typography>
      <Alert severity="info">
        Configuration Preview is read-only and does not impersonate a user. Use this to inspect
        what is enabled for the selected workspace.
      </Alert>

      <Button
        variant="contained"
        disabled={!workspaceId}
        onClick={() =>
          window.open(
            `/super-admin/workspace-preview?workspaceId=${encodeURIComponent(workspaceId)}`,
            "_blank",
            "noopener,noreferrer"
          )
        }
      >
        Open workspace configuration preview
      </Button>

      {isSuperAdmin && (
        <Card variant="outlined" sx={{ borderColor: "error.main", bgcolor: "error.lighter" }}>
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="error">
                Live Mode is separate from Preview and performs real actions with a target
                user&apos;s actual permissions. All activity is audited.
              </Alert>

              <Autocomplete
                options={previewUsers}
                value={previewUsers.find((item) => String(item.UserId) === String(previewUserId)) || null}
                onInputChange={(_, value, reason) => {
                  if (reason === "input") setPreviewSearch(value);
                }}
                onChange={(_, value) => setPreviewUserId(value?.UserId || "")}
                getOptionLabel={(item) =>
                  `${item.FullName} (${item.EmployeeId}) — ${item.RoleName}`
                }
                renderInput={(params) => <TextField {...params} label="Live Mode target user" />}
                disabled={!canConfigure}
              />

              <TextField
                label="Required troubleshooting reason"
                value={liveReason}
                onChange={(e) => setLiveReason(e.target.value)}
                disabled={!canConfigure}
                helperText="Please provide at least 10 characters explaining why Live Mode is needed."
              />

              <Button
                color="error"
                variant="contained"
                disabled={!previewUserId || liveReason.trim().length < 10 || !canConfigure}
                onClick={async () => {
                  if (!window.confirm("Enter Live Mode as this user? Real permitted actions will be possible."))
                    return;
                  try {
                    const result = await startLiveMode(previewUserId, liveReason);
                    window.open(
                      `/live-workspace#liveToken=${encodeURIComponent(result.token)}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  } catch (e) {
                    setError(e.response?.data?.message || e.message);
                  }
                }}
              >
                Enter Live Mode
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );

  const selectedWorkspace = getSelectedWorkspace();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Workspace Manager
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Configure workspaces, assign modules, navigation, and preview user access.
          <br />
          <strong>Note:</strong> Presentation assignments never grant permissions.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth size="small">
              <InputLabel>Workspace</InputLabel>
              <Select
                label="Workspace"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
              >
                {["CORE", "ASSIGNMENT", "LEGACY"].flatMap((category) => {
                  const items = workspaces.filter((w) => w.WorkspaceCategory === category);
                  if (items.length === 0) return [];
                  const label =
                    category === "CORE"
                      ? "CORE WORKSPACES"
                      : category === "ASSIGNMENT"
                        ? "ASSIGNMENT WORKSPACES"
                        : "LEGACY WORKSPACES";
                  return [
                    <ListSubheader key={`${category}-header`}>{label}</ListSubheader>,
                    ...items.map((w) => (
                      <MenuItem key={w.WorkspaceId} value={w.WorkspaceId}>
                        {w.WorkspaceName}
                        {!w.IsActive && " · Inactive"}
                      </MenuItem>
                    )),
                  ];
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {selectedWorkspace && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedWorkspace.WorkspaceName}
              </Typography>
              <Chip
                label={selectedWorkspace.WorkspaceCategory}
                size="small"
                color={selectedWorkspace.WorkspaceCategory === "CORE" ? "primary" : "default"}
              />
              <Chip
                label={selectedWorkspace.IsActive ? "Active" : "Inactive"}
                size="small"
                color={selectedWorkspace.IsActive ? "success" : "error"}
              />
              {selectedWorkspace.IsDefault && (
                <Chip label="Default" size="small" color="info" />
              )}
              <Typography variant="caption" color="text.secondary">
                {selectedWorkspace.Description || "No description"}
              </Typography>
              {canConfigure && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSyncPermissions}
                  disabled={syncing}
                  sx={{ ml: "auto" }}
                >
                  {syncing ? "Syncing..." : "Sync Permissions"}
                </Button>
              )}
            </Stack>
            {syncMessage && (
              <Typography variant="caption" color={syncMessage.includes("Failed") ? "error" : "success.main"} sx={{ mt: 1, display: "block" }}>
                {syncMessage}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((t) => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {!canConfigure && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Read-only inspection mode. Configuration controls are disabled at the API layer.
            </Alert>
          )}

          {tab === 0 && renderSettingsTab()}
          {tab === 5 && renderDashboardTab()}
          {tab === 6 && (
            <Alert severity="info">
              Workspace membership controls visibility only. Role permissions and user overrides
              are resolved by Permission Resolver.
            </Alert>
          )}
          {tab === 8 && renderPreviewTab()}
          {tab === 2 && renderCombinedModuleNavigationTab()}
          {[1, 3, 4, 7].includes(tab) &&
            renderAssignmentTab(
              tabs[tab],
              tabDescriptions[tabs[tab]],
              rows,
              assignmentType
            )}
        </Paper>
      )}
    </Stack>
  );
}
