// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useAssetList Hook
// ============================================

import { useCallback, useEffect, useState } from "react";
import { getItAssetsService } from "../services/itAssetService";

export const useAssetList = () => {
  const [assets, setAssets] = useState([]);

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    totalRows: 0,
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          pageSize: rowsPerPage,
          search: searchValue,
        });

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
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
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