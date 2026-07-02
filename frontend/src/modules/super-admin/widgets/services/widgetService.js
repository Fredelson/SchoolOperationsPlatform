// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Service
// ============================================

import { widgetApi } from "../api/widgetApi";

export const widgetService = {
  getWidgets: widgetApi.getAll,
  getWidgetById: widgetApi.getById,
  createWidget: widgetApi.create,
  updateWidget: widgetApi.update,
  deleteWidget: widgetApi.remove,
  getWidgetLookups: widgetApi.getLookups,
};