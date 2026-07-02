USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

BEGIN TRY
    DECLARE @EnabledStatusId INT;

    SELECT @EnabledStatusId = VisibilityStatusId
    FROM dbo.FeatureVisibilityStatuses
    WHERE StatusKey = 'Enabled';

    IF @EnabledStatusId IS NULL
        THROW 50001, 'Enabled visibility status not found.', 1;

    ------------------------------------------------------------
    -- 1. NORMALIZE EXISTING MODULE KEYS
    ------------------------------------------------------------
    UPDATE dbo.Modules
    SET
        ModuleKey = 'platform_foundation',
        ModuleName = 'Platform Foundation',
        Description = 'Platform control center and foundation managers',
        BaseRoute = '/super-admin',
        Icon = 'admin_panel_settings',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        SortOrder = 1,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'super_admin';

    UPDATE dbo.Modules
    SET
        ModuleName = 'User & Access Management',
        Description = 'Users, roles, permissions, access levels, and assignments',
        BaseRoute = '/super-admin/user-access',
        Icon = 'manage_accounts',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        SortOrder = 2,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'user_access';

    UPDATE dbo.Modules
    SET
        ModuleKey = 'printing_management',
        ModuleName = 'Printing Management',
        Description = 'Printing requests, approvals, queue, paper inventory, and limits',
        BaseRoute = '/printing',
        Icon = 'print',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        SortOrder = 4,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'printing';

    UPDATE dbo.Modules
    SET
        ModuleKey = 'it_operations',
        ModuleName = 'IT Operations',
        Description = 'IT service desk, assets, inventory, maintenance, and reports',
        BaseRoute = '/it',
        Icon = 'devices',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        SortOrder = 6,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'it_assets';

    UPDATE dbo.Modules
    SET
        ModuleKey = 'reports_analytics',
        ModuleName = 'Reports & Analytics',
        Description = 'Executive dashboards, analytics, custom reports, and exports',
        BaseRoute = '/reports',
        Icon = 'analytics',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        SortOrder = 11,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'reports';

    ------------------------------------------------------------
    -- 2. UPSERT OFFICIAL MODULES
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
    ('platform_foundation', 'Platform Foundation', 'Platform control center and foundation managers', 'admin_panel_settings', '/super-admin', 1),
    ('user_access', 'User & Access Management', 'Users, roles, permissions, access levels, and assignments', 'manage_accounts', '/super-admin/user-access', 2),
    ('school_structure', 'School Structure', 'Shared school structure and academic master data', 'school', '/super-admin/school-structure', 3),
    ('printing_management', 'Printing Management', 'Printing requests, approvals, queue, paper inventory, and limits', 'print', '/printing', 4),
    ('id_management', 'ID Management', 'Student, staff, visitor IDs, templates, cards, and reports', 'badge', '/id-management', 5),
    ('it_operations', 'IT Operations', 'IT service desk, assets, inventory, maintenance, and reports', 'devices', '/it', 6),
    ('academic_operations', 'Academic Operations', 'Students, attendance, assessments, examinations, and reports', 'auto_stories', '/academic', 7),
    ('communication_center', 'Communication Center', 'Announcements, circulars, email, SMS, and notifications', 'campaign', '/communication', 8),
    ('hr_management', 'HR Management', 'Employees, leave, attendance, performance, and reports', 'groups', '/hr', 9),
    ('observations', 'Observations', 'Teacher observations, walkthroughs, reviews, and reports', 'visibility', '/observations', 10),
    ('reports_analytics', 'Reports & Analytics', 'Executive dashboards, analytics, custom reports, and exports', 'analytics', '/reports', 11),
    ('system_tools', 'System & Tools', 'Branding, workflow, documents, audit logs, backups, and settings', 'settings_applications', '/system', 12);

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
        SELECT 1
        FROM dbo.Modules existing
        WHERE existing.ModuleKey = m.ModuleKey
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
    INNER JOIN @Modules m
        ON m.ModuleKey = existing.ModuleKey;

    ------------------------------------------------------------
    -- 3. DISABLE OLD STANDALONE MODULES NOW MERGED INTO DOMAINS
    ------------------------------------------------------------
    UPDATE dbo.Modules
    SET
        VisibilityStatusId = 3,
        IsActive = 0,
        UpdatedAt = GETDATE()
    WHERE ModuleKey IN ('inventory', 'it_service_desk');

    ------------------------------------------------------------
    -- 4. CLEAR CURRENT MENU PARENT LINKS SAFELY
    ------------------------------------------------------------
    UPDATE dbo.Menus
    SET ParentMenuId = NULL;

    ------------------------------------------------------------
    -- 5. UPSERT OFFICIAL MENUS
    ------------------------------------------------------------
    DECLARE @Menus TABLE
    (
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
    ('platform_foundation', NULL, 'MAIN_DASHBOARD', 'Dashboard', '/super-admin/dashboard', 'dashboard', 10, 0),

    ('platform_foundation', NULL, 'PLATFORM_FOUNDATION', 'Platform Foundation', NULL, 'admin_panel_settings', 20, 1),
    ('platform_foundation', 'PLATFORM_FOUNDATION', 'MODULE_MANAGER', 'Module Manager', '/super-admin/modules', 'apps', 10, 0),
    ('platform_foundation', 'PLATFORM_FOUNDATION', 'MENU_MANAGER', 'Menu Manager', '/super-admin/menus', 'menu', 20, 0),
    ('platform_foundation', 'PLATFORM_FOUNDATION', 'BUTTON_MANAGER', 'Button Manager', '/super-admin/buttons', 'touch_app', 30, 0),
    ('platform_foundation', 'PLATFORM_FOUNDATION', 'WIDGET_MANAGER', 'Widget Manager', '/super-admin/widgets', 'widgets', 40, 0),
    ('platform_foundation', 'PLATFORM_FOUNDATION', 'FEATURE_FLAGS', 'Feature Flags', '/super-admin/feature-flags', 'flag', 50, 0),

    ('user_access', NULL, 'USER_ACCESS', 'User & Access Management', NULL, 'manage_accounts', 30, 1),
    ('user_access', 'USER_ACCESS', 'USERS', 'Users', '/super-admin/users', 'people', 10, 0),
    ('user_access', 'USER_ACCESS', 'ROLES', 'Roles', '/super-admin/roles', 'shield', 20, 0),
    ('user_access', 'USER_ACCESS', 'PERMISSIONS', 'Permissions', '/super-admin/permissions', 'security', 30, 0),
    ('user_access', 'USER_ACCESS', 'ACCESS_LEVELS', 'Access Levels', '/super-admin/access-levels', 'admin_panel_settings', 40, 0),
    ('user_access', 'USER_ACCESS', 'USER_PERMISSION_OVERRIDES', 'User Permission Overrides', '/super-admin/user-permission-overrides', 'manage_accounts', 50, 0),
    ('user_access', 'USER_ACCESS', 'USER_ASSIGNMENTS', 'Assignments', '/super-admin/user-assignments', 'hub', 60, 0),

    ('school_structure', NULL, 'SCHOOL_STRUCTURE', 'School Structure', NULL, 'school', 40, 1),
    ('school_structure', 'SCHOOL_STRUCTURE', 'DEPARTMENTS', 'Departments', '/super-admin/settings/departments', 'business', 10, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'SECTIONS', 'Sections', '/super-admin/settings/sections', 'account_tree', 20, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'SUBJECTS', 'Subjects', '/super-admin/settings/subjects', 'menu_book', 30, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'PURPOSES', 'Purposes', '/super-admin/settings/purposes', 'fact_check', 40, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'ACADEMIC_YEARS', 'Academic Years', '/super-admin/academic-years', 'calendar_month', 50, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'TERMS', 'Terms', '/super-admin/terms', 'date_range', 60, 0),
    ('school_structure', 'SCHOOL_STRUCTURE', 'CLASSES', 'Classes', '/super-admin/classes', 'class', 70, 0),

    ('printing_management', NULL, 'PRINTING_MANAGEMENT', 'Printing Management', NULL, 'print', 50, 1),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINTING_DASHBOARD', 'Dashboard', '/printing/dashboard', 'dashboard', 10, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINTING_REQUESTS', 'Requests', '/printing/requests', 'description', 20, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINTING_APPROVALS', 'Approval Workflow', '/printing/approvals', 'approval', 30, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINT_QUEUE', 'Print Queue', '/printing/queue', 'queue', 40, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PAPER_INVENTORY', 'Paper Inventory', '/printing/inventory', 'inventory_2', 50, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PAPER_PURCHASES', 'Paper Purchases', '/printing/purchases', 'shopping_cart', 60, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINT_LIMITS', 'Limits & Allocation', '/printing/limits', 'speed', 70, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINTING_REPORTS', 'Reports', '/printing/reports', 'bar_chart', 80, 0),
    ('printing_management', 'PRINTING_MANAGEMENT', 'PRINTING_SETTINGS', 'Settings', '/printing/settings', 'settings', 90, 0),

    ('id_management', NULL, 'ID_MANAGEMENT', 'ID Management', NULL, 'badge', 60, 1),
    ('id_management', 'ID_MANAGEMENT', 'ID_DASHBOARD', 'Dashboard', '/id-management/dashboard', 'dashboard', 10, 0),
    ('id_management', 'ID_MANAGEMENT', 'STUDENT_IDS', 'Student IDs', '/id-management/student-ids', 'school', 20, 0),
    ('id_management', 'ID_MANAGEMENT', 'STAFF_IDS', 'Staff IDs', '/id-management/staff-ids', 'badge', 30, 0),
    ('id_management', 'ID_MANAGEMENT', 'VISITOR_IDS', 'Visitor IDs', '/id-management/visitor-ids', 'person_add', 40, 0),
    ('id_management', 'ID_MANAGEMENT', 'ID_TEMPLATES', 'Templates', '/id-management/templates', 'dashboard_customize', 50, 0),
    ('id_management', 'ID_MANAGEMENT', 'ID_QR_BARCODE', 'QR / Barcode', '/id-management/qr-barcode', 'qr_code', 60, 0),
    ('id_management', 'ID_MANAGEMENT', 'ID_CARD_PRINTING', 'Card Printing', '/id-management/card-printing', 'print', 70, 0),
    ('id_management', 'ID_MANAGEMENT', 'ID_REPORTS', 'Reports', '/id-management/reports', 'assessment', 80, 0),
    ('id_management', 'ID_MANAGEMENT', 'ID_SETTINGS', 'Settings', '/id-management/settings', 'settings', 90, 0),

    ('it_operations', NULL, 'IT_OPERATIONS', 'IT Operations', NULL, 'devices', 70, 1),
    ('it_operations', 'IT_OPERATIONS', 'IT_DASHBOARD', 'Dashboard', '/it/dashboard', 'dashboard', 10, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_SERVICE_DESK', 'Service Desk', '/it/service-desk', 'support_agent', 20, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_ASSET_MANAGEMENT', 'Asset Management', '/it/assets', 'devices', 30, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_INVENTORY', 'Inventory', '/it/inventory', 'inventory_2', 40, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_MAINTENANCE', 'Maintenance', '/it/maintenance', 'build', 50, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_REPORTS', 'Reports', '/it/reports', 'assessment', 60, 0),
    ('it_operations', 'IT_OPERATIONS', 'IT_SETTINGS', 'Settings', '/it/settings', 'settings', 70, 0),

    ('academic_operations', NULL, 'ACADEMIC_OPERATIONS', 'Academic Operations', NULL, 'auto_stories', 80, 1),
    ('academic_operations', 'ACADEMIC_OPERATIONS', 'STUDENTS', 'Students', '/academic/students', 'groups', 10, 0),
    ('academic_operations', 'ACADEMIC_OPERATIONS', 'ATTENDANCE', 'Attendance', '/academic/attendance', 'how_to_reg', 20, 0),
    ('academic_operations', 'ACADEMIC_OPERATIONS', 'ASSESSMENTS', 'Assessments', '/academic/assessments', 'assignment', 30, 0),
    ('academic_operations', 'ACADEMIC_OPERATIONS', 'EXAMINATIONS', 'Examinations', '/academic/examinations', 'quiz', 40, 0),
    ('academic_operations', 'ACADEMIC_OPERATIONS', 'ACADEMIC_REPORTS', 'Reports', '/academic/reports', 'assessment', 50, 0),

    ('communication_center', NULL, 'COMMUNICATION_CENTER', 'Communication Center', NULL, 'campaign', 90, 1),
    ('communication_center', 'COMMUNICATION_CENTER', 'ANNOUNCEMENTS', 'Announcements', '/communication/announcements', 'campaign', 10, 0),
    ('communication_center', 'COMMUNICATION_CENTER', 'CIRCULARS', 'Circulars', '/communication/circulars', 'article', 20, 0),
    ('communication_center', 'COMMUNICATION_CENTER', 'EMAILS', 'Emails', '/communication/emails', 'email', 30, 0),
    ('communication_center', 'COMMUNICATION_CENTER', 'SMS', 'SMS', '/communication/sms', 'sms', 40, 0),
    ('communication_center', 'COMMUNICATION_CENTER', 'NOTIFICATIONS', 'Notifications', '/communication/notifications', 'notifications', 50, 0),
    ('communication_center', 'COMMUNICATION_CENTER', 'COMMUNICATION_TEMPLATES', 'Templates', '/communication/templates', 'text_snippet', 60, 0),

    ('hr_management', NULL, 'HR_MANAGEMENT', 'HR Management', NULL, 'groups', 100, 1),
    ('hr_management', 'HR_MANAGEMENT', 'EMPLOYEES', 'Employees', '/hr/employees', 'people', 10, 0),
    ('hr_management', 'HR_MANAGEMENT', 'LEAVE', 'Leave', '/hr/leave', 'event_busy', 20, 0),
    ('hr_management', 'HR_MANAGEMENT', 'HR_ATTENDANCE', 'Attendance', '/hr/attendance', 'how_to_reg', 30, 0),
    ('hr_management', 'HR_MANAGEMENT', 'PERFORMANCE', 'Performance', '/hr/performance', 'trending_up', 40, 0),

    ('observations', NULL, 'OBSERVATIONS', 'Observations', NULL, 'visibility', 110, 1),
    ('observations', 'OBSERVATIONS', 'TEACHER_OBSERVATIONS', 'Teacher Observations', '/observations/teacher', 'visibility', 10, 0),
    ('observations', 'OBSERVATIONS', 'CLASSROOM_WALKTHROUGHS', 'Classroom Walkthroughs', '/observations/walkthroughs', 'checklist', 20, 0),
    ('observations', 'OBSERVATIONS', 'OBSERVATION_REPORTS', 'Reports', '/observations/reports', 'assessment', 30, 0),

    ('reports_analytics', NULL, 'REPORTS_ANALYTICS', 'Reports & Analytics', NULL, 'analytics', 120, 1),
    ('reports_analytics', 'REPORTS_ANALYTICS', 'EXECUTIVE_DASHBOARD', 'Executive Dashboard', '/reports/executive', 'dashboard', 10, 0),
    ('reports_analytics', 'REPORTS_ANALYTICS', 'CUSTOM_REPORTS', 'Custom Reports', '/reports/custom', 'tune', 20, 0),
    ('reports_analytics', 'REPORTS_ANALYTICS', 'EXPORT_CENTER', 'Export Center', '/reports/export', 'file_download', 30, 0),

    ('system_tools', NULL, 'SYSTEM_TOOLS', 'System & Tools', NULL, 'settings_applications', 130, 1),
    ('system_tools', 'SYSTEM_TOOLS', 'ORGANIZATION_PROFILE', 'Organization Profile', '/system/organization', 'account_balance', 10, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'BRANDING_THEME', 'Branding & Theme', '/system/branding', 'palette', 20, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'WORKFLOW_ENGINE', 'Workflow Engine', '/system/workflows', 'account_tree', 30, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'FORM_BUILDER', 'Form Builder', '/system/forms', 'dynamic_form', 40, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'DOCUMENT_MANAGEMENT', 'Document Management', '/system/documents', 'folder', 50, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'GLOBAL_SEARCH', 'Global Search', '/system/global-search', 'search', 60, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'ARCHIVE_CENTER', 'Archive Center', '/system/archive', 'archive', 70, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'AUDIT_LOGS', 'Audit Logs', '/system/audit-logs', 'history', 80, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'SYSTEM_HEALTH', 'System Health', '/system/health', 'health_and_safety', 90, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'BACKUPS', 'Backups', '/system/backups', 'backup', 100, 0),
    ('system_tools', 'SYSTEM_TOOLS', 'SYSTEM_SETTINGS', 'System Settings', '/system/settings', 'settings', 110, 0);

    MERGE dbo.Menus AS target
    USING (
        SELECT
            mod.ModuleId,
            s.ParentKey,
            s.MenuKey,
            s.MenuName,
            s.Route,
            s.Icon,
            s.SortOrder,
            s.IsCollapsible
        FROM @Menus s
        INNER JOIN dbo.Modules mod
            ON mod.ModuleKey = s.ModuleKey
    ) AS source
    ON target.MenuKey = source.MenuKey
    WHEN MATCHED THEN
        UPDATE SET
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
            WorkspaceId,
            ModuleId,
            ParentMenuId,
            MenuKey,
            MenuName,
            Route,
            Icon,
            PermissionId,
            FeatureFlagId,
            BadgeQueryKey,
            VisibilityStatusId,
            IsPinned,
            IsCollapsible,
            SortOrder,
            CreatedAt
        )
        VALUES
        (
            1,
            source.ModuleId,
            NULL,
            source.MenuKey,
            source.MenuName,
            source.Route,
            source.Icon,
            NULL,
            NULL,
            NULL,
            @EnabledStatusId,
            0,
            source.IsCollapsible,
            source.SortOrder,
            GETDATE()
        );

    ------------------------------------------------------------
    -- 6. RESTORE PARENT LINKS
    ------------------------------------------------------------
    UPDATE child
    SET child.ParentMenuId = parent.MenuId
    FROM dbo.Menus child
    INNER JOIN @Menus source
        ON source.MenuKey = child.MenuKey
    INNER JOIN dbo.Menus parent
        ON parent.MenuKey = source.ParentKey
    WHERE source.ParentKey IS NOT NULL;

    ------------------------------------------------------------
    -- 7. HIDE OLD DUPLICATE/LEGACY MENUS
    ------------------------------------------------------------
    UPDATE dbo.Menus
    SET
        VisibilityStatusId = 2,
        UpdatedAt = GETDATE()
    WHERE MenuKey IN (
        'DASHBOARD',
        'INVENTORY',
        'IT_ASSET_MANAGEMENT',
        'IT_HELP_DESK',
        'PLATFORM_REPORTS'
    );

    ------------------------------------------------------------
    -- 8. VERIFY
    ------------------------------------------------------------
    SELECT
        mod.SortOrder AS ModuleSort,
        mod.ModuleKey,
        mod.ModuleName,
        parent.MenuName AS ParentMenu,
        m.MenuKey,
        m.MenuName,
        m.Route,
        m.VisibilityStatusId,
        m.SortOrder
    FROM dbo.Menus m
    INNER JOIN dbo.Modules mod ON mod.ModuleId = m.ModuleId
    LEFT JOIN dbo.Menus parent ON parent.MenuId = m.ParentMenuId
    WHERE m.VisibilityStatusId = @EnabledStatusId
    ORDER BY
        mod.SortOrder,
        CASE WHEN m.ParentMenuId IS NULL THEN m.SortOrder ELSE parent.SortOrder END,
        parent.SortOrder,
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