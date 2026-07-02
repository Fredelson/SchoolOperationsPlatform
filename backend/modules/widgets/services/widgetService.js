// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Service
// ============================================

const widgetRepository = require("../repositories/widgetRepository");

function normalizeNullableNumber(value) {
  if (value === "" || value === undefined || value === null) return null;
  return Number(value);
}

function validateWidgetPayload(data = {}) {
  if (!data.widgetKey?.trim()) return "Widget key is required.";
  if (!data.widgetName?.trim()) return "Widget name is required.";
  if (!data.visibilityStatusId) return "Visibility status is required.";

  return null;
}

async function getWidgets(query) {
  const [widgets, statistics] = await Promise.all([
    widgetRepository.getWidgets(query),
    widgetRepository.getWidgetStatistics(),
  ]);

  return {
    ...widgets,
    statistics,
  };
}

async function getWidgetById(widgetId) {
  const widget = await widgetRepository.getWidgetById(Number(widgetId));

  if (!widget) {
    const error = new Error("Widget not found.");
    error.statusCode = 404;
    throw error;
  }

  return widget;
}

async function createWidget(data) {
  const validationError = validateWidgetPayload(data);
  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const isDuplicate = await widgetRepository.isWidgetKeyTaken(data.widgetKey);

  if (isDuplicate) {
    const error = new Error("Widget key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const payload = {
    moduleId: normalizeNullableNumber(data.moduleId),
    widgetKey: data.widgetKey.trim(),
    widgetName: data.widgetName.trim(),
    widgetType: data.widgetType?.trim() || null,
    dataSourceKey: data.dataSourceKey?.trim() || null,
    description: data.description?.trim() || null,
    permissionId: normalizeNullableNumber(data.permissionId),
    featureFlagId: normalizeNullableNumber(data.featureFlagId),
    visibilityStatusId: Number(data.visibilityStatusId),
    defaultWidth: normalizeNullableNumber(data.defaultWidth),
    defaultHeight: normalizeNullableNumber(data.defaultHeight),
    sortOrder: Number(data.sortOrder || 0),
  };

  const widgetId = await widgetRepository.createWidget(payload);
  return getWidgetById(widgetId);
}

async function updateWidget(widgetId, data) {
  const id = Number(widgetId);

  await getWidgetById(id);

  const validationError = validateWidgetPayload(data);
  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const isDuplicate = await widgetRepository.isWidgetKeyTaken(
    data.widgetKey,
    id
  );

  if (isDuplicate) {
    const error = new Error("Widget key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const payload = {
    moduleId: normalizeNullableNumber(data.moduleId),
    widgetKey: data.widgetKey.trim(),
    widgetName: data.widgetName.trim(),
    widgetType: data.widgetType?.trim() || null,
    dataSourceKey: data.dataSourceKey?.trim() || null,
    description: data.description?.trim() || null,
    permissionId: normalizeNullableNumber(data.permissionId),
    featureFlagId: normalizeNullableNumber(data.featureFlagId),
    visibilityStatusId: Number(data.visibilityStatusId),
    defaultWidth: normalizeNullableNumber(data.defaultWidth),
    defaultHeight: normalizeNullableNumber(data.defaultHeight),
    sortOrder: Number(data.sortOrder || 0),
  };

  await widgetRepository.updateWidget(id, payload);
  return getWidgetById(id);
}

async function deleteWidget(widgetId) {
  const id = Number(widgetId);

  await getWidgetById(id);
  await widgetRepository.deleteWidget(id);

  return true;
}

async function getWidgetLookups() {
  return widgetRepository.getWidgetLookups();
}

module.exports = {
  getWidgets,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
  getWidgetLookups,
};