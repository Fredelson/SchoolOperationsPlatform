import api from "../../../services/api";

export const getAssetTagBranding = async (type) => {
  const response = await api.get(`/it-assets/asset-tag-branding/${type}`);
  return response.data?.data;
};

export const saveAssetTagBranding = async (type, data) => {
  const response = await api.put(`/it-assets/asset-tag-branding/${type}`, {
    settings: data,
  });
  return response.data?.data;
};

export const uploadAssetTagTemplate = async (type, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/it-assets/asset-tag-branding/${type}/template`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data?.data;
};

export const removeAssetTagTemplate = async (type) => {
  const response = await api.delete(
    `/it-assets/asset-tag-branding/${type}/template`
  );
  return response.data?.data;
};
