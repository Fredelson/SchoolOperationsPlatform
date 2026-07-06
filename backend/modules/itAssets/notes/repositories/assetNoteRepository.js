/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Notes Repository
========================================================= */

const { sql, executeQuery } = require("../../../../shared/database/executeQuery");
const { firstOrNull, rows } = require("../../../../shared/database/repositoryBase");

const getAssetById = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssets
      WHERE AssetId = @AssetId
        AND IsDeleted = 0;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return firstOrNull(result);
};

const createNote = async ({ payload, createdBy }) => {
  const result = await executeQuery(
    `
      INSERT INTO dbo.ITAssetNotes
      (
        AssetId,
        NoteTypeId,
        NoteText,
        CreatedBy,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @AssetId,
        @NoteTypeId,
        @NoteText,
        @CreatedBy,
        GETDATE()
      );
    `,
    [
      { name: "AssetId", type: sql.Int, value: Number(payload.assetId) },
      { name: "NoteTypeId", type: sql.Int, value: Number(payload.noteTypeId) },
      { name: "NoteText", type: sql.NVarChar(sql.MAX), value: payload.noteText },
      { name: "CreatedBy", type: sql.Int, value: createdBy || null },
    ]
  );

  return firstOrNull(result);
};

const getNotes = async ({ assetId = null }) => {
  const result = await executeQuery(
    `
      SELECT
        n.*,
        a.AssetTag,
        a.ModelDescription,
        nt.NoteTypeName,
        u.FullName AS CreatedByName
      FROM dbo.ITAssetNotes n
      INNER JOIN dbo.ITAssets a ON n.AssetId = a.AssetId
      INNER JOIN dbo.ITAssetNoteTypes nt ON n.NoteTypeId = nt.NoteTypeId
      LEFT JOIN dbo.Users u ON n.CreatedBy = u.UserId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR n.AssetId = @AssetId)
      ORDER BY n.CreatedAt DESC;
    `,
    [{ name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null }]
  );

  return rows(result);
};

const deleteNote = async (assetNoteId) => {
  const result = await executeQuery(
    `
      DELETE FROM dbo.ITAssetNotes
      OUTPUT DELETED.*
      WHERE AssetNoteId = @AssetNoteId;
    `,
    [{ name: "AssetNoteId", type: sql.Int, value: Number(assetNoteId) }]
  );

  return firstOrNull(result);
};

module.exports = {
  getAssetById,
  createNote,
  getNotes,
  deleteNote,
};