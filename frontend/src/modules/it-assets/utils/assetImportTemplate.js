export const downloadAssetImportTemplate = () => {
  const headers = [
    "AssetCode",
    "AssetName",
    "Category",
    "Brand",
    "Model",
    "SerialNumber",
    "Status",
    "Condition",
    "School",
    "Department",
    "Location",
    "Room",
    "PurchaseDate",
    "PurchaseCost",
    "WarrantyExpiryDate",
    "Remarks",
  ];

  const sample = [
    "LAP-0001",
    "Dell Latitude 5420",
    "Laptop",
    "Dell",
    "Latitude 5420",
    "SN123456789",
    "Available",
    "Good",
    "Arab Unity School",
    "IT",
    "IT Office",
    "IT Room",
    "2026-01-01",
    "2500",
    "2029-01-01",
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