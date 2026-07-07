// ============================================
// useItAssetDashboard Hook
// ============================================

import { useEffect, useState } from "react";
import { getItAssetDashboardService } from "../services/itAssetDashboardService";

export const useItAssetDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getItAssetDashboardService();
      setDashboard(data);
    } catch (err) {
      console.error("IT Asset Dashboard Error:", err);
      setError("Unable to load IT Asset Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};