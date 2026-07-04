const permissionGroupRepository = require("../repositories/permissionGroupRepository");
const {
  validatePermissionGroupPayload,
} = require("../validators/permissionGroupValidator");

const getPermissionGroups = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const result = await permissionGroupRepository.getPermissionGroups({
    search: query.search || "",
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

const getPermissionGroupById = async (permissionGroupId) => {
  const group = await permissionGroupRepository.getPermissionGroupById(
    Number(permissionGroupId)
  );

  if (!group) {
    const error = new Error("Permission group not found.");
    error.statusCode = 404;
    throw error;
  }

  return group;
};

const createPermissionGroup = async (body) => {
  const validationErrors = validatePermissionGroupPayload(body);

  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const groupKey = body.groupKey.trim();
  const groupName = body.groupName.trim();

  const existingKey = await permissionGroupRepository.getPermissionGroupByKey(groupKey);
  if (existingKey) {
    const error = new Error("Group key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const existingName = await permissionGroupRepository.getPermissionGroupByName(groupName);
  if (existingName) {
    const error = new Error("Group name already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await permissionGroupRepository.createPermissionGroup({
    groupKey,
    groupName,
    description: body.description?.trim() || null,
    sortOrder: Number(body.sortOrder || 0),
  });
};

const updatePermissionGroup = async (permissionGroupId, body) => {
  const id = Number(permissionGroupId);

  const current = await permissionGroupRepository.getPermissionGroupById(id);
  if (!current) {
    const error = new Error("Permission group not found.");
    error.statusCode = 404;
    throw error;
  }

  const validationErrors = validatePermissionGroupPayload(body);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const groupKey = body.groupKey.trim();
  const groupName = body.groupName.trim();

  const duplicateKey = await permissionGroupRepository.getPermissionGroupByKey(groupKey);
  if (duplicateKey && duplicateKey.PermissionGroupId !== id) {
    const error = new Error("Group key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const duplicateName = await permissionGroupRepository.getPermissionGroupByName(groupName);
  if (duplicateName && duplicateName.PermissionGroupId !== id) {
    const error = new Error("Group name already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await permissionGroupRepository.updatePermissionGroup(id, {
    groupKey,
    groupName,
    description: body.description?.trim() || null,
    sortOrder: Number(body.sortOrder || 0),
  });
};

const deletePermissionGroup = async (permissionGroupId) => {
  const id = Number(permissionGroupId);

  const current = await permissionGroupRepository.getPermissionGroupById(id);
  if (!current) {
    const error = new Error("Permission group not found.");
    error.statusCode = 404;
    throw error;
  }

  return await permissionGroupRepository.deletePermissionGroup(id);
};

module.exports = {
  getPermissionGroups,
  getPermissionGroupById,
  createPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
};