export const downloadAssetImportTemplate = () => {
  const headers = [
    "AssetCode",
    "Category",
    "Brand",
    "Model",
    "Department",
    "Location",
    "Room",
    "Status",
    "Condition",
    "PurchaseDate",
    "EmployeeCode",
    "Remarks",
  ];

  const sample = [
    "LAP-0001",
    "Laptop",
    "Dell",
    "Latitude 5420",
    "IT",
    "IT Office",
    "IT Room",
    "Available",
    "Good",
    "2026-01-01",
    "EMP001",
    "Sample row - replace before import",
  ];

  const csvContent = `${headers.join(",")}\n${sample.join(",")}`;

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "it-asset-import-template.csv";
  link.click();

  URL.revokeObjectURL(url);
};