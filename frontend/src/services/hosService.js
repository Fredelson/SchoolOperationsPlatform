import api from "./api";

const unwrap = (response) => response.data?.data ?? response.data;

export const getHosDashboard = async () =>
  unwrap(await api.get("/printing/approvals/hos/summary"));

export const getHosRequests = async () => {
  const [inbox, history] = await Promise.all([
    api.get("/printing/approvals/hos"),
    api.get("/printing/approvals/hos/history"),
  ]);
  return [...(unwrap(inbox) || []), ...(unwrap(history) || [])];
};

export const getHosRequestById = async (requestId) =>
  unwrap(await api.get(`/printing/requests/${requestId}`));

export const getHosApprovalHistory = async () =>
  unwrap(await api.get("/printing/approvals/hos/history"));

const decide = async (requestId, decision, remarks) =>
  unwrap(
    await api.put(`/printing/approvals/hos/${requestId}`, {
      decision,
      remarks,
    })
  );

export const approveHosRequest = (requestId, remarks = "Approved by HOS") =>
  decide(requestId, "approve", remarks);

export const rejectHosRequest = (requestId, remarks) =>
  decide(requestId, "reject", remarks);

export const returnHosRequest = (requestId, remarks) =>
  decide(requestId, "return", remarks);
