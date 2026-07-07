import api from "../../../services/api";

export const importItAssetsApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/it-assets/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};