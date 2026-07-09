// ============================================
// Asset Explorer Filters Hook
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useEffect, useState } from "react";

import { getAssetExplorerFilterLookupsApi } from "../../api/assetExplorerApi";

/**
 * Handles Asset Explorer filter state and lookup loading.
 */
const useAssetFilters = () => {
  const [filters, setFilters] = useState({
    statusId: "",
    locationId: "",
    conditionId: "",
  });

  const [filterLookups, setFilterLookups] = useState({
    statuses: [],
    locations: [],
    conditions: [],
  });

  const [filterLookupLoading, setFilterLookupLoading] = useState(false);

  const hasActiveFilters =
    Boolean(filters.statusId) ||
    Boolean(filters.locationId) ||
    Boolean(filters.conditionId);

  const clearFilters = useCallback(() => {
    setFilters({
      statusId: "",
      locationId: "",
      conditionId: "",
    });
  }, []);

  useEffect(() => {
    const loadFilterLookups = async () => {
      try {
        setFilterLookupLoading(true);

        const result = await getAssetExplorerFilterLookupsApi();

        setFilterLookups({
          statuses: result.statuses || [],
          locations: result.locations || [],
          conditions: result.conditions || [],
        });
      } catch (error) {
        console.error("Failed to load asset filter lookups:", error);
      } finally {
        setFilterLookupLoading(false);
      }
    };

    loadFilterLookups();
  }, []);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    filterLookups,
    filterLookupLoading,
  };
};

export default useAssetFilters;