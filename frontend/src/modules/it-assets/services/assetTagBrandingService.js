import api from "../../../services/api";

export const getAssetTagBranding = async (type) => {
  const response = await api.get(`/it-assets/asset-tag-branding/${type}`);
  return response.data?.data;
};

export const saveAssetTagBranding = async (type, data) => {
  const response = await api.put(`/it-assets/asset-tag-branding/${type}`, data);
  return response.data?.data;
};
