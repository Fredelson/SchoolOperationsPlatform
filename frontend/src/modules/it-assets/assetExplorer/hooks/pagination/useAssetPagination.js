// ============================================
// Asset Explorer Pagination + Filters Hook
// Arab Unity School Operations Platform
// ============================================

import { useState } from "react";

const useAssetPagination = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    statusId: "",
    locationId: "",
    conditionId: "",
  });

  const resetPagination = () => {
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
    });
  };

  const clearFilters = () => {
    setFilters({
      statusId: "",
      locationId: "",
      conditionId: "",
    });
  };

  return {
    pagination,
    setPagination,
    resetPagination,
    filters,
    setFilters,
    clearFilters,
  };
};

export default useAssetPagination;