import {
  previewItAssetsImportApi,
  commitItAssetsImportApi,
} from "../api/itAssetImportApi";

export const importItAssetsService = async (file) => {
  return previewItAssetsImportApi(file);
};

export const commitItAssetsImportService = async (batchId) => {
  return commitItAssetsImportApi(batchId);
};