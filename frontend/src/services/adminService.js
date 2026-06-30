// ============================================
// Import Users from CSV
// POST /api/admin/users/import-csv
// ============================================
export const importUsersFromCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/admin/users/import-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
