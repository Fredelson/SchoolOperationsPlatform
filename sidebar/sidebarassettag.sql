SELECT
    m.ModuleId,
    m.ModuleKey,
    m.ModuleName
FROM dbo.Modules m
WHERE
    m.ModuleKey LIKE '%asset%'
    OR m.ModuleName LIKE '%asset%';


SELECT
    mn.*
FROM dbo.Menus mn
WHERE
    mn.RoutePath LIKE '/it-assets%'
    OR mn.MenuName LIKE '%Asset%'
ORDER BY
    mn.ParentMenuId,
    mn.SortOrder,
    mn.MenuId;