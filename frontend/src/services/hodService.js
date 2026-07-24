import api from "./api";

const unwrap = (response) => response.data?.data ?? response.data;

export const getHodDashboard = async () =>
  unwrap(await api.get("/printing/approvals/hod/summary"));

export const getHodRequests = async () => {
  const [inbox, history] = await Promise.all([
    api.get("/printing/approvals/hod"),
    api.get("/printing/approvals/hod/history"),
  ]);
  return [...(unwrap(inbox) || []), ...(unwrap(history) || [])];
};

export const getHodApprovalHistory = async () =>
  unwrap(await api.get("/printing/approvals/hod/history"));

const decide = async (requestId, decision, remarks) =>
  unwrap(
    await api.put(`/printing/approvals/hod/${requestId}`, {
      decision,
      remarks,
    })
  );

export const approveHodRequest = (requestId, remarks = "Approved by HOD") =>
  decide(requestId, "approve", remarks);

export const rejectHodRequest = (requestId, remarks) =>
  decide(requestId, "reject", remarks);

export const returnHodRequest = (requestId, remarks) =>
  decide(requestId, "return", remarks);
