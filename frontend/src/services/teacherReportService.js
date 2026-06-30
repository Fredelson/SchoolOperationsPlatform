// frontend/src/services/teacherReportService.js

import api from "./api";

export const getTeacherReportsData = async (filters = {}) => {
  const response = await api.get("/teacher/reports", {
    params: filters,
  });

  return response.data;
};
