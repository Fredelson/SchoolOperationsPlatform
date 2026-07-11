import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Collapse, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import { useAuth } from "../../../context/AuthContext";
import {
  AppBreadcrumbs, AppButton, AppCard, AppChip, AppEmptyState, AppFormField,
  AppDataTable, AppFormGrid, AppLoadingState, AppPageHeader, AppStatCards, AppToolbar,
} from "../../../platform/ui";
import { getItAssetLookupsService } from "../services/itAssetService";
import { useItAssetDashboard } from "../hooks/useItAssetDashboard";
import { buildItAssetDashboardCards } from "../cards/dashboardCards";
import DashboardCharts from "../components/DashboardCharts";
import DashboardTables from "../components/DashboardTables";

const EMPTY_FILTERS = {
  categoryId: "", brandId: "", modelId: "", statusId: "", conditionId: "",
  departmentId: "", locationId: "", roomId: "", assignedUserId: "",
  dateFrom: "", dateTo: "",
};

const FILTER_CONFIG = [
  ["categoryId", "Category", "categories", "ITAssetCategoryId", "CategoryName"],
  ["brandId", "Brand", "brands", "ITAssetBrandId", "BrandName"],
  ["modelId", "Model", "models", "ITAssetModelId", "ModelName"],
  ["statusId", "Status", "statuses", "ITAssetStatusId", "StatusName"],
  ["conditionId", "Condition", "conditions", "ITAssetConditionId", "ConditionName"],
  ["departmentId", "Department", "departments", "DepartmentId", "DepartmentName"],
  ["locationId", "Location", "locations", "LocationId", "LocationName"],
  ["roomId", "Room", "rooms", "RoomId", "RoomName"],
  ["assignedUserId", "Assigned User", "users", "UserId", "FullName"],
];

const filteredAssetColumns = [
  { field: "AssetTag", headerName: "Asset Tag" },
  { field: "CategoryName", headerName: "Category" },
  { field: "BrandName", headerName: "Brand" },
  { field: "ModelName", headerName: "Model" },
  { field: "StatusName", headerName: "Status" },
  { field: "ConditionName", headerName: "Condition" },
  { field: "DepartmentName", headerName: "Department" },
  { field: "LocationName", headerName: "Location" },
  { field: "RoomName", headerName: "Room" },
  { field: "CurrentAssignedName", headerName: "Assigned User" },
];

const ItAssetDashboard = ({ reportMode = false }) => {
  usePageTitle(reportMode ? "IT Asset Reports" : "IT Asset Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const { dashboard, loading, error, refetch } = useItAssetDashboard();
  const [lookups, setLookups] = useState({});
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [exporting, setExporting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!reportMode) return undefined;
    let mounted = true;
    getItAssetLookupsService().then((data) => mounted && setLookups(data || {}));
    return () => { mounted = false; };
  }, [reportMode]);

  const models = useMemo(() => (lookups.models || []).filter((item) =>
    !draftFilters.brandId || String(item.ITAssetBrandId) === String(draftFilters.brandId)
  ), [lookups.models, draftFilters.brandId]);
  const rooms = useMemo(() => (lookups.rooms || []).filter((item) =>
    !draftFilters.locationId || String(item.LocationId) === String(draftFilters.locationId)
  ), [lookups.rooms, draftFilters.locationId]);

  const filterLabels = useMemo(() => FILTER_CONFIG.flatMap(
    ([key, label, source, valueKey, labelKey]) => {
      if (!activeFilters[key]) return [];
      const option = (lookups[source] || []).find(
        (item) => String(item[valueKey]) === String(activeFilters[key])
      );
      return [`${label}: ${option?.[labelKey] || activeFilters[key]}`];
    }
  ).concat(activeFilters.dateFrom ? [`From: ${activeFilters.dateFrom}`] : [])
    .concat(activeFilters.dateTo ? [`To: ${activeFilters.dateTo}`] : []),
  [activeFilters, lookups]);

  const applyFilters = async () => {
    setActiveFilters(draftFilters);
    await refetch(draftFilters);
  };
  const resetFilters = async () => {
    setDraftFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    await refetch({});
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
      { generatedAt: new Date().toISOString(), generatedBy: user?.fullName || "User",
        filters: filterLabels.join("; ") || "None", ...dashboard.kpis },
    ]), "Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.filteredAssets || []), "Assets");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.requiredActions || []), "Required Actions");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.charts?.assetsByCategory || []), "Assets by Category");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.charts?.assetsByStatus || []), "Assets by Status");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.charts?.assetsByCondition || []), "Assets by Condition");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.charts?.assetsByLocation || []), "Assets by Location");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.charts?.assignmentOverview || []), "Assignments");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.operations?.transfers || []), "Transfers");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.operations?.maintenance || []), "Maintenance");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dashboard.operations?.disposals || []), "Disposals");
    XLSX.writeFile(workbook, "IT_Operations_Dashboard.xlsx");
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    try {
      setExporting(true);
      const canvas = await html2canvas(reportRef.current, { scale: 1, useCORS: true });
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      const image = canvas.toDataURL("image/png");
      let offset = 0;
      while (offset < height) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(image, "PNG", 10, 10 - offset, width, height);
        offset += 277;
      }
      pdf.save("IT_Operations_Dashboard.pdf");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !dashboard) return <AppLoadingState title="Loading IT Asset Dashboard..." />;
  if (error && !dashboard) return <AppEmptyState title="Unable to load dashboard" message={error} actionLabel="Retry" onAction={() => refetch(activeFilters)} />;

  const cards = buildItAssetDashboardCards(dashboard?.kpis).map((card) => ({
    ...card,
    onClick: card.path ? () => navigate(card.path) : undefined,
  }));
  const generatedAt = new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  return (
    <Box>
      <AppBreadcrumbs items={reportMode
        ? [{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Reports" }]
        : [{ label: "Dashboard", to: "/dashboard" }, { label: "IT Assets" }]} />
      <AppPageHeader
        title={reportMode ? "IT Asset Reports" : "IT Asset Dashboard"}
        subtitle={reportMode
          ? "Filter live operational data and export the resulting report."
          : "Live overview of assets, assignments, returns, maintenance, transfers, and disposals."} />

      <Stack spacing={2.5}>
        {reportMode && <AppCard>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }}
              justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={900}>Report Filters</Typography>
                <Typography variant="caption" color="text.secondary">
                  {filterLabels.length ? `${filterLabels.length} active filters` : "All IT assets"}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                <AppButton variant="outlined" onClick={exportPdf} disabled={exporting}>
                  {exporting ? "Exporting PDF..." : "Export PDF"}
                </AppButton>
                <AppButton variant="outlined" onClick={exportExcel}>Export Excel</AppButton>
                <AppButton variant="outlined" onClick={() => window.print()}>Print</AppButton>
                <AppButton variant="outlined" startIcon={<FilterAltOutlinedIcon />}
                  onClick={() => setFiltersOpen((open) => !open)}>
                  {filtersOpen ? "Hide Filters" : "Show Filters"}
                </AppButton>
              </Stack>
            </Stack>
            <Collapse in={filtersOpen}>
              <Stack spacing={1.5} sx={{ pt: 1 }}>
            <AppFormGrid columns={4} gap={1.5}>
              {FILTER_CONFIG.map(([key, label, source, valueKey, labelKey]) => (
                <AppFormField key={key} type="autocomplete" label={label}
                  value={draftFilters[key]}
                  options={key === "modelId" ? models : key === "roomId" ? rooms : lookups[source] || []}
                  valueKey={valueKey} labelKey={labelKey}
                  onChange={(value) => setDraftFilters((current) => ({ ...current, [key]: value,
                    ...(key === "brandId" ? { modelId: "" } : {}),
                    ...(key === "locationId" ? { roomId: "" } : {}) }))} />
              ))}
              <AppFormField label="Date From (YYYY-MM-DD)" value={draftFilters.dateFrom}
                onChange={(value) => setDraftFilters((current) => ({ ...current, dateFrom: value }))} />
              <AppFormField label="Date To (YYYY-MM-DD)" value={draftFilters.dateTo}
                onChange={(value) => setDraftFilters((current) => ({ ...current, dateTo: value }))} />
            </AppFormGrid>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
              <AppButton onClick={applyFilters}>Apply Filters</AppButton>
              <AppButton variant="outlined" onClick={resetFilters}>Reset Filters</AppButton>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {filterLabels.length ? filterLabels.map((label) => <AppChip key={label} label={label} />)
                : <Typography variant="caption" color="text.secondary">No active filters</Typography>}
            </Stack>
              </Stack>
            </Collapse>
          </Stack>
        </AppCard>}

        <Box ref={reportRef} className="it-dashboard-report">
          <Stack spacing={3}>
            {reportMode && <AppCard>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={900}>IT Operations Dashboard Snapshot</Typography>
                <Typography variant="body2" color="text.secondary">
                  Generated {generatedAt} by {user?.fullName || user?.FullName || "Authenticated user"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active filters: {filterLabels.join("; ") || "None"}
                </Typography>
              </Stack>
            </AppCard>}
            <AppToolbar title="Asset Overview"
              actions={<AppButton onClick={() => refetch(activeFilters)}>Refresh</AppButton>} />
            <AppStatCards items={cards} spacing={1.5} />
            <DashboardCharts charts={dashboard?.charts} />
            <DashboardTables dashboard={dashboard} />
            {reportMode && <AppCard>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={900}>Filtered Asset Listing</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Up to {dashboard?.filteredAssets?.length || 0} matching assets included in this snapshot
                  </Typography>
                </Box>
                <AppDataTable
                  rows={dashboard?.filteredAssets || []}
                  columns={filteredAssetColumns}
                  getRowId={(row) => row.AssetId}
                  emptyTitle="No assets match the active filters"
                />
              </Stack>
            </AppCard>}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default ItAssetDashboard;
