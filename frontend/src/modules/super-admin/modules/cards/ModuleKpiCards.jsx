// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module KPI Cards
// ============================================
//
// Purpose:
// Module Manager KPI wrapper using the shared
// AppStatCards component.
// ============================================

import AppStatCards from "@ui/AppStatCards";

// ============================================
// Component
// ============================================

export default function ModuleKpiCards({ kpis = {} }) {
  return (
    <AppStatCards
      items={[
        {
          title: "Total Modules",
          value: kpis.totalModules || 0,
          helperText: "Registered platform modules",
        },
        {
          title: "Active Modules",
          value: kpis.activeModules || 0,
          helperText: "Available for platform use",
        },
        {
          title: "Inactive Modules",
          value: kpis.inactiveModules || 0,
          helperText: "Temporarily disabled",
        },
        {
          title: "Visible Modules",
          value: kpis.visibleModules || 0,
          helperText: "Shown in navigation rules",
        },
      ]}
    />
  );
}
