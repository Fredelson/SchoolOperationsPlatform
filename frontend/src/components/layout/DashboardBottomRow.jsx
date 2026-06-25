// ============================================
// ARAB UNITY SCHOOL
// Shared Dashboard Bottom Row
//
// Purpose:
// Displays secondary analytics cards below
// the All Modules section.
//
// Layout:
// Top Print Requests | Tickets By Status | Pending Approvals
//
// Note:
// AssetSummary was removed because it is not a
// shared dashboard component.
// ============================================

import { Box } from "@mui/material";

import TopPrintRequests from "../dashboard/TopPrintRequests";
import TicketsByStatus from "../charts/TicketsByStatus";
import PendingApprovals from "../dashboard/PendingApprovals";

export default function DashboardBottomRow({
  topPrintRequests = [],
  ticketStatus = [],
  pendingApprovals = [],
}) {
  return (
    <Box
      sx={{
        mt: 2,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 1.5,
        alignItems: "stretch",
        "& > *": {
          height: "100%",
        },
      }}
    >
      <TopPrintRequests items={topPrintRequests} />
      <TicketsByStatus data={ticketStatus} />
      <PendingApprovals subtitle="Awaiting action" items={pendingApprovals} />
    </Box>
  );
}