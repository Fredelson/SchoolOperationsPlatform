// ============================================
// useItAssetDashboard Hook
// ============================================

import { useEffect, useState } from "react";
import { getItAssetDashboardService } from "../services/itAssetDashboardService";

export const useItAssetDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await getItAssetDashboardService(filters);
      setDashboard(data);
    } catch (err) {
      console.error("IT Asset Dashboard Error:", err);
      setError("Unable to load IT Asset Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial synchronization with the dashboard API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
