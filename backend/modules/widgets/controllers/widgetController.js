// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Controller
// ============================================

const widgetService = require("../services/widgetService");

async function getWidgets(req, res, next) {
  try {
    const result = await widgetService.getWidgets(req.query);

    return res.status(200).json({
      success: true,
      message: "Widgets retrieved successfully.",
      data: result.rows,
      pagination: result.pagination,
      statistics: result.statistics,
    });
  } catch (error) {
    next(error);
  }
}

async function getWidgetById(req, res, next) {
  try {
    const widget = await widgetService.getWidgetById(req.params.widgetId);

    return res.status(200).json({
      success: true,
      message: "Widget retrieved successfully.",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
}

async function createWidget(req, res, next) {
  try {
    const widget = await widgetService.createWidget(req.body);

    return res.status(201).json({
      success: true,
      message: "Widget created successfully.",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
}

async function updateWidget(req, res, next) {
  try {
    const widget = await widgetService.updateWidget(
      req.params.widgetId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Widget updated successfully.",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteWidget(req, res, next) {
  try {
    await widgetService.deleteWidget(req.params.widgetId);

    return res.status(200).json({
      success: true,
      message: "Widget deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function getWidgetLookups(req, res, next) {
  try {
    const lookups = await widgetService.getWidgetLookups();

    return res.status(200).json({
      success: true,
      message: "Widget lookups retrieved successfully.",
      data: lookups,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWidgets,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
  getWidgetLookups,
};