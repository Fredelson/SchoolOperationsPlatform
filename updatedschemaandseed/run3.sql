USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

BEGIN TRY
    DECLARE @EnabledStatusId INT = 1;
    DECLARE @HiddenStatusId INT = 2;
    DECLARE @WorkspaceId INT = 1;

    ------------------------------------------------------------
    -- STEP 1: OFFICIAL MODULES
    ------------------------------------------------------------

    DECLARE @Modules TABLE
    (
        ModuleKey NVARCHAR(100),
        ModuleName NVARCHAR(150),
        Description NVARCHAR(255),
        Icon NVARCHAR(100),
        BaseRoute NVARCHAR(150),
        SortOrder INT
    );

    INSERT INTO @Modules VALUES
    ('platform_foundation', 'Platform Foundation', 'Platform managers: modules, menus, buttons, widgets, and feature flags.', 'admin_panel_settings', '/super-admin', 1),
    ('user_access', 'User & Access', 'Users, roles, permissions, access levels, and assignments.', 'manage_accounts', '/super-admin/user-access', 2),
    ('school_configuration', 'School Configuration', 'School identity, branding, departments, sections, subjects, terms, and classes.', 'school', '/super-admin/school-configuration', 3),
    ('printing_management', 'Printing Management', 'Printing requests, approvals, queue, paper inventory, purchases, limits, reports, and settings.', 'print', '/printing', 4),
    ('id_management', 'ID Management', 'Student IDs, staff IDs, visitor IDs, templates, QR/barcode, card printing, and reports.', 'badge', '/id-management', 5),
    ('it_operations', 'IT Operations', 'IT service desk, assets, inventory, maintenance, reports, and settings.', 'devices', '/it', 6),
    ('academic_operations', 'Academic Operations', 'Students, attendance, assessments, examinations, class management, and academic reports.', 'auto_stories', '/academic', 7),
    ('hr_management', 'HR Management', 'Employees, leave, attendance, performance, and reports.', 'groups', '/hr', 8),
    ('communication_center', 'Communication Center', 'Announcements, circulars, emails, SMS, notifications, and templates.', 'campaign', '/communication', 9),
    ('observations', 'Observations', 'Teacher observations, classroom walkthroughs, and observation reports.', 'visibility', '/observations', 10),
    ('facilities_management', 'Facilities Management', 'Rooms, buildings, reservations, maintenance requests, and facilities operations.', 'apartment', '/facilities', 11),
    ('reports_analytics', 'Reports & Analytics', 'Executive dashboards, analytics, custom reports, and export center.', 'analytics', '/reports', 12),
    ('platform', 'Platform', 'Workflow, forms, documents, global search, archive, audit logs, system health, backups, and settings.', 'settings_applications', '/system', 13);

    INSERT INTO dbo.Modules
    (
        ModuleKey,
        ModuleName,
        Description,
        Icon,
        BaseRoute,
        VisibilityStatusId,
        IsActive,
        SortOrder,
        CreatedAt
    )
    SELECT
        m.ModuleKey,
        m.ModuleName,
        m.Description,
        m.Icon,
        m.BaseRoute,
        @EnabledStatusId,
        1,
        m.SortOrder,
        GETDATE()
    FROM @Modules m
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Modules existing WHERE existing.ModuleKey = m.ModuleKey
    );

    UPDATE existing
    SET
        existing.ModuleName = m.ModuleName,
        existing.Description = m.Description,
        existing.Icon = m.Icon,
        existing.BaseRoute = m.BaseRoute,
        existing.VisibilityStatusId = @EnabledStatusId,
        existing.IsActive = 1,
        existing.SortOrder = m.SortOrder,
        existing.UpdatedAt = GETDATE()
    FROM dbo.Modules existing
    INNER JOIN @Modules m ON m.ModuleKey = existing.ModuleKey;

    ------------------------------------------------------------
    -- STEP 2: HIDE LEGACY MODULES THAT SHOULD NOT BE TOP LEVEL
    ------------------------------------------------------------

    UPDATE dbo.Modules
    SET
        VisibilityStatusId = @HiddenStatusId,
        IsActive = 0,
        UpdatedAt = GETDATE()
    WHERE ModuleKey IN ('inventory', 'it_assets', 'it_service_desk', 'reports', 'printing', 'super_admin');

    ------------------------------------------------------------
    -- STEP 3: OFFICIAL MENUS
    ------------------------------------------------------------

    DECLARE @Menus TABLE
    (
        GroupKey NVARCHAR(100),
        ModuleKey NVARCHAR(100),
        ParentKey NVARCHAR(100) NULL,
        MenuKey NVARCHAR(100),
        MenuName NVARCHAR(150),
        Route NVARCHAR(150) NULL,
        Icon NVARCHAR(100),
        SortOrder INT,
        IsCollapsible BIT
    );

    INSERT INTO @Menus VALUES
    -- MAIN
    ('MAIN', 'platform_foundation', NULL, 'MAIN_DASHBOARD', 'Dashboard', '/super-admin/dashboard', 'dashboard', 10, 0),

    -- PLATFORM FOUNDATION
    ('PLATFORM_FOUNDATION', 'platform_foundation', NULL, 'PLATFORM_FOUNDATION_ROOT', 'Platform Foundation', NULL, 'admin_panel_settings', 10, 1),
    ('PLATFORM_FOUNDATION', 'platform_foundation', 'PLATFORM_FOUNDATION_ROOT', 'MODULE_MANAGER', 'Module Manager', '/super-admin/modules', 'apps', 10, 0),
    ('PLATFORM_FOUNDATION', 'platform_foundation', 'PLATFORM_FOUNDATION_ROOT', 'MENU_MANAGER', 'Menu Manager', '/super-admin/menus', 'menu', 20, 0),
    ('PLATFORM_FOUNDATION', 'platform_foundation', 'PLATFORM_FOUNDATION_ROOT', 'BUTTON_MANAGER', 'Button Manager', '/super-admin/buttons', 'touch_app', 30, 0),
    ('PLATFORM_FOUNDATION', 'platform_foundation', 'PLATFORM_FOUNDATION_ROOT', 'WIDGET_MANAGER', 'Widget Manager', '/super-admin/widgets', 'widgets', 40, 0),
    ('PLATFORM_FOUNDATION', 'platform_foundation', 'PLATFORM_FOUNDATION_ROOT', 'FEATURE_FLAGS', 'Feature Flags', '/super-admin/feature-flags', 'flag', 50, 0),

    -- USER & ACCESS
    ('USER_ACCESS', 'user_access', NULL, 'USER_ACCESS_ROOT', 'User & Access', NULL, 'manage_accounts', 10, 1),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'USERS', 'Users', '/super-admin/users', 'people', 10, 0),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'ROLES', 'Roles', '/super-admin/roles', 'shield', 20, 0),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'PERMISSIONS', 'Permissions', '/super-admin/permissions', 'security', 30, 0),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'ACCESS_LEVELS', 'Access Levels', '/super-admin/access-levels', 'admin_panel_settings', 40, 0),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'USER_ASSIGNMENTS', 'User Assignments', '/super-admin/user-assignments', 'hub', 50, 0),
    ('USER_ACCESS', 'user_access', 'USER_ACCESS_ROOT', 'USER_PERMISSION_OVERRIDES', 'User Permission Overrides', '/super-admin/user-permission-overrides', 'manage_accounts', 60, 0),

    -- SCHOOL CONFIGURATION
    ('SCHOOL_CONFIGURATION', 'school_configuration', NULL, 'SCHOOL_CONFIGURATION_ROOT', 'School Configuration', NULL, 'school', 10, 1),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'ORGANIZATION_PROFILE', 'Organization Profile', '/super-admin/organization/profile', 'business', 10, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'BRANDING_THEME', 'Branding & Theme', '/system/branding', 'palette', 20, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'DEPARTMENTS', 'Departments', '/super-admin/settings/departments', 'business', 30, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'SECTIONS', 'Sections', '/super-admin/settings/sections', 'account_tree', 40, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'SUBJECTS', 'Subjects', '/super-admin/settings/subjects', 'menu_book', 50, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'PURPOSES', 'Purposes', '/super-admin/settings/purposes', 'fact_check', 60, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'ACADEMIC_YEARS', 'Academic Years', '/super-admin/academic-years', 'calendar_month', 70, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'TERMS', 'Terms', '/super-admin/terms', 'date_range', 80, 0),
    ('SCHOOL_CONFIGURATION', 'school_configuration', 'SCHOOL_CONFIGURATION_ROOT', 'CLASSES', 'Classes', '/super-admin/classes', 'class', 90, 0),

    -- OPERATIONS ROOTS
    ('OPERATIONS', 'printing_management', NULL, 'PRINTING_MANAGEMENT_ROOT', 'Printing Management', NULL, 'print', 10, 1),
    ('OPERATIONS', 'id_management', NULL, 'ID_MANAGEMENT_ROOT', 'ID Management', NULL, 'badge', 20, 1),
    ('OPERATIONS', 'it_operations', NULL, 'IT_OPERATIONS_ROOT', 'IT Operations', NULL, 'devices', 30, 1),
    ('OPERATIONS', 'academic_operations', NULL, 'ACADEMIC_OPERATIONS_ROOT', 'Academic Operations', NULL, 'auto_stories', 40, 1),
    ('OPERATIONS', 'hr_management', NULL, 'HR_MANAGEMENT_ROOT', 'HR Management', NULL, 'groups', 50, 1),
    ('OPERATIONS', 'communication_center', NULL, 'COMMUNICATION_CENTER_ROOT', 'Communication Center', NULL, 'campaign', 60, 1),
    ('OPERATIONS', 'observations', NULL, 'OBSERVATIONS_ROOT', 'Observations', NULL, 'visibility', 70, 1),
    ('OPERATIONS', 'facilities_management', NULL, 'FACILITIES_MANAGEMENT_ROOT', 'Facilities Management', NULL, 'apartment', 80, 1),

    -- PRINTING CHILDREN
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINTING_DASHBOARD', 'Dashboard', '/printing/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINTING_REQUEST_MANAGEMENT', 'Request Management', '/printing/requests', 'description', 20, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINTING_APPROVAL_WORKFLOW', 'Approval Workflow', '/printing/approvals', 'approval', 30, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINT_QUEUE', 'Print Queue', '/printing/queue', 'queue', 40, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PAPER_INVENTORY', 'Paper Inventory', '/printing/inventory', 'inventory_2', 50, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PAPER_PURCHASES', 'Paper Purchases', '/printing/purchases', 'shopping_cart', 60, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINT_LIMITS', 'Limits & Allocation', '/printing/limits', 'speed', 70, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINTING_REPORTS', 'Reports', '/printing/reports', 'bar_chart', 80, 0),
    ('OPERATIONS', 'printing_management', 'PRINTING_MANAGEMENT_ROOT', 'PRINTING_SETTINGS', 'Settings', '/printing/settings', 'settings', 90, 0),

    -- ID CHILDREN
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_DASHBOARD', 'Dashboard', '/id-management/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'STUDENT_IDS', 'Student IDs', '/id-management/student-ids', 'school', 20, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'STAFF_IDS', 'Staff IDs', '/id-management/staff-ids', 'badge', 30, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'VISITOR_IDS', 'Visitor IDs', '/id-management/visitor-ids', 'person_add', 40, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_TEMPLATES', 'Templates', '/id-management/templates', 'dashboard_customize', 50, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_QR_BARCODE', 'QR / Barcode', '/id-management/qr-barcode', 'qr_code', 60, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_CARD_PRINTING', 'Card Printing', '/id-management/card-printing', 'print', 70, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_REPORTS', 'Reports', '/id-management/reports', 'assessment', 80, 0),
    ('OPERATIONS', 'id_management', 'ID_MANAGEMENT_ROOT', 'ID_SETTINGS', 'Settings', '/id-management/settings', 'settings', 90, 0),

    -- IT CHILDREN
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_DASHBOARD', 'Dashboard', '/it/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_SERVICE_DESK', 'Service Desk', '/it/service-desk', 'support_agent', 20, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_ASSET_MANAGEMENT', 'Asset Management', '/it/assets', 'devices', 30, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_INVENTORY', 'Inventory', '/it/inventory', 'inventory_2', 40, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_MAINTENANCE', 'Maintenance', '/it/maintenance', 'build', 50, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_REPORTS', 'Reports', '/it/reports', 'assessment', 60, 0),
    ('OPERATIONS', 'it_operations', 'IT_OPERATIONS_ROOT', 'IT_SETTINGS', 'Settings', '/it/settings', 'settings', 70, 0),

    -- OTHER OPERATIONS
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'ACADEMIC_DASHBOARD', 'Dashboard', '/academic/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'STUDENTS', 'Students', '/academic/students', 'groups', 20, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'ATTENDANCE', 'Attendance', '/academic/attendance', 'how_to_reg', 30, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'ASSESSMENTS', 'Assessments', '/academic/assessments', 'assignment', 40, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'EXAMINATIONS', 'Examinations', '/academic/examinations', 'quiz', 50, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'CLASS_MANAGEMENT', 'Class Management', '/academic/classes', 'class', 60, 0),
    ('OPERATIONS', 'academic_operations', 'ACADEMIC_OPERATIONS_ROOT', 'ACADEMIC_REPORTS', 'Reports', '/academic/reports', 'assessment', 70, 0),

    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'HR_DASHBOARD', 'Dashboard', '/hr/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'EMPLOYEES', 'Employees', '/hr/employees', 'people', 20, 0),
    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'LEAVE', 'Leave', '/hr/leave', 'event_busy', 30, 0),
    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'HR_ATTENDANCE', 'Attendance', '/hr/attendance', 'how_to_reg', 40, 0),
    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'PERFORMANCE', 'Performance', '/hr/performance', 'trending_up', 50, 0),
    ('OPERATIONS', 'hr_management', 'HR_MANAGEMENT_ROOT', 'HR_REPORTS', 'Reports', '/hr/reports', 'assessment', 60, 0),

    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'COMMUNICATION_DASHBOARD', 'Dashboard', '/communication/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'ANNOUNCEMENTS', 'Announcements', '/communication/announcements', 'campaign', 20, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'CIRCULARS', 'Circulars', '/communication/circulars', 'article', 30, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'EMAILS', 'Emails', '/communication/emails', 'email', 40, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'SMS', 'SMS', '/communication/sms', 'sms', 50, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'NOTIFICATIONS', 'Notifications', '/communication/notifications', 'notifications', 60, 0),
    ('OPERATIONS', 'communication_center', 'COMMUNICATION_CENTER_ROOT', 'COMMUNICATION_TEMPLATES', 'Templates', '/communication/templates', 'text_snippet', 70, 0),

    ('OPERATIONS', 'observations', 'OBSERVATIONS_ROOT', 'OBSERVATIONS_DASHBOARD', 'Dashboard', '/observations/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'observations', 'OBSERVATIONS_ROOT', 'TEACHER_OBSERVATIONS', 'Teacher Observations', '/observations/teacher', 'visibility', 20, 0),
    ('OPERATIONS', 'observations', 'OBSERVATIONS_ROOT', 'CLASSROOM_WALKTHROUGHS', 'Classroom Walkthroughs', '/observations/walkthroughs', 'checklist', 30, 0),
    ('OPERATIONS', 'observations', 'OBSERVATIONS_ROOT', 'OBSERVATION_REPORTS', 'Reports', '/observations/reports', 'assessment', 40, 0),

    ('OPERATIONS', 'facilities_management', 'FACILITIES_MANAGEMENT_ROOT', 'FACILITIES_DASHBOARD', 'Dashboard', '/facilities/dashboard', 'dashboard', 10, 0),
    ('OPERATIONS', 'facilities_management', 'FACILITIES_MANAGEMENT_ROOT', 'ROOMS', 'Rooms', '/facilities/rooms', 'meeting_room', 20, 0),
    ('OPERATIONS', 'facilities_management', 'FACILITIES_MANAGEMENT_ROOT', 'BUILDINGS', 'Buildings', '/facilities/buildings', 'apartment', 30, 0),
    ('OPERATIONS', 'facilities_management', 'FACILITIES_MANAGEMENT_ROOT', 'FACILITY_RESERVATIONS', 'Reservations', '/facilities/reservations', 'event_available', 40, 0),
    ('OPERATIONS', 'facilities_management', 'FACILITIES_MANAGEMENT_ROOT', 'FACILITY_MAINTENANCE', 'Maintenance Requests', '/facilities/maintenance', 'build', 50, 0),

    -- REPORTS
    ('REPORTS_ANALYTICS', 'reports_analytics', NULL, 'REPORTS_ANALYTICS_ROOT', 'Reports & Analytics', NULL, 'analytics', 10, 1),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'EXECUTIVE_DASHBOARD', 'Executive Dashboard', '/reports/executive', 'dashboard', 10, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_PRINTING', 'Printing Reports', '/reports/printing', 'print', 20, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_ID', 'ID Reports', '/reports/id-management', 'badge', 30, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_IT', 'IT Reports', '/reports/it', 'devices', 40, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_ACADEMIC', 'Academic Reports', '/reports/academic', 'auto_stories', 50, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_HR', 'HR Reports', '/reports/hr', 'groups', 60, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'REPORT_COMMUNICATION', 'Communication Reports', '/reports/communication', 'campaign', 70, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'CUSTOM_REPORTS', 'Custom Reports', '/reports/custom', 'tune', 80, 0),
    ('REPORTS_ANALYTICS', 'reports_analytics', 'REPORTS_ANALYTICS_ROOT', 'EXPORT_CENTER', 'Export Center', '/reports/export', 'file_download', 90, 0),

    -- SYSTEM
    ('SYSTEM', 'platform', NULL, 'PLATFORM_ROOT', 'Platform', NULL, 'settings_applications', 10, 1),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'WORKFLOW_ENGINE', 'Workflow Engine', '/system/workflows', 'account_tree', 10, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'FORM_BUILDER', 'Form Builder', '/system/forms', 'dynamic_form', 20, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'DOCUMENT_MANAGEMENT', 'Document Management', '/system/documents', 'folder', 30, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'GLOBAL_SEARCH', 'Global Search', '/system/global-search', 'search', 40, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'ARCHIVE_CENTER', 'Archive Center', '/system/archive', 'archive', 50, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'AUDIT_LOGS', 'Audit Logs', '/system/audit-logs', 'history', 60, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'SYSTEM_HEALTH', 'System Health', '/system/health', 'health_and_safety', 70, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'BACKUPS', 'Backups', '/system/backups', 'backup', 80, 0),
    ('SYSTEM', 'platform', 'PLATFORM_ROOT', 'SYSTEM_SETTINGS', 'System Settings', '/system/settings', 'settings', 90, 0);

    ------------------------------------------------------------
    -- STEP 4: UPSERT MENUS
    ------------------------------------------------------------

    MERGE dbo.Menus AS target
    USING (
        SELECT
            @WorkspaceId AS WorkspaceId,
            mod.ModuleId,
            s.ParentKey,
            s.MenuKey,
            s.MenuName,
            s.Route,
            s.Icon,
            s.SortOrder,
            s.IsCollapsible
        FROM @Menus s
        INNER JOIN dbo.Modules mod ON mod.ModuleKey = s.ModuleKey
    ) AS source
    ON target.MenuKey = source.MenuKey
    WHEN MATCHED THEN
        UPDATE SET
            target.WorkspaceId = source.WorkspaceId,
            target.ModuleId = source.ModuleId,
            target.MenuName = source.MenuName,
            target.Route = source.Route,
            target.Icon = source.Icon,
            target.VisibilityStatusId = @EnabledStatusId,
            target.IsPinned = 0,
            target.IsCollapsible = source.IsCollapsible,
            target.SortOrder = source.SortOrder,
            target.UpdatedAt = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon,
            PermissionId, FeatureFlagId, BadgeQueryKey, VisibilityStatusId,
            IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            source.WorkspaceId, source.ModuleId, NULL, source.MenuKey, source.MenuName,
            source.Route, source.Icon, NULL, NULL, NULL, @EnabledStatusId,
            0, source.IsCollapsible, source.SortOrder, GETDATE()
        );

    ------------------------------------------------------------
    -- STEP 5: SET PARENT RELATIONSHIPS
    ------------------------------------------------------------

    UPDATE child
    SET child.ParentMenuId = parent.MenuId
    FROM dbo.Menus child
    INNER JOIN @Menus source ON source.MenuKey = child.MenuKey
    INNER JOIN dbo.Menus parent ON parent.MenuKey = source.ParentKey
    WHERE source.ParentKey IS NOT NULL;

    UPDATE root
    SET root.ParentMenuId = NULL
    FROM dbo.Menus root
    INNER JOIN @Menus source ON source.MenuKey = root.MenuKey
    WHERE source.ParentKey IS NULL;

    ------------------------------------------------------------
    -- STEP 6: MENU GROUP ITEMS FOR ROOT MENUS ONLY
    ------------------------------------------------------------

    DELETE mgi
    FROM dbo.MenuGroupItems mgi
    INNER JOIN dbo.Menus m ON m.MenuId = mgi.MenuId
    WHERE m.MenuKey IN (SELECT MenuKey FROM @Menus WHERE ParentKey IS NULL);

    INSERT INTO dbo.MenuGroupItems
    (
        MenuGroupId,
        MenuId,
        SortOrder
    )
    SELECT
        mg.MenuGroupId,
        m.MenuId,
        s.SortOrder
    FROM @Menus s
    INNER JOIN dbo.MenuGroups mg ON mg.GroupKey = s.GroupKey
    INNER JOIN dbo.Menus m ON m.MenuKey = s.MenuKey
    WHERE s.ParentKey IS NULL
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.MenuGroupItems existing
          WHERE existing.MenuGroupId = mg.MenuGroupId
            AND existing.MenuId = m.MenuId
      );

    ------------------------------------------------------------
    -- STEP 7: HIDE OLD ROOT MENUS NOT IN OFFICIAL BLUEPRINT
    ------------------------------------------------------------

    UPDATE dbo.Menus
    SET
        VisibilityStatusId = @HiddenStatusId,
        UpdatedAt = GETDATE()
    WHERE ParentMenuId IS NULL
      AND MenuKey NOT IN (SELECT MenuKey FROM @Menus WHERE ParentKey IS NULL);

    ------------------------------------------------------------
    -- STEP 8: VERIFY
    ------------------------------------------------------------

    SELECT
        mg.GroupName,
        parent.MenuName AS ParentMenu,
        m.MenuKey,
        m.MenuName,
        m.Route,
        m.VisibilityStatusId,
        m.SortOrder
    FROM dbo.Menus m
    LEFT JOIN dbo.Menus parent ON parent.MenuId = m.ParentMenuId
    LEFT JOIN dbo.MenuGroupItems mgi ON mgi.MenuId = CASE WHEN m.ParentMenuId IS NULL THEN m.MenuId ELSE parent.MenuId END
    LEFT JOIN dbo.MenuGroups mg ON mg.MenuGroupId = mgi.MenuGroupId
    WHERE m.VisibilityStatusId = @EnabledStatusId
    ORDER BY
        mg.SortOrder,
        ISNULL(parent.SortOrder, m.SortOrder),
        m.ParentMenuId,
        m.SortOrder;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    SELECT
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage,
        ERROR_LINE() AS ErrorLine;
END CATCH;