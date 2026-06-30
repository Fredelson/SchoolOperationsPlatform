// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu KPI Cards
// ============================================
//
// Purpose:
// Displays Menu Manager KPI summary cards.
// ============================================

import AppStatCards from "@platform/ui/AppStatCards";

export default function MenuKpiCards({ kpis = {} }) {
  const cards = [
    {
      label: "Total Menus",
      value: kpis.totalMenus || 0,
    },
    {
      label: "Visible Menus",
      value: kpis.visibleMenus || 0,
    },
    {
      label: "Hidden Menus",
      value: kpis.hiddenMenus || 0,
    },
    {
      label: "Parent Menus",
      value: kpis.parentMenus || 0,
    },
  ];

  return <AppStatCards cards={cards} />;
}