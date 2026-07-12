import api from "@services/api";

export async function listWorkspaces() {
  const response = await api.get("/workspace-manager", { params: { limit: 100 } });
  return response.data?.data || [];
}

export async function getWorkspaceConfiguration(id) {
  const response = await api.get(`/workspace-manager/${id}/configuration`);
  return response.data?.data;
}

export async function saveWorkspaceAssignments(id, type, items) {
  const response=await api.put(`/workspace-manager/${id}/assignments/${type}`,{items});
  return response.data?.data;
}

export async function getUserWorkspacePreview(userId) {
  const response=await api.get(`/workspace-manager/preview/users/${userId}`);
  return response.data?.data;
}
export async function searchWorkspacePreviewUsers(search="") {
  const response=await api.get("/workspace-manager/preview/users",{params:{search}});
  return response.data?.data||[];
}

export async function startLiveMode(targetUserId,reason) {
  const response=await api.post("/workspace-manager/live-mode",{targetUserId,reason});
  return response.data?.data;
}

export async function exitLiveMode(sessionId) {
  const originalToken=localStorage.getItem("token");
  const response=await api.post(`/workspace-manager/live-mode/${sessionId}/exit`,{}, {headers:{Authorization:`Bearer ${originalToken}`}});
  return response.data?.data;
}

export async function saveWorkspaceDashboard(id,dashboardId,defaultRoute) {
  const response=await api.put(`/workspace-manager/${id}/dashboard`,{dashboardId:dashboardId||null,defaultRoute});
  return response.data?.data;
}
