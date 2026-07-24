// ============================================
// ARAB UNITY SCHOOL
// Purchase Service
// ============================================

import api from "./api";

export const getPurchases = async () => {
  const response = await api.get("/printing/purchases");
  return response.data?.data ?? response.data;
};

export const addPurchase = async (purchaseData) => {
  const response = await api.post("/printing/purchases", purchaseData);
  return response.data?.data ?? response.data;
};
