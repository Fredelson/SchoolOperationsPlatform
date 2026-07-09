// ============================================
// Asset Explorer Pagination Hook
// Arab Unity School Operations Platform
// ============================================

import { useState } from "react";

/**
 * Manages asset table pagination only.
 */
const useAssetPagination = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const resetPagination = () => {
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
    });
  };

  return {
    pagination,
    setPagination,
    resetPagination,
  };
};

export default useAssetPagination;