import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import PageHeader from "../../../components/common/PageHeader";
import KpiGrid from "../../../components/common/KpiGrid";
import DashboardCard from "../../../components/dashboard/DashboardCard";
import { useAuth } from "../../../context/AuthContext";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppChip,
  AppFormField,
  AppLoadingState,
} from "../../../platform/ui";
import { dashboardColors } from "../../../theme/dashboardColors";
import { buildItAssetDashboardStats } from "../cards/dashboardCards";
import AssetDashboardOperationsRow from "../components/AssetDashboardOperationsRow";
import { DashboardChartCard } from "../components/DashboardCharts";
import { useItAssetDashboard } from "../hooks/useItAssetDashboard";
import { getItAssetLookupsService } from "../services/itAssetService";

import "./itAssetReports.css";

const EMPTY_FILTERS = {
  search: "",
  categoryId: "",
  brandId: "",
  modelId: "",
  statusId: "",
  conditionId: "",
  departmentId: "",
  locationId: "",
  roomId: "",
  assignedUserId: "",
  dateFrom: "",
  dateTo: "",
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

const SCREEN_COLUMNS = [
  ["AssetTag", "Asset Tag"],
  ["CategoryName", "Category"],
  ["BrandName", "Brand"],
  ["ModelName", "Model"],
  ["StatusName", "Status"],
  ["ConditionName", "Condition"],
  ["CurrentAssignedName", "Assigned To"],
  ["DepartmentName", "Department"],
  ["LocationName", "Location"],
  ["RoomName", "Room"],
  ["SerialIpMac", "Serial / IP / MAC"],
];

const PDF_COLUMNS = [
  { key: "AssetTag", label: "Asset Tag", width: 22 },
  { key: "CategoryName", label: "Category", width: 27 },
  { key: "BrandName", label: "Brand", width: 24 },
  { key: "ModelName", label: "Model", width: 32 },
  { key: "StatusName", label: "Status", width: 24 },
  { key: "ConditionName", label: "Condition", width: 29 },
  { key: "CurrentAssignedName", label: "Assigned To", width: 35 },
  { key: "placement", label: "Placement", width: 43 },
  { key: "SerialIpMac", label: "Serial / IP / MAC", width: 31 },
];

const safeText = (value, fallback = "Not recorded") => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }
  return String(value);
};

const normalizePdfText = (value) =>
  safeText(value, "-").replace(/\s+/g, " ").trim();

const localDateStamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const nextPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

const formatGeneratedAt = (value) =>
  new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const buildPlacement = (asset) =>
  [asset.LocationName, asset.RoomName, asset.DepartmentName]
    .filter(Boolean)
    .join(" / ") || "Not recorded";

const isDisposedOrBeyondRepair = (asset) => {
  const status = String(asset?.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();
  const condition = String(asset?.ConditionName || "")
    .replace(/[\s_/-]/g, "")
    .toUpperCase();

  return status === "DISPOSED" || condition.includes("BEYONDREPAIR");
};

const mapAssetsForSpreadsheet = (assets) =>
  assets.map((asset) => ({
    "Asset Tag": asset.AssetTag,
    Category: asset.CategoryName,
    Brand: asset.BrandName,
    Model: asset.ModelName,
    Status: asset.StatusName,
    Condition: asset.ConditionName,
    "Assigned To": asset.CurrentAssignedName,
    Department: asset.DepartmentName,
    Location: asset.LocationName,
    Room: asset.RoomName,
    "Serial / IP / MAC": asset.SerialIpMac,
    "Created At": asset.CreatedAt,
  }));

const addCanvasSection = (pdf, canvas, layout) => {
  const {
    pageWidth,
    pageHeight,
    margin,
    gap,
  } = layout;
  const contentWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const pixelsPerMillimeter = canvas.width / contentWidth;
  const fullHeight = canvas.height / pixelsPerMillimeter;

  if (
    fullHeight <= usableHeight &&
    layout.cursorY + fullHeight > pageHeight - margin
  ) {
    pdf.addPage();
    layout.cursorY = margin;
  }

  let sourceY = 0;

  while (sourceY < canvas.height) {
    let availableHeight = pageHeight - margin - layout.cursorY;
    if (availableHeight < 24) {
      pdf.addPage();
      layout.cursorY = margin;
      availableHeight = usableHeight;
    }

    const availablePixels = Math.floor(
      availableHeight * pixelsPerMillimeter
    );
    const sliceHeight = Math.min(
      canvas.height - sourceY,
      availablePixels
    );
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const context = sliceCanvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    context.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    const renderedHeight = sliceHeight / pixelsPerMillimeter;
    pdf.addImage(
      sliceCanvas.toDataURL("image/png"),
      "PNG",
      margin,
      layout.cursorY,
      contentWidth,
      renderedHeight,
      undefined,
      "FAST"
    );

    sourceY += sliceHeight;
    layout.cursorY += renderedHeight;

    if (sourceY < canvas.height) {
      pdf.addPage();
      layout.cursorY = margin;
    }
  }

  layout.cursorY += gap;
};

const drawAssetTable = ({
  pdf,
  assets,
  generatedAt,
  generatedBy,
  filterSummary,
  title = "Filtered Asset Listing",
}) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const tableWidth = PDF_COLUMNS.reduce(
    (total, column) => total + column.width,
    0
  );
  const tableLeft = margin + (pageWidth - margin * 2 - tableWidth) / 2;
  const bodyFontSize = 6.6;
  const lineHeight = 3;
  let y = margin;

  const drawTablePageTitle = (continued = false) => {
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(
      continued ? `${title} (continued)` : title,
      margin,
      y + 2
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `${assets.length.toLocaleString()} matching assets | Generated ${generatedAt} by ${generatedBy}`,
      margin,
      y + 7
    );
    const filterLines = pdf.splitTextToSize(
      `Filters: ${filterSummary || "All assets"}`,
      pageWidth - margin * 2
    );
    pdf.text(filterLines, margin, y + 11);
    y += 13 + filterLines.length * 3;
  };

  const drawTableHeader = () => {
    let x = tableLeft;
    pdf.setFillColor(15, 23, 42);
    pdf.rect(tableLeft, y, tableWidth, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.8);

    PDF_COLUMNS.forEach((column) => {
      pdf.text(column.label, x + 1.2, y + 5);
      x += column.width;
    });

    y += 8;
  };

  const startTablePage = (continued = false) => {
    if (continued) pdf.addPage();
    y = margin;
    drawTablePageTitle(continued);
    drawTableHeader();
  };

  startTablePage(false);

  if (!assets.length) {
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("No assets match the active report filters.", margin, y + 10);
    return;
  }

  assets.forEach((asset, rowIndex) => {
    const rowValues = {
      ...asset,
      placement: buildPlacement(asset),
    };
    const wrappedCells = PDF_COLUMNS.map((column) =>
      pdf
        .splitTextToSize(
          normalizePdfText(rowValues[column.key]),
          column.width - 2.4
        )
        .slice(0, 3)
    );
    const rowHeight = Math.max(
      7,
      Math.max(...wrappedCells.map((lines) => lines.length)) * lineHeight + 2
    );

    if (y + rowHeight > pageHeight - margin - 4) {
      startTablePage(true);
    }

    if (rowIndex % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(tableLeft, y, tableWidth, rowHeight, "F");
    }

    let x = tableLeft;
    pdf.setDrawColor(226, 232, 240);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(bodyFontSize);

    wrappedCells.forEach((lines, columnIndex) => {
      const column = PDF_COLUMNS[columnIndex];
      pdf.rect(x, y, column.width, rowHeight);
      pdf.text(lines, x + 1.2, y + 3.2);
      x += column.width;
    });

    y += rowHeight;
  });

};

const addPdfPageNumbers = (pdf) => {
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `IT Operations Report | Page ${page} of ${pageCount}`,
      pdf.internal.pageSize.getWidth() - 10,
      pdf.internal.pageSize.getHeight() - 4,
      { align: "right" }
    );
  }
};

const ReportCharts = ({ charts = {} }) => (
  <>
    <Box
      className="it-report-chart-grid it-report-pdf-section"
      data-pdf-section
    >
      <DashboardChartCard
        title="Assets by Category"
        subtitle="Complete filtered inventory breakdown"
        data={charts.assetsByCategory}
        type="ranked"
        maxItems={null}
        itemLabel="categories"
      />
      <DashboardChartCard
        title="Assets by Location"
        subtitle="Complete filtered physical distribution"
        data={charts.assetsByLocation}
        type="ranked"
        maxItems={null}
        itemLabel="locations"
      />
    </Box>

    <Box
      className="it-report-chart-grid it-report-pdf-section"
      data-pdf-section
    >
      <DashboardChartCard
        title="Assets by Status"
        subtitle="Effective lifecycle state"
        data={charts.assetsByStatus}
      />
      <DashboardChartCard
        title="Assets by Condition"
        subtitle="Recorded asset condition"
        data={charts.assetsByCondition}
      />
    </Box>
  </>
);

const ReportAssetTable = ({
  assets,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const visibleRows = assets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTable = (rows, print = false) => (
    <Table size="small" aria-label="Filtered IT asset listing">
      <TableHead>
        <TableRow>
          {SCREEN_COLUMNS.map(([field, label]) => (
            <TableCell key={field}>{label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((asset) => (
          <TableRow key={asset.AssetId} hover={!print}>
            {SCREEN_COLUMNS.map(([field]) => (
              <TableCell key={field}>
                {field === "StatusName" ? (
                  <AppChip
                    label={safeText(asset[field], "Unknown")}
                    status={asset[field]}
                  />
                ) : (
                  safeText(asset[field], "-")
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (!assets.length) {
    return (
      <Box className="it-report-empty-assets">
        <Typography fontWeight={900}>No matching assets</Typography>
        <Typography variant="body2" color="text.secondary">
          Adjust the report filters to include asset records.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="it-report-screen-table">
      <TableContainer>{renderTable(visibleRows)}</TableContainer>
      <TablePagination
        component="div"
        page={page}
        rowsPerPage={rowsPerPage}
        count={assets.length}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number(event.target.value))
        }
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

const PrintAssetTable = ({
  assets,
  emptyMessage = "No assets match this report section.",
}) => {
  if (!assets.length) {
    return (
      <Box className="it-report-print-table">
        <Typography>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box className="it-report-print-table">
      <Table size="small" aria-label="Printable IT asset listing">
        <TableHead>
          <TableRow>
            {SCREEN_COLUMNS.map(([field, label]) => (
              <TableCell key={field}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.AssetId}>
              {SCREEN_COLUMNS.map(([field]) => (
                <TableCell key={field}>
                  {safeText(asset[field], "-")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default function Reports() {
  usePageTitle("IT Asset Reports");

  const { user } = useAuth();
  const reportRef = useRef(null);
  const { dashboard, loading, error, refetch } = useItAssetDashboard();
  const [lookups, setLookups] = useState({});
  const [lookupError, setLookupError] = useState("");
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [generatedAt, setGeneratedAt] = useState(new Date());
  const [exporting, setExporting] = useState(false);
  const [preparingPrint, setPreparingPrint] = useState(false);
  const [actionError, setActionError] = useState("");
  const [assetPage, setAssetPage] = useState(0);
  const [assetRowsPerPage, setAssetRowsPerPage] = useState(25);

  useEffect(() => {
    let mounted = true;

    getItAssetLookupsService()
      .then((data) => {
        if (mounted) setLookups(data || {});
      })
      .catch((err) => {
        if (!mounted) return;
        setLookupError(
          err?.response?.data?.message || "Unable to load report filters."
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const modelOptions = useMemo(
    () =>
      (lookups.models || []).filter(
        (model) =>
          (!draftFilters.categoryId ||
            String(model.ITAssetCategoryId) ===
              String(draftFilters.categoryId)) &&
          (!draftFilters.brandId ||
            String(model.ITAssetBrandId) === String(draftFilters.brandId))
      ),
    [
      draftFilters.brandId,
      draftFilters.categoryId,
      lookups.models,
    ]
  );

  const roomOptions = useMemo(
    () =>
      (lookups.rooms || []).filter(
        (room) =>
          !draftFilters.locationId ||
          String(room.LocationId) === String(draftFilters.locationId)
      ),
    [draftFilters.locationId, lookups.rooms]
  );

  const activeFilterLabels = useMemo(() => {
    const labels = [];
    const search = String(activeFilters.search || "").trim();

    if (search) labels.push(`Search: ${search}`);

    FILTER_CONFIG.forEach(([key, label, source, valueKey, labelKey]) => {
      if (!activeFilters[key]) return;
      const option = (lookups[source] || []).find(
        (item) =>
          String(item[valueKey]) === String(activeFilters[key])
      );
      labels.push(`${label}: ${option?.[labelKey] || activeFilters[key]}`);
    });

    if (activeFilters.dateFrom) {
      labels.push(`Created from: ${activeFilters.dateFrom}`);
    }
    if (activeFilters.dateTo) {
      labels.push(`Created to: ${activeFilters.dateTo}`);
    }

    return labels;
  }, [activeFilters, lookups]);

  const filterSummary = activeFilterLabels.join("; ") || "All assets";
  const generatedAtLabel = formatGeneratedAt(generatedAt);
  const generatedBy =
    user?.fullName ||
    user?.FullName ||
    user?.name ||
    "Authenticated user";
  const assets = useMemo(
    () => dashboard?.filteredAssets || [],
    [dashboard?.filteredAssets]
  );
  const hasActiveFilters = useMemo(
    () =>
      Object.values(activeFilters).some(
        (value) => String(value || "").trim() !== ""
      ),
    [activeFilters]
  );
  const disposedAssets = useMemo(
    () => assets.filter(isDisposedOrBeyondRepair),
    [assets]
  );

  const reportStats = useMemo(
    () =>
      buildItAssetDashboardStats(dashboard?.kpis).map((stat) => ({
        title: stat.title,
        value: stat.value,
        subtitle: stat.subtitle,
        icon: stat.icon,
        color: stat.color,
      })),
    [dashboard?.kpis]
  );

  useEffect(() => {
    setAssetPage(0);
  }, [assets.length, activeFilters]);

  const updateDraftFilter = (key, value) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "categoryId" || key === "brandId"
        ? { modelId: "" }
        : {}),
      ...(key === "locationId" ? { roomId: "" } : {}),
    }));
  };

  const reloadReport = async (filters) => {
    setActionError("");
    await refetch(filters);
    setGeneratedAt(new Date());
  };

  const applyFilters = async () => {
    if (
      draftFilters.dateFrom &&
      draftFilters.dateTo &&
      draftFilters.dateFrom > draftFilters.dateTo
    ) {
      setActionError("The Created From date must be before the Created To date.");
      return;
    }

    const nextFilters = { ...draftFilters };
    setActiveFilters(nextFilters);
    await reloadReport(nextFilters);
  };

  const resetFilters = async () => {
    const emptyFilters = { ...EMPTY_FILTERS };
    setDraftFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    await reloadReport({});
  };

  const exportExcel = () => {
    try {
      setActionError("");
      const workbook = XLSX.utils.book_new();
      const summary = [
        {
          "Generated At": generatedAtLabel,
          "Generated By": generatedBy,
          Filters: filterSummary,
          "Matching Assets": assets.length,
          ...(dashboard?.kpis || {}),
        },
      ];
      const assetRows = mapAssetsForSpreadsheet(assets);

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(summary),
        "Summary"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(assetRows),
        "Filtered Assets"
      );
      if (!hasActiveFilters) {
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(
            mapAssetsForSpreadsheet(disposedAssets)
          ),
          "Disposed Beyond Repair"
        );
      }
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          dashboard?.charts?.assetsByCategory || []
        ),
        "Assets by Category"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          dashboard?.charts?.assetsByStatus || []
        ),
        "Assets by Status"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          dashboard?.charts?.assetsByCondition || []
        ),
        "Assets by Condition"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          dashboard?.charts?.assetsByLocation || []
        ),
        "Assets by Location"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(dashboard?.partsToOrder || []),
        "Parts To Order"
      );

      XLSX.writeFile(
        workbook,
        `IT_Operations_Report_${localDateStamp()}.xlsx`
      );
    } catch (err) {
      console.error("IT report Excel export error:", err);
      setActionError("Unable to export the report to Excel.");
    }
  };

  const buildReportPdf = async () => {
    if (!reportRef.current) {
      throw new Error("Report content is not available.");
    }

    await document.fonts?.ready;
    await nextPaint();

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const layout = {
      pageWidth: pdf.internal.pageSize.getWidth(),
      pageHeight: pdf.internal.pageSize.getHeight(),
      margin: 10,
      gap: 5,
      cursorY: 10,
    };
    const sections = Array.from(
      reportRef.current.querySelectorAll("[data-pdf-section]")
    );

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: dashboardColors.background,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: Math.max(
          document.documentElement.clientWidth,
          section.scrollWidth
        ),
      });
      addCanvasSection(pdf, canvas, layout);
    }

    pdf.addPage();
    drawAssetTable({
      pdf,
      assets,
      generatedAt: generatedAtLabel,
      generatedBy,
      filterSummary,
    });
    if (!hasActiveFilters) {
      pdf.addPage();
      drawAssetTable({
        pdf,
        assets: disposedAssets,
        generatedAt: generatedAtLabel,
        generatedBy,
        filterSummary: "Unfiltered disposed and beyond-repair register",
        title: "Disposed / Beyond Repair Assets",
      });
    }
    addPdfPageNumbers(pdf);

    return pdf;
  };

  const exportPdf = async () => {
    try {
      setExporting(true);
      setActionError("");
      const pdf = await buildReportPdf();
      pdf.save(`IT_Operations_Report_${localDateStamp()}.pdf`);
    } catch (err) {
      console.error("IT report PDF export error:", err);
      setActionError("Unable to export the complete report to PDF.");
    } finally {
      setExporting(false);
    }
  };

  const printReport = async () => {
    const printPageStyle = document.createElement("style");
    printPageStyle.setAttribute("data-it-report-print-page", "true");
    printPageStyle.textContent = "@page { size: A4 portrait; margin: 8mm; }";

    try {
      setPreparingPrint(true);
      setActionError("");
      document.head.appendChild(printPageStyle);
      await document.fonts?.ready;
      await nextPaint();
      window.dispatchEvent(new Event("resize"));
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      window.print();
    } catch (err) {
      console.error("IT report print error:", err);
      setActionError("Unable to prepare the report for printing.");
    } finally {
      printPageStyle.remove();
      setPreparingPrint(false);
    }
  };

  if (loading && !dashboard) {
    return <AppLoadingState title="Loading IT Operations Reports..." />;
  }

  return (
    <Box className="it-operations-reports-page">
      <Box className="it-report-screen-only">
        <AppBreadcrumbs
          items={[
            { label: "IT Assets", to: "/it-assets/dashboard" },
            { label: "Reports" },
          ]}
        />

        <PageHeader
          title="IT Operations Reports"
          subtitle="Filter the live asset dashboard, review matching inventory, and produce complete operational reports."
          action={
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent="flex-end"
            >
              <Tooltip title="Refresh the active report">
                <span>
                  <AppButton
                    variant="outlined"
                    startIcon={
                      loading ? (
                        <CircularProgress size={17} />
                      ) : (
                        <RefreshOutlinedIcon />
                      )
                    }
                    disabled={loading || exporting}
                    onClick={() => reloadReport(activeFilters)}
                  >
                    Refresh
                  </AppButton>
                </span>
              </Tooltip>
              <AppButton
                variant="outlined"
                startIcon={<TableViewOutlinedIcon />}
                disabled={exporting}
                onClick={exportExcel}
              >
                Excel
              </AppButton>
              <AppButton
                variant="outlined"
                startIcon={<PictureAsPdfOutlinedIcon />}
                disabled={exporting}
                onClick={exportPdf}
              >
                {exporting ? "Building PDF..." : "Export PDF"}
              </AppButton>
              <AppButton
                startIcon={<PrintOutlinedIcon />}
                disabled={exporting || preparingPrint}
                onClick={printReport}
              >
                {preparingPrint ? "Preparing..." : "Print"}
              </AppButton>
            </Stack>
          }
        />

        {(error || lookupError || actionError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {actionError || lookupError || error}
          </Alert>
        )}

        <DashboardCard
          title="Report Filters"
          subtitle={`${activeFilterLabels.length} active filter${
            activeFilterLabels.length === 1 ? "" : "s"
          } | ${assets.length.toLocaleString()} matching assets`}
          action={
            loading ? (
              <CircularProgress size={20} />
            ) : (
              <FilterAltOutlinedIcon color="action" />
            )
          }
        >
          <Box className="it-report-filter-grid">
            <TextField
              size="small"
              label="Search Assets"
              value={draftFilters.search}
              onChange={(event) =>
                updateDraftFilter("search", event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              placeholder="Tag, model, serial, assignee, location..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {FILTER_CONFIG.map(
              ([key, label, source, valueKey, labelKey]) => (
                <AppFormField
                  key={key}
                  type="autocomplete"
                  size="small"
                  label={label}
                  value={draftFilters[key]}
                  options={
                    key === "modelId"
                      ? modelOptions
                      : key === "roomId"
                      ? roomOptions
                      : lookups[source] || []
                  }
                  valueKey={valueKey}
                  labelKey={labelKey}
                  onChange={(value) => updateDraftFilter(key, value)}
                />
              )
            )}

            <TextField
              size="small"
              type="date"
              label="Created From"
              value={draftFilters.dateFrom}
              onChange={(event) =>
                updateDraftFilter("dateFrom", event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="Created To"
              value={draftFilters.dateTo}
              onChange={(event) =>
                updateDraftFilter("dateTo", event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={1.5}
            sx={{ mt: 2 }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {activeFilterLabels.length ? (
                activeFilterLabels.map((label) => (
                  <AppChip key={label} label={label} />
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  The report currently includes all registered assets.
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <AppButton
                size="small"
                variant="outlined"
                disabled={loading}
                onClick={resetFilters}
              >
                Reset
              </AppButton>
              <AppButton
                size="small"
                startIcon={<FilterAltOutlinedIcon />}
                disabled={loading}
                onClick={applyFilters}
              >
                Apply Filters
              </AppButton>
            </Stack>
          </Stack>
        </DashboardCard>
      </Box>

      <Box
        ref={reportRef}
        className={[
          "it-operations-report-document",
          exporting ? "it-report-pdf-capture" : "",
          preparingPrint ? "it-report-preparing-print" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Box
          className="it-report-document-header it-report-pdf-section"
          data-pdf-section
        >
          <Box>
            <Typography className="it-report-eyebrow">
              Arab Unity School
            </Typography>
            <Typography component="h1">IT Operations Report</Typography>
            <Typography className="it-report-description">
              Live asset management dashboard and filtered inventory snapshot
            </Typography>
          </Box>
          <Box className="it-report-meta">
            <Typography>
              <strong>Generated:</strong> {generatedAtLabel}
            </Typography>
            <Typography>
              <strong>Prepared by:</strong> {generatedBy}
            </Typography>
            <Typography>
              <strong>Matching assets:</strong>{" "}
              {assets.length.toLocaleString()}
            </Typography>
          </Box>
          <Box className="it-report-filter-summary">
            <Typography component="span">Filters</Typography>
            <Typography>{filterSummary}</Typography>
          </Box>
        </Box>

        <Box
          className="it-report-kpi-section it-report-pdf-section"
          data-pdf-section
        >
          <KpiGrid stats={reportStats} />
        </Box>

        <ReportCharts charts={dashboard?.charts} />

        <Box
          className="it-report-operations-section it-report-pdf-section"
          data-pdf-section
        >
          <AssetDashboardOperationsRow dashboard={dashboard || {}} />
        </Box>

        <Box className="it-report-assets-section">
          <DashboardCard
            title="Filtered Asset Listing"
            subtitle="Every asset matching the active dashboard filters is included in PDF, Excel, and print output."
            action={
              <Typography className="it-report-row-count">
                {assets.length.toLocaleString()} assets
              </Typography>
            }
          >
            <ReportAssetTable
              assets={assets}
              page={assetPage}
              rowsPerPage={assetRowsPerPage}
              onPageChange={setAssetPage}
              onRowsPerPageChange={(value) => {
                setAssetRowsPerPage(value);
                setAssetPage(0);
              }}
            />
            {preparingPrint && <PrintAssetTable assets={assets} />}
          </DashboardCard>
        </Box>

        {!hasActiveFilters && preparingPrint && (
          <Box className="it-report-disposed-section">
            <DashboardCard
              title="Disposed / Beyond Repair Assets"
              subtitle="Dedicated register included with unfiltered reports."
              action={
                <Typography className="it-report-row-count">
                  {disposedAssets.length.toLocaleString()} assets
                </Typography>
              }
            >
              <PrintAssetTable
                assets={disposedAssets}
                emptyMessage="No disposed or beyond-repair assets found."
              />
            </DashboardCard>
          </Box>
        )}
      </Box>
    </Box>
  );
}
