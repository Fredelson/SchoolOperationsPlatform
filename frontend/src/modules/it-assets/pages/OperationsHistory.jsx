import { useCallback, useEffect, useState } from "react";
import { Box, Stack, TextField, MenuItem, Typography } from "@mui/material";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppCard,
  AppDataTable,
  AppEmptyState,
  AppPageHeader,
} from "../../../platform/ui";

import {
  getItAssetOperationsHistoryService,
} from "../services/itAssetService";

const ACTIVITY_TYPES = [
  { value: "", label: "All Activities" },
  { value: "ASSET_ASSIGNED", label: "Assigned" },
  { value: "ASSET_RETURNED", label: "Returned" },
  { value: "ASSET_TRANSFER_COMPLETED", label: "Transferred" },
  { value: "ASSET_DISPOSED", label: "Disposed" },
  { value: "ASSET_MAINTENANCE_RECORDED", label: "Maintenance" },
  { value: "ASSET_IMPORTED", label: "Imported" },
  { value: "ASSET_IMPORT_UPDATED", label: "Import Updated" },
  { value: "ASSET_BORROWED", label: "Borrowed" },
  { value: "ASSET_BORROW_RETURNED", label: "Borrow Returned" },
  { value: "ISSUE_REPORTED", label: "Issue Reported" },
  { value: "ISSUE_RESOLVED", label: "Issue Resolved" },
];

const ENTITY_TYPES = [
  { value: "", label: "All Entities" },
  { value: "ITAsset", label: "Assets" },
  { value: "ITAssetIssue", label: "Issues" },
];

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-AE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const OperationsHistory = () => {
  usePageTitle("IT Operations History");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(50);

  const [filters, setFilters] = useState({
    activityType: "",
    entityType: "",
    search: "",
  });

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        ...filters,
        page,
        limit,
      };

      const result = await getItAssetOperationsHistoryService(params);
      setHistory(result.rows || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load operations history.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    setPage(1);
  };

  const columns = [
    {
      field: "ActivityTitle",
      headerName: "Activity",
      width: 260,
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {row.ActivityTitle || row.activityType}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.ActivityDescription || row.description || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "AssetTag",
      headerName: "Asset",
      width: 140,
      render: (row) => row.AssetTag || row.assetTag || "—",
    },
    {
      field: "PerformedByName",
      headerName: "Performed By",
      width: 180,
      render: (row) => row.PerformedByName || "—",
    },
    {
      field: "EntityType",
      headerName: "Type",
      width: 120,
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.EntityType || "—"}
        </Typography>
      ),
    },
    {
      field: "CreatedAt",
      headerName: "Date",
      width: 160,
      render: (row) => formatDate(row.CreatedAt || row.createdAt),
    },
  ];

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Assets", to: "/it-assets/dashboard" },
          { label: "Operations History" },
        ]}
      />

      <AppPageHeader
        title="IT Operations History"
        subtitle="Complete log of all asset movements, assignments, disposals, maintenance, imports, and more."
        actions={<AppButton onClick={loadHistory}>Refresh</AppButton>}
      />

      <Stack spacing={2.5}>
        <AppCard>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              select
              label="Activity Type"
              value={filters.activityType}
              onChange={handleFilterChange("activityType")}
              sx={{ minWidth: 180 }}
              size="small"
            >
              {ACTIVITY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Entity Type"
              value={filters.entityType}
              onChange={handleFilterChange("entityType")}
              sx={{ minWidth: 160 }}
              size="small"
            >
              {ENTITY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Search"
              placeholder="Asset tag, activity, user..."
              value={filters.search}
              onChange={handleFilterChange("search")}
              sx={{ minWidth: 240 }}
              size="small"
            />
          </Stack>
        </AppCard>

        {error && (
          <Box>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && history.length === 0 ? (
          <AppEmptyState
            title="No operations history"
            message="There are no recorded activities matching your filters."
          />
        ) : (
          <AppDataTable
            rows={history}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.ActivityTimelineId || row.id}
            pagination={{
              page,
              limit,
              total,
              totalPages,
              onPageChange: setPage,
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default OperationsHistory;
