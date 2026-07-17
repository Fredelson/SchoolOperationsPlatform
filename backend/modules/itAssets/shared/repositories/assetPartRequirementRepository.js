const sql = require("mssql");

const insertPartRequirements = async ({
  transaction,
  assetId,
  assetAssignmentId = null,
  assetBorrowId = null,
  parts = [],
  requestedByUserId = null,
  notes = null,
}) => {
  const sourceCount =
    Number(assetAssignmentId !== null) + Number(assetBorrowId !== null);

  if (sourceCount !== 1) {
    throw new Error(
      "Part requirements must reference one assignment or one borrow."
    );
  }

  if (!parts.length) {
    return [];
  }

  const requirements = [];

  for (const part of parts) {
    const result = await new sql.Request(transaction)
      .input("AssetId", sql.Int, assetId)
      .input("AssetAssignmentId", sql.Int, assetAssignmentId)
      .input("AssetBorrowId", sql.Int, assetBorrowId)
      .input("PartKey", sql.NVarChar(50), part.partKey)
      .input("PartName", sql.NVarChar(100), part.partName)
      .input("RequestedByUserId", sql.Int, requestedByUserId)
      .input("Notes", sql.NVarChar(sql.MAX), notes)
      .query(`
        INSERT INTO dbo.ITAssetPartRequirements
        (
          AssetId,
          AssetAssignmentId,
          AssetBorrowId,
          PartKey,
          PartName,
          Quantity,
          RequirementStatus,
          RequestedByUserId,
          RequestedAt,
          Notes,
          IsActive
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @AssetId,
          @AssetAssignmentId,
          @AssetBorrowId,
          @PartKey,
          @PartName,
          1,
          'REQUIRED',
          @RequestedByUserId,
          GETDATE(),
          @Notes,
          1
        );
      `);

    requirements.push(result.recordset[0]);
  }

  return requirements;
};

module.exports = {
  insertPartRequirements,
};
