import api from "./api";

export const getPaperStock = async () => {
  const response = await api.get("/paper-stock");
  return response.data;
};

export const updatePaperStock = async (data) => {
  const response = await api.put("/paper-stock", data);
  return response.data;
};
