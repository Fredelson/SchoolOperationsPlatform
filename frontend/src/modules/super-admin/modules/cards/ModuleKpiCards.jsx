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

export default function ModuleKpiCards({ kpis }) {
  return (
    <AppStatCards
      items={[
        {
          title: "Total Modules",
          value: kpis.total,
          helperText: "Registered platform modules",
        },
        {
          title: "Active Modules",
          value: kpis.active,
          helperText: "Available for platform use",
        },
        {
          title: "Inactive Modules",
          value: kpis.inactive,
          helperText: "Temporarily disabled",
        },
        {
          title: "Visible Modules",
          value: kpis.visible,
          helperText: "Shown in navigation rules",
        },
      ]}
    />
  );
}