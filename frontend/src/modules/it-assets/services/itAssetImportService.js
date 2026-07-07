import { importItAssetsApi } from "../api/itAssetImportApi";

export const importItAssetsService = async (file) => {
  const response = await importItAssetsApi(file);
  const data = response?.data || response || {};

  return {
    success: response?.success ?? true,
    message: response?.message || data.message || "Import completed.",
    summary: data.summary || response.summary || {},
    errors: data.errors || response.errors || [],
    rows: data.rows || response.rows || [],
  };
};