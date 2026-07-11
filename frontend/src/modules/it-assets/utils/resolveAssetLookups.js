const findById = (items, key, value) => {
  if (value === undefined || value === null || value === "") return null;
  return (items || []).find((item) => String(item?.[key]) === String(value)) || null;
};

export const resolveAssetLookups = (asset, lookups = {}) => {
  if (!asset) return null;

  const category = findById(
    lookups.categories,
    "ITAssetCategoryId",
    asset.ITAssetCategoryId
  );
  const model = findById(lookups.models, "ITAssetModelId", asset.ITAssetModelId);
  const brand = findById(
    lookups.brands,
    "ITAssetBrandId",
    asset.ITAssetBrandId ?? model?.ITAssetBrandId
  );
  const status = findById(
    lookups.statuses,
    "ITAssetStatusId",
    asset.ITAssetStatusId
  );
  const condition = findById(
    lookups.conditions,
    "ITAssetConditionId",
    asset.ITAssetConditionId
  );
  const department = findById(
    lookups.departments,
    "DepartmentId",
    asset.CurrentDepartmentId
  );
  const location = findById(
    lookups.locations,
    "LocationId",
    asset.CurrentLocationId
  );
  const room = findById(lookups.rooms, "RoomId", asset.CurrentRoomId);
  const school = findById(lookups.schools, "SchoolId", asset.SchoolId);
  const assignedUser = findById(
    lookups.users,
    "UserId",
    asset.CurrentAssignedUserId
  );

  return {
    ...asset,
    ITAssetBrandId: asset.ITAssetBrandId ?? model?.ITAssetBrandId ?? null,
    CategoryName: asset.CategoryName || category?.CategoryName || null,
    BrandName: asset.BrandName || brand?.BrandName || model?.BrandName || null,
    ModelName: asset.ModelName || model?.ModelName || null,
    StatusKey: asset.StatusKey || status?.StatusKey || null,
    StatusName: asset.StatusName || status?.StatusName || null,
    ConditionName: asset.ConditionName || condition?.ConditionName || null,
    DepartmentName: asset.DepartmentName || department?.DepartmentName || null,
    LocationName: asset.LocationName || location?.LocationName || null,
    RoomName: asset.RoomName || room?.RoomName || null,
    SchoolName: asset.SchoolName || school?.SchoolName || null,
    PreviousOwner:
      asset.PreviousOwner || asset.ResolvedPreviousOwner || null,
    CurrentAssignedUserName:
      asset.CurrentAssignedUserName || assignedUser?.FullName || null,
    CurrentAssignedName:
      asset.CurrentAssignedName || assignedUser?.FullName || null,
    CurrentAssignedEmployeeCode:
      asset.CurrentAssignedEmployeeCode || assignedUser?.EmployeeId || null,
    CurrentAssignedEmail:
      asset.CurrentAssignedEmail || assignedUser?.SchoolEmail || null,
  };
};

export default resolveAssetLookups;
