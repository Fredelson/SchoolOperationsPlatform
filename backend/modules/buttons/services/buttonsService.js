// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Service
// ============================================

const buttonsRepository = require("../repositories/buttonsRepository");
const { mapButton, mapButtons } = require("../helpers/buttonsMapper");
const { validateButtonPayload } = require("../validators/buttonsValidator");

async function getButtons(query) {
  const result = await buttonsRepository.getButtons(query);

  return {
    data: mapButtons(result.rows),
    pagination: result.pagination,
  };
}

async function getButtonById(buttonId) {
  const button = await buttonsRepository.getButtonById(buttonId);

  if (!button) {
    const error = new Error("Button not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapButton(button);
}

async function createButton(payload) {
  const validation = validateButtonPayload(payload);

  if (!validation.isValid) {
    const error = new Error("Button validation failed.");
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const keyTaken = await buttonsRepository.isButtonKeyTaken(
    validation.data.buttonKey
  );

  if (keyTaken) {
    const error = new Error("Button key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const buttonId = await buttonsRepository.createButton(validation.data);

  return getButtonById(buttonId);
}

async function updateButton(buttonId, payload) {
  await getButtonById(buttonId);

  const validation = validateButtonPayload(payload, { isUpdate: true });

  if (!validation.isValid) {
    const error = new Error("Button validation failed.");
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const keyTaken = await buttonsRepository.isButtonKeyTaken(
    validation.data.buttonKey,
    buttonId
  );

  if (keyTaken) {
    const error = new Error("Button key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const rowsAffected = await buttonsRepository.updateButton(
    buttonId,
    validation.data
  );

  if (!rowsAffected) {
    const error = new Error("Button update failed.");
    error.statusCode = 500;
    throw error;
  }

  return getButtonById(buttonId);
}

async function deleteButton(buttonId) {
  await getButtonById(buttonId);

  const rowsAffected = await buttonsRepository.deleteButton(buttonId);

  if (!rowsAffected) {
    const error = new Error("Button delete failed.");
    error.statusCode = 500;
    throw error;
  }

  return {
    buttonId,
    deleted: true,
  };
}

async function getButtonStatistics() {
  const stats = await buttonsRepository.getButtonStatistics();

  return {
    totalButtons: stats.TotalButtons || 0,
    visibleButtons: stats.VisibleButtons || 0,
    permissionProtectedButtons: stats.PermissionProtectedButtons || 0,
    featureControlledButtons: stats.FeatureControlledButtons || 0,
  };
}

async function getButtonLookups() {
  return buttonsRepository.getButtonLookups();
}

module.exports = {
  getButtons,
  getButtonById,
  createButton,
  updateButton,
  deleteButton,
  getButtonStatistics,
  getButtonLookups,
};