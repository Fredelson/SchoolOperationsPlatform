import api from "./api";

export const getPaperStock = async () => {
  const response = await api.get("/printing/inventory");
  return { stock: response.data?.data ?? response.data ?? [] };
};

export const updatePaperStock = async (data) => {
  const response = await api.put("/printing/inventory", data);
  return response.data?.data ?? response.data;
};
