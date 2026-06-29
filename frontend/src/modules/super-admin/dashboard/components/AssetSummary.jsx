// ============================================
// ARAB UNITY SCHOOL
// Asset Summary Section
//
// Purpose:
// Displays IT asset status distribution.
//
// Reusable:
// Can be reused later by IT Asset Management.
// ============================================

import { ModuleStatusChart } from "../../../components/charts";

// ============================================
// Component
// ============================================

export default function AssetSummary({ data = [] }) {
  return (
    <ModuleStatusChart
      title="Asset Summary"
      subtitle="Current asset status"
      data={data}
    />
  );
}
