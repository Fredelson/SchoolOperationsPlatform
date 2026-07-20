import api from "@services/api";

export async function listWorkspaces(params={status:"active"}) {
  const response = await api.get("/workspace-manager", { params: { limit: 100,...params } });
  return response.data?.data || [];
}

export async function getWorkspaceConfiguration(id) {
  const response = await api.get(`/workspace-manager/${id}/configuration`);
  return response.data?.data;
}
export async function updateWorkspace(id,payload){const response=await api.put(`/workspace-manager/${id}`,payload);return response.data?.data;}

export async function saveWorkspaceAssignments(id, type, items) {
  const response=await api.put(`/workspace-manager/${id}/assignments/${type}`,{items});
  return response.data?.data;
}

export async function syncWorkspaceRolePermissions(id) {
  const response=await api.post(`/workspace-manager/${id}/sync-permissions`);
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

export async function getRolePermissions(params={}) {
  const response = await api.get("/role-permissions", { params: { limit: 1000, ...params } });
  return response.data?.data || [];
}

export async function updateRolePermission(id, payload) {
  const response = await api.put(`/role-permissions/${id}`, payload);
  return response.data?.data;
}

export async function createRolePermission(payload) {
  const response = await api.post("/role-permissions", payload);
  return response.data?.data;
}

export async function deleteRolePermission(id) {
  const response = await api.delete(`/role-permissions/${id}`);
  return response.data?.data;
}

export async function getRolePermissionLookups() {
  const response = await api.get("/role-permissions/lookups");
  return response.data?.data || {};
}
