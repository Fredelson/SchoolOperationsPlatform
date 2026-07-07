import { useState } from "react";
import { importItAssetsService } from "../services/itAssetImportService";

export const useAssetImport = ({ onSuccess } = {}) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }

    try {
      setImporting(true);
      setError("");

      const importResult = await importItAssetsService(file);
      setResult(importResult);

      if (importResult.success) {
        onSuccess?.();
      }
    } catch (err) {
      console.error("Asset import failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to import IT assets."
      );
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  return {
    file,
    importing,
    result,
    error,
    handleFileChange,
    handleImport,
    resetImport,
  };
};