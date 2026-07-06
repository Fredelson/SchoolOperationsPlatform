/* =========================================================
   IT Asset Notes Validator
========================================================= */

const validateCreateNote = (req, res, next) => {
  if (!req.body.assetId) {
    return res.status(400).json({ success: false, message: "Asset ID is required." });
  }

  if (!req.body.noteTypeId) {
    return res.status(400).json({ success: false, message: "Note type is required." });
  }

  if (!req.body.noteText) {
    return res.status(400).json({ success: false, message: "Note text is required." });
  }

  return next();
};

module.exports = {
  validateCreateNote,
};