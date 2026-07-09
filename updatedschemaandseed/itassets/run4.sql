UPDATE a
SET
    a.ITAssetModelId = s.ResolvedModelId,
    a.ModelDescription = COALESCE(a.ModelDescription, s.ModelName),
    a.UpdatedAt = GETDATE()
FROM dbo.ITAssets a
INNER JOIN dbo.ITAssetImportStaging s
    ON s.AssetTag = a.AssetTag
WHERE a.IsDeleted = 0
  AND a.ITAssetModelId IS NULL
  AND s.ResolvedModelId IS NOT NULL;