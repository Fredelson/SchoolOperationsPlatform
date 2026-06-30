import api from "./api";

// ============================================
// Get master data
// ============================================
export const getMasterData = async (type) => {
  const response = await api.get(`/master/${type}`);
  return response.data;
};

// ============================================
// Create
// ============================================
export const createMasterData = async (type, data) => {
  const response = await api.post(`/master/${type}`, data);
  return response.data;
};

// ============================================
// Update
// ============================================
export const updateMasterData = async (type, id, data) => {
  const response = await api.put(`/master/${type}/${id}`, data);
  return response.data;
};

// ============================================
// Activate / Deactivate
// ============================================
export const updateMasterStatus = async (
  type,
  id,
  isActive
) => {
  const response = await api.patch(
    `/master/${type}/${id}/status`,
    { isActive }
  );

  return response.data;
};
