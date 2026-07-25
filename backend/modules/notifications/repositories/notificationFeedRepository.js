/* =========================================================
   Personalized Notification Feed Repository
   ========================================================= */

const sql = require("mssql");
const { executeQuery } = require("../../../shared/database/executeQuery");

const normalizeModuleKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const canonicalModuleKey = (value) => {
  const normalized = normalizeModuleKey(value);
  if (normalized === "itassets") return "itoperations";
  return normalized;
};

const getNotificationFeed = async ({
  moduleKeys = [],
  includeAll = false,
  limit = 20,
}) => {
  const allowedKeys = Array.from(
    new Set(moduleKeys.map(canonicalModuleKey).filter(Boolean))
  );

  if (!includeAll && allowedKeys.length === 0) {
    return [];
  }

  const moduleParameters = allowedKeys.map((moduleKey, index) => ({
    name: `ModuleKey${index}`,
    type: sql.NVarChar(200),
    value: moduleKey,
  }));
  const moduleFilter = includeAll
    ? "1 = 1"
    : `feed.CanonicalModuleKey IN (${moduleParameters
        .map((parameter) => `@${parameter.name}`)
        .join(", ")})`;

  const result = await executeQuery(
    `
      WITH feed AS (
        SELECT
          activity.ActivityTimelineId,
          activity.UserId,
          activity.ModuleKey,
          activity.EntityType,
          activity.EntityId,
          activity.ActivityType,
          activity.ActivityTitle,
          activity.ActivityDescription,
          activity.CreatedAt,
          CASE
            WHEN LOWER(REPLACE(REPLACE(REPLACE(activity.ModuleKey, '_', ''), '-', ''), ' ', '')) = 'itassets'
              THEN 'itoperations'
            ELSE LOWER(REPLACE(REPLACE(REPLACE(activity.ModuleKey, '_', ''), '-', ''), ' ', ''))
          END AS CanonicalModuleKey
        FROM dbo.ActivityTimeline activity
      )
      SELECT TOP (@Limit)
        feed.ActivityTimelineId,
        feed.UserId,
        feed.ModuleKey,
        feed.CanonicalModuleKey,
        feed.EntityType,
        feed.EntityId,
        feed.ActivityType,
        feed.ActivityTitle,
        feed.ActivityDescription,
        feed.CreatedAt,
        performedBy.FullName AS PerformedByName,
        COALESCE(module.ModuleName, feed.ModuleKey) AS ModuleName
      FROM feed
      LEFT JOIN dbo.Users performedBy
        ON performedBy.UserId = feed.UserId
      LEFT JOIN dbo.Modules module
        ON LOWER(REPLACE(REPLACE(REPLACE(module.ModuleKey, '_', ''), '-', ''), ' ', '')) =
           feed.CanonicalModuleKey
      WHERE ${moduleFilter}
      ORDER BY feed.CreatedAt DESC, feed.ActivityTimelineId DESC;
    `,
    [
      { name: "Limit", type: sql.Int, value: limit },
      ...moduleParameters,
    ]
  );

  return result.recordset || [];
};

module.exports = {
  getNotificationFeed,
};
