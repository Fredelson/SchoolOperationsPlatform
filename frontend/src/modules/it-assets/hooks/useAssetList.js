// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useAssetList Hook
// ============================================

import { useCallback, useEffect, useState } from "react";
import { getItAssetsService } from "../services/itAssetService";

/**
 * useAssetList
 *
 * Purpose:
 * - Loads paginated IT assets from the backend.
 * - Handles search, pagination, loading, and error state.
 *
 * Important:
 * Backend returns:
 * {
 *   success: true,
 *   message: "...",
 *   data: [],
 *   pagination: {
 *     page,
 *     limit,
 *     total,
 *     totalPages
 *   }
 * }
 */
export const useAssetList = () => {
  const [assets, setAssets] = useState([]);

  const [pagination, setPagination] = useState({
    page: 0, // MUI table uses zero-based page index
    rowsPerPage: 10,
    totalRows: 0,
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch IT assets from backend.
   *
   * Frontend page is zero-based.
   * Backend page is one-based.
   */
  const fetchAssets = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);
        setError("");

        const page = options.page ?? pagination.page;
        const rowsPerPage = options.rowsPerPage ?? pagination.rowsPerPage;
        const searchValue = options.search ?? search;

        const result = await getItAssetsService({
          page: page + 1,
          limit: rowsPerPage,
          search: searchValue,
        });

        // Backend returns rows in "data", not "assets".
       setAssets(result.assets || []);

setPagination({
  page,
  rowsPerPage,
  totalRows: result.pagination?.totalRecords || 0,
});
      } catch (err) {
        console.error("Failed to fetch IT assets:", err);
        setError("Unable to load IT assets.");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.rowsPerPage, search]
  );

  useEffect(() => {
    fetchAssets();
    // Intentionally run only once on initial page load.
    // Manual refresh/search/pagination actions call fetchAssets directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    fetchAssets({
      page: 0,
      search,
    });
  };

  const handlePageChange = (_event, newPage) => {
    fetchAssets({
      page: newPage,
    });
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    fetchAssets({
      page: 0,
      rowsPerPage: newRowsPerPage,
    });
  };

  return {
    assets,
    pagination,
    search,
    loading,
    error,

    refetch: fetchAssets,

    handleSearchChange,
    handleSearchSubmit,
    handlePageChange,
    handleRowsPerPageChange,
  };
};