/* =========================================================
   IT Asset Notes Controller
========================================================= */

const service = require("../services/assetNoteService");

const createNote = async (req, res) => {
  try {
    const data = await service.createNote({
      payload: req.body,
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: "Asset note added successfully.",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const data = await service.getNotes({
      assetId: req.params.assetId || req.query.assetId || null,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const data = await service.deleteNote({
      assetNoteId: req.params.assetNoteId,
    });

    return res.status(200).json({
      success: true,
      message: "Asset note deleted successfully.",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};