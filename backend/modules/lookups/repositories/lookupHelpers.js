// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Lookup Helpers
// ============================================
//
// Purpose:
// Shared SQL helpers for platform lookup data.
//
// Rules:
// - Repository-only helper.
// - No HTTP logic.
// - No business logic.
// - Table and column names must come from code,
//   never from user input.
// ============================================

const { sql, executeQuery, rows } = require("../../../shared/database");

// ============================================
// Safe Identifier Helper
// ============================================

function safeName(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`);
  }

  return value;
}

// ============================================
// Generic Active Lookup
// ============================================

async function getActiveLookup({
  table,
  idColumn,
  keyColumn,
  nameColumn,
  descriptionColumn = null,
  sortColumn = null,
  activeColumn = "IsActive",
}) {
  const safeTable = safeName(table);
  const safeIdColumn = safeName(idColumn);
  const safeKeyColumn = safeName(keyColumn);
  const safeNameColumn = safeName(nameColumn);
  const safeActiveColumn = activeColumn ? safeName(activeColumn) : null;
  const safeDescriptionColumn = descriptionColumn
    ? safeName(descriptionColumn)
    : null;
  const safeSortColumn = sortColumn ? safeName(sortColumn) : safeNameColumn;

  const result = await executeQuery(`
    SELECT
      ${safeIdColumn} AS id,
      ${safeKeyColumn} AS [key],
      ${safeNameColumn} AS [name]
      ${safeDescriptionColumn ? `, ${safeDescriptionColumn} AS description` : ""}
    FROM dbo.${safeTable}
    ${safeActiveColumn ? `WHERE ${safeActiveColumn} = 1` : ""}
    ORDER BY ${safeSortColumn} ASC;
  `);

  return rows(result);
}

// ============================================
// Generic Lookup Without IsActive
// ============================================

async function getLookup({
  table,
  idColumn,
  keyColumn,
  nameColumn,
  descriptionColumn = null,
  sortColumn = null,
}) {
  return getActiveLookup({
    table,
    idColumn,
    keyColumn,
    nameColumn,
    descriptionColumn,
    sortColumn,
    activeColumn: null,
  });
}

// ============================================
// Lookup By Foreign Key
// ============================================

async function getLookupByForeignKey({
  table,
  idColumn,
  keyColumn,
  nameColumn,
  foreignKeyColumn,
  foreignKeyValue,
  descriptionColumn = null,
  sortColumn = null,
  activeColumn = "IsActive",
}) {
  const safeTable = safeName(table);
  const safeIdColumn = safeName(idColumn);
  const safeKeyColumn = safeName(keyColumn);
  const safeNameColumn = safeName(nameColumn);
  const safeForeignKeyColumn = safeName(foreignKeyColumn);
  const safeDescriptionColumn = descriptionColumn
    ? safeName(descriptionColumn)
    : null;
  const safeSortColumn = sortColumn ? safeName(sortColumn) : safeNameColumn;
  const safeActiveColumn = activeColumn ? safeName(activeColumn) : null;

  const result = await executeQuery(
    `
      SELECT
        ${safeIdColumn} AS id,
        ${safeKeyColumn} AS [key],
        ${safeNameColumn} AS [name]
        ${safeDescriptionColumn ? `, ${safeDescriptionColumn} AS description` : ""}
      FROM dbo.${safeTable}
      WHERE ${safeForeignKeyColumn} = @ForeignKeyValue
        ${safeActiveColumn ? `AND ${safeActiveColumn} = 1` : ""}
      ORDER BY ${safeSortColumn} ASC;
    `,
    [
      {
        name: "ForeignKeyValue",
        type: sql.Int,
        value: Number(foreignKeyValue),
      },
    ]
  );

  return rows(result);
}

module.exports = {
  getActiveLookup,
  getLookup,
  getLookupByForeignKey,
};