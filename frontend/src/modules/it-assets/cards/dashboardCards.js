// ============================================
// IT Asset Dashboard KPI Cards
// ============================================

export const buildItAssetDashboardCards = (kpis = {}) => [
  {
    title: "Total Assets",
    value: kpis.totalAssets || 0,
    subtitle: "All registered assets",
  },
  {
    title: "Available",
    value: kpis.availableAssets || kpis.available || 0,
    subtitle: "Ready for assignment",
  },
  {
    title: "Assigned",
    value: kpis.assignedAssets || kpis.assigned || 0,
    subtitle: "Currently assigned",
  },
  {
    title: "Borrowed",
    value: kpis.borrowedAssets || kpis.borrowed || 0,
    subtitle: "Temporarily borrowed",
  },
  {
    title: "Under Maintenance",
    value: kpis.underMaintenance || kpis.maintenance || 0,
    subtitle: "Assets in maintenance",
  },
  {
    title: "Open Issues",
    value: kpis.openIssues || 0,
    subtitle: "Needs IT attention",
  },
  {
    title: "Pending Transfers",
    value: kpis.pendingTransfers || 0,
    subtitle: "Waiting for transfer",
  },
  {
    title: "Pending Disposals",
    value: kpis.pendingDisposals || 0,
    subtitle: "Waiting for disposal",
  },
];