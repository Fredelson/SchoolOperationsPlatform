/* =========================================================
   IT Asset Notes Service
========================================================= */

const repository = require("../repositories/assetNoteRepository");

const userId = (user) => user?.id || user?.UserId || null;

const createNote = async ({ payload, user }) => {
  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  return repository.createNote({
    payload,
    createdBy: userId(user),
  });
};

const getNotes = async ({ assetId = null }) => {
  return repository.getNotes({ assetId });
};

const deleteNote = async ({ assetNoteId }) => {
  const deleted = await repository.deleteNote(assetNoteId);

  if (!deleted) {
    throw Object.assign(new Error("Asset note not found."), { statusCode: 404 });
  }

  return deleted;
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};