// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Controller
// ============================================

const buttonsService = require("../services/buttonsService");

function handleError(res, error) {
  console.error("Button Manager Error:", error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Button Manager request failed.",
    details: error.details || null,
  });
}

async function getButtons(req, res) {
  try {
    const result = await buttonsService.getButtons(req.query);

    return res.json({
      success: true,
      message: "Buttons loaded successfully.",
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getButtonById(req, res) {
  try {
    const button = await buttonsService.getButtonById(
      Number(req.params.buttonId)
    );

    return res.json({
      success: true,
      message: "Button loaded successfully.",
      data: button,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createButton(req, res) {
  try {
    const button = await buttonsService.createButton(req.body);

    return res.status(201).json({
      success: true,
      message: "Button created successfully.",
      data: button,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateButton(req, res) {
  try {
    const button = await buttonsService.updateButton(
      Number(req.params.buttonId),
      req.body
    );

    return res.json({
      success: true,
      message: "Button updated successfully.",
      data: button,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteButton(req, res) {
  try {
    const result = await buttonsService.deleteButton(
      Number(req.params.buttonId)
    );

    return res.json({
      success: true,
      message: "Button deleted successfully.",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getButtonStatistics(req, res) {
  try {
    const statistics = await buttonsService.getButtonStatistics();

    return res.json({
      success: true,
      message: "Button statistics loaded successfully.",
      data: statistics,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getButtonLookups(req, res) {
  try {
    const lookups = await buttonsService.getButtonLookups();

    return res.json({
      success: true,
      message: "Button lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    return handleError(res, error);
  }
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