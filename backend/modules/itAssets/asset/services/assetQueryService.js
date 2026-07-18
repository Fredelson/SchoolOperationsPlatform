/* =========================================================
   IT Asset Query Service

   Purpose:
   Handles read-only asset operations.
========================================================= */

const itAssetRepository = require("../repositories/itAssetRepository");

const getAssets = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const result = await itAssetRepository.getAssets({
    search: query.search || "",
    categoryId: query.categoryId || null,
    statusId: query.statusId || null,
    conditionId: query.conditionId || null,
    departmentId: query.departmentId || null,
    locationId: query.locationId || null,
    roomId: query.roomId || null,
    assignedUserId: query.assignedUserId || null,
    page,
    limit,
  });

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

const getAssetById = async (assetId) => {
  const asset = await itAssetRepository.getAssetById(assetId);

  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  return asset;
};

const exportAssets = async () => {
  const assets = await itAssetRepository.getAssetsForExport();

  const headers = [
    "AssetCode",
    "Category",
    "Brand",
    "Model",
    "AssetName",
    "SerialNumber",
    "Status",
    "Condition",
    "AssignedTo",
    "EmployeeCode",
    "Department",
    "Location",
    "Room",
    "PurchaseDate",
    "PreviousOwner",
    "IsActive",
    "CreatedAt",
    "UpdatedAt",
  ];

  const rows = assets.map((asset) => [
    asset.AssetTag || "",
    asset.CategoryName || "",
    asset.BrandName || "",
    asset.ModelName || "",
    asset.ModelDescription || "",
    asset.SerialIpMac || "",
    asset.StatusName || "",
    asset.ConditionName || "",
    asset.CurrentAssignedUserName || asset.CurrentAssignedName || "",
    asset.CurrentAssignedEmployeeCode || "",
    asset.DepartmentName || "",
    asset.LocationName || "",
    asset.RoomName || "",
    asset.AcquiredChangedDate ? new Date(asset.AcquiredChangedDate).toISOString().slice(0, 10) : "",
    asset.PreviousOwner || "",
    asset.IsActive ? "Active" : "Inactive",
    asset.CreatedAt ? new Date(asset.CreatedAt).toISOString().slice(0, 10) : "",
    asset.UpdatedAt ? new Date(asset.UpdatedAt).toISOString().slice(0, 10) : "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return { csv };
};

module.exports = {
  getAssets,
  getAssetById,
};