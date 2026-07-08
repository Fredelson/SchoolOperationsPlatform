import api from "../../../services/api";

export const previewItAssetsImportApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/it-assets/import/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const commitItAssetsImportApi = async (batchId) => {
  const response = await api.post(`/it-assets/import/${batchId}/commit`);
  return response.data;
};