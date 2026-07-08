ALTER TABLE dbo.ITAssetCategories
ADD IconKey NVARCHAR(100) NULL;

UPDATE dbo.ITAssetCategories
SET IconKey =
  CASE
    WHEN LOWER(CategoryName) LIKE '%laptop%' THEN 'laptop'
    WHEN LOWER(CategoryName) LIKE '%desktop%' THEN 'desktop'
    WHEN LOWER(CategoryName) LIKE '%monitor%' THEN 'monitor'
    WHEN LOWER(CategoryName) LIKE '%screen%' THEN 'monitor'
    WHEN LOWER(CategoryName) LIKE '%printer%' THEN 'printer'
    WHEN LOWER(CategoryName) LIKE '%network%' THEN 'network'
    WHEN LOWER(CategoryName) LIKE '%tablet%' THEN 'tablet'
    WHEN LOWER(CategoryName) LIKE '%camera%' THEN 'camera'
    WHEN LOWER(CategoryName) LIKE '%projector%' THEN 'projector'
    ELSE 'category'
  END
WHERE IconKey IS NULL;