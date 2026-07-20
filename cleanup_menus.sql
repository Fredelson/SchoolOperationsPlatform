-- ============================================================
-- OPERATIONS PLATFORM - MENU CLEANUP SCRIPT
-- ============================================================
-- Date: 2026-07-20
-- Purpose: Delete orphaned/duplicate menus and clean up modules
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

BEGIN TRY

    -- ============================================================
    -- STEP 1: Log menus to be deleted
    -- ============================================================
    
    PRINT N'=== MENUS TO BE DELETED ===';
    
    SELECT m.MenuId, m.MenuKey, m.MenuName, m.ModuleId, m.ParentMenuId
    INTO #MenusToDelete
    FROM dbo.Menus m
    WHERE m.MenuId IN (
        -- Old duplicate root menus (have *_ROOT replacements)
        51,   -- PRINTING
        53,   -- IT_HELP_DESK
        54,   -- INVENTORY
        55,   -- HR
        57,   -- COMMUNICATION
        63,   -- PLATFORM_REPORTS
        112,  -- COMMUNICATION_CENTER
        125,  -- HR_MANAGEMENT
        128,  -- ID_MANAGEMENT
        136,  -- IT_OPERATIONS
        145,  -- OBSERVATIONS
        150,  -- PLATFORM_FOUNDATION
        155,  -- PRINTING_MANAGEMENT
        159,  -- REPORTS_ANALYTICS
        160,  -- SCHOOL_STRUCTURE
        166,  -- SYSTEM_TOOLS
        169,  -- USER_ACCESS
        
        -- Orphaned IT Assets sub-menus (duplicates under IT_OPERATIONS_ROOT)
        66,   -- IT_ASSETS_DASHBOARD
        67,   -- IT_ASSETS_ASSET_MANAGEMENT
        68,   -- IT_ASSETS_ASSIGNMENT
        69,   -- IT_ASSETS_MAINTENANCE
        70,   -- IT_ASSETS_IMPORT
        71,   -- IT_ASSETS_GROUPS
        72,   -- IT_ASSETS_MASTER_DATA
        73,   -- IT_ASSETS_REPORTS
        74,   -- IT_ASSETS_ALL
        75,   -- IT_ASSETS_COMPUTERS
        76,   -- IT_ASSETS_PRINTERS_COPIERS
        77,   -- IT_ASSETS_PROJECTORS
        78,   -- IT_ASSETS_NETWORK_DEVICES
        79,   -- IT_ASSETS_CCTV_CAMERAS
        80,   -- IT_ASSETS_CURRENT_ASSIGNMENTS
        81,   -- IT_ASSETS_TRANSFER_REQUESTS
        82,   -- IT_ASSETS_NEEDED_LAPTOPS
        83,   -- IT_ASSETS_ASSIGNMENT_HISTORY
        84,   -- IT_ISSUES
        85,   -- IT_MAINTENANCE_LOGS
        86,   -- IT_MAINTENANCE_SCHEDULE
        87,   -- IT_DISPOSAL
        88,   -- IT_ASSETS_CATEGORIES
        89,   -- IT_ASSETS_BRANDS
        90,   -- IT_ASSETS_MODELS
        91,   -- IT_ASSETS_STATUSES
        92,   -- IT_ASSETS_CONDITIONS
        93,   -- IT_ASSETS_REPORT_INVENTORY
        94,   -- IT_ASSETS_REPORT_ASSIGNMENT
        95,   -- IT_ASSETS_REPORT_MAINTENANCE
        96,   -- IT_ASSETS_REPORT_ISSUES
        97,   -- IT_ASSETS_REPORT_DISPOSAL
        
        -- Role dashboard menus (old role-based dashboards)
        1221, -- teacher_dashboard
        1222, -- teacher_create_request
        1223, -- teacher_my_requests
        1224, -- teacher_reports
        1225, -- teacher_profile
        1226, -- hod_dashboard
        1227, -- hod_pending
        1228, -- hod_approved
        1229, -- hod_create
        1230, -- hod_profile
        1231, -- hos_dashboard
        1232, -- hos_allocations
        1233, -- hos_profile
        1234, -- library_dashboard
        1235, -- library_books
        1236, -- library_categories
        1237, -- library_members
        1238, -- library_borrowing
        1239, -- library_returns
        1240, -- library_reservations
        1241, -- library_overdue
        1242, -- library_inventory
        1243, -- library_reports
        1244, -- library_settings
        1245, -- PLATFORM_ADMIN_DASHBOARD
        1246, -- admin_dashboard
        1247, -- clinic_dashboard
        1248, -- deputy_head_dashboard
        1249, -- homeroom_dashboard
        1250, -- operations_dashboard
        1251  -- year_leader_dashboard
    );
    
    SELECT COUNT(*) AS TotalMenusToDelete FROM #MenusToDelete;
    
    -- ============================================================
    -- STEP 2: Delete from WorkspaceMenus (FK constraint)
    -- ============================================================
    
    PRINT N'=== DELETING FROM WorkspaceMenus ===';
    
    DELETE wm
    FROM dbo.WorkspaceMenus wm
    INNER JOIN #MenusToDelete mtd ON wm.MenuId = mtd.MenuId;
    
    PRINT N'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' WorkspaceMenu records (MenuId)';
    
    -- ============================================================
    -- STEP 3: Update WorkspaceMenus ParentMenuId (FK constraint)
    -- ============================================================
    
    PRINT N'=== UPDATING WorkspaceMenus ParentMenuId ===';
    
    UPDATE wm
    SET wm.ParentMenuId = NULL
    FROM dbo.WorkspaceMenus wm
    INNER JOIN #MenusToDelete mtd ON wm.ParentMenuId = mtd.MenuId;
    
    PRINT N'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' WorkspaceMenu records (ParentMenuId)';
    
    -- ============================================================
    -- STEP 4: Update Menus ParentMenuId (self-reference FK)
    -- ============================================================
    
    PRINT N'=== UPDATING Menus ParentMenuId ===';
    
    UPDATE m
    SET m.ParentMenuId = NULL
    FROM dbo.Menus m
    INNER JOIN #MenusToDelete mtd ON m.ParentMenuId = mtd.MenuId;
    
    PRINT N'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' Menu records (ParentMenuId)';
    
    -- ============================================================
    -- STEP 5: Delete MenuGroupItems
    -- ============================================================
    
    PRINT N'=== DELETING MENU GROUP ITEMS ===';
    
    DELETE mgi
    FROM dbo.MenuGroupItems mgi
    INNER JOIN #MenusToDelete mtd ON mgi.MenuId = mtd.MenuId;
    
    PRINT N'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' MenuGroupItem records';
    
    -- ============================================================
    -- STEP 6: Delete Menus
    -- ============================================================
    
    PRINT N'=== DELETING MENUS ===';
    
    DELETE m
    FROM dbo.Menus m
    INNER JOIN #MenusToDelete mtd ON m.MenuId = mtd.MenuId;
    
    PRINT N'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' Menu records';
    
    -- ============================================================
    -- STEP 7: Verify remaining orphaned root menus
    -- ============================================================
    
    PRINT N'=== REMAINING ORPHANED ROOT MENUS (no MenuGroup) ===';
    
    SELECT m.MenuId, m.MenuKey, m.MenuName, m.ModuleId, m.Route
    FROM dbo.Menus m
    LEFT JOIN dbo.MenuGroupItems mgi ON m.MenuId = mgi.MenuId
    WHERE m.ParentMenuId IS NULL
      AND mgi.MenuGroupItemId IS NULL
      AND m.MenuKey NOT IN ('DASHBOARD')
    ORDER BY m.ModuleId, m.SortOrder;
    
    -- ============================================================
    -- STEP 8: Summary
    -- ============================================================
    
    PRINT N'=== CLEANUP SUMMARY ===';
    
    SELECT 
        m.ModuleId,
        mod.ModuleName,
        COUNT(*) AS RemainingMenus,
        SUM(CASE WHEN mgi.MenuGroupItemId IS NULL THEN 1 ELSE 0 END) AS UngroupedMenus
    FROM dbo.Menus m
    INNER JOIN dbo.Modules mod ON m.ModuleId = mod.ModuleId
    LEFT JOIN dbo.MenuGroupItems mgi ON m.MenuId = mgi.MenuId
    WHERE m.ParentMenuId IS NULL
    GROUP BY m.ModuleId, mod.ModuleName
    ORDER BY m.ModuleId;
    
    PRINT N'=== CLEANUP COMPLETE ===';
    
    COMMIT TRANSACTION;
    
    PRINT N'Transaction committed successfully.';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    
    PRINT N'ERROR: ' + ERROR_MESSAGE();
    PRINT N'Transaction rolled back.';
    
    THROW;
END CATCH

-- Cleanup temp table
IF OBJECT_ID('tempdb..#MenusToDelete') IS NOT NULL
    DROP TABLE #MenusToDelete;
