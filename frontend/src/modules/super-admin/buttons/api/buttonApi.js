// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager API
// ============================================
//
// Purpose:
// Centralizes all HTTP requests for the Button Manager.
//
// Rules:
// - No UI logic here
// - No state management here
// - Only API calls
// ============================================

import api from "../../../../services/api";

// Base endpoint registered in backend/routes/index.js:
// router.use("/buttons", require("../modules/buttons"));
const BUTTON_ENDPOINT = "/buttons";

// ============================================
// Get paginated buttons
// ============================================

export async function getButtons(params = {}) {
  const response = await api.get(BUTTON_ENDPOINT, { params });
  return response.data;
}

// ============================================
// Get single button by ID
// ============================================

export async function getButtonById(buttonId) {
  const response = await api.get(`${BUTTON_ENDPOINT}/${buttonId}`);
  return response.data;
}

// ============================================
// Create button
// ============================================

export async function createButton(payload) {
  const response = await api.post(BUTTON_ENDPOINT, payload);
  return response.data;
}

// ============================================
// Update button
// ============================================

export async function updateButton(buttonId, payload) {
  const response = await api.put(`${BUTTON_ENDPOINT}/${buttonId}`, payload);
  return response.data;
}

// ============================================
// Delete button
// ============================================

export async function deleteButton(buttonId) {
  const response = await api.delete(`${BUTTON_ENDPOINT}/${buttonId}`);
  return response.data;
}

// ============================================
// Button statistics
// ============================================

export async function getButtonStatistics() {
  const response = await api.get(`${BUTTON_ENDPOINT}/statistics`);
  return response.data;
}

// ============================================
// Button lookups
// ============================================

export async function getButtonLookups() {
  const response = await api.get(`${BUTTON_ENDPOINT}/lookups`);
  return response.data;
}