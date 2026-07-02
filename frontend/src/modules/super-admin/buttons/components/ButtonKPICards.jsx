// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager KPI Cards
// ============================================
//
// Purpose:
// Displays Button Manager KPI summary.
//
// Responsibilities:
// • Total Buttons
// • Visible Buttons
// • Permission Protected
// • Feature Controlled
//
// Rules:
// • No API calls
// • No business logic
// • Pure presentation
// ============================================

import React, { useMemo } from "react";

import AppStatCards from "../../../../platform/ui/AppStatCards";

export default function ButtonKPICards({ statistics }) {
  // ============================================
  // Build KPI Cards
  // ============================================

  const cards = useMemo(
    () => [
      {
        id: "total-buttons",
        title: "Total Buttons",
        value: statistics?.totalButtons ?? 0,
        color: "primary",
      },
      {
        id: "visible-buttons",
        title: "Visible Buttons",
        value: statistics?.visibleButtons ?? 0,
        color: "success",
      },
      {
        id: "permission-buttons",
        title: "Permission Protected",
        value: statistics?.permissionProtectedButtons ?? 0,
        color: "warning",
      },
      {
        id: "feature-buttons",
        title: "Feature Controlled",
        value: statistics?.featureControlledButtons ?? 0,
        color: "secondary",
      },
    ],
    [statistics]
  );

  return <AppStatCards cards={cards} />;
}