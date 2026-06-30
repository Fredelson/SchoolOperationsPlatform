// ============================================
// ARAB UNITY SCHOOL
// Purchase Service
// ============================================

import api from "./api";

export const getPurchases = async () => {
  const response = await api.get("/purchases");
  return response.data;
};

export const addPurchase = async (purchaseData) => {
  const response = await api.post("/purchases", purchaseData);
  return response.data;
};
