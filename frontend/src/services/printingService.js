import api from "./api";

const unwrap = (response) => response.data?.data ?? response.data;

export const createPrintingDraft = async (payload) =>
  unwrap(await api.post("/printing/requests/drafts", payload));

export const uploadPrintingAttachment = async (requestId, formData) =>
  unwrap(
    await api.post(
      `/printing/requests/${requestId}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
  );

export const submitPrintingRequest = async (requestId) =>
  unwrap(await api.post(`/printing/requests/${requestId}/submit`));

export const getMyPrintingRequests = async () =>
  unwrap(await api.get("/printing/requests/mine"));

export const getMyPrintingAttachments = async () =>
  unwrap(await api.get("/printing/requests/attachments/mine"));

export const getPrintingRequestById = async (requestId) =>
  unwrap(await api.get(`/printing/requests/${requestId}`));

export const cancelMyPrintingRequest = async (requestId, remarks) =>
  unwrap(
    await api.put(`/printing/requests/${requestId}/cancel`, { remarks })
  );

export const getPrintingDashboard = async () =>
  unwrap(await api.get("/printing/dashboard"));

export const getPrintingQueue = async () =>
  unwrap(await api.get("/printing/queue"));

export const getQueueRequestById = async (requestId) =>
  unwrap(await api.get(`/printing/queue/${requestId}`));

export const claimPrintingRequest = async (requestId) =>
  unwrap(await api.put(`/printing/queue/${requestId}/claim`));

export const startPrintingRequest = async (requestId) =>
  unwrap(await api.put(`/printing/queue/${requestId}/start`));

export const holdPrintingRequest = async (requestId, remarks) =>
  unwrap(
    await api.put(`/printing/queue/${requestId}/hold`, { remarks })
  );

export const resumePrintingRequest = async (requestId) =>
  unwrap(await api.put(`/printing/queue/${requestId}/resume`));

export const cancelPrintingRequest = async (requestId, remarks) =>
  unwrap(
    await api.put(`/printing/queue/${requestId}/cancel`, { remarks })
  );

export const completePrintingRequest = async (requestId, payload = {}) =>
  unwrap(await api.put(`/printing/queue/${requestId}/complete`, payload));

export const getManagedPrintingRequests = async () =>
  unwrap(await api.get("/printing/managed-requests"));

export const getPrintingHistory = async () =>
  unwrap(await api.get("/printing/history"));

export const getPrintingReport = async () =>
  unwrap(await api.get("/printing/reports"));

export const getPrintingSettings = async () =>
  unwrap(await api.get("/printing/settings"));

export const updatePrintingSettings = async (payload) =>
  unwrap(await api.put("/printing/settings", payload));

export const getPrintingInventory = async () =>
  unwrap(await api.get("/printing/inventory"));

export const updatePrintingInventory = async (payload) =>
  unwrap(await api.put("/printing/inventory", payload));

export const getPrintingInventoryTransactions = async () =>
  unwrap(await api.get("/printing/inventory/transactions"));

export const getPrintingPurchases = async () =>
  unwrap(await api.get("/printing/purchases"));

export const addPrintingPurchase = async (payload) =>
  unwrap(await api.post("/printing/purchases", payload));

export const getPrintingDistributions = async () =>
  unwrap(await api.get("/printing/distributions"));

export const searchPrintingDistributionUsers = async (query) =>
  unwrap(
    await api.get("/printing/distributions/users/search", {
      params: { query },
    })
  );

export const addPrintingDistribution = async (payload) =>
  unwrap(await api.post("/printing/distributions", payload));
