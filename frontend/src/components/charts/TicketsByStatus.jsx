// ============================================
// ARAB UNITY SCHOOL
// Tickets By Status Section
//
// Purpose:
// Displays ticket distribution using a donut chart.
//
// Reusable:
// Can be reused by IT Service Desk dashboard later.
// ============================================

import ModuleStatusChart from "../charts/ModuleStatusChart";

// ============================================
// Component
// ============================================

export default function TicketsByStatus({ data = [] }) {
  return (
    <ModuleStatusChart
      title="Tickets by Status"
      subtitle="Current ticket queue"
      data={data}
    />
  );
}