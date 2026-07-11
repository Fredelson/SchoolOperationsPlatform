# Navigation Audit — 2026-07-11

## Live inventory

- Modules: 20 (15 with menu records, 5 without menus).
- Menu groups: 8.
- Menus: 166.
- Root menus not assigned to a group: 44.
- Duplicate route values: `/printing/requests` and `/printing/approvals`.
- Duplicate menu keys: none.
- Broken parent references: none.
- Visibility states: Enabled, Hidden, Disabled.
- Roles in the live schema: Teacher, Admin, PlatformAdmin, SuperAdmin.

## Conflicts found

- `platform_foundation`, `system_control`, `system_tools`, and `platform` overlap. Stable keys are preserved; only `platform_foundation` remains visible in navigation.
- `communication_center` and `communication` overlap. The latter stays hidden and inactive until migration is safe for dependent records.
- Group headings duplicate root menu headings (for example Platform Foundation → Platform Foundation and User & Access → User & Access).
- Child menus were directly linked to MenuGroups even though navigation is parent-driven.
- Hidden and Disabled menus were returned by the sidebar query; Hidden became “Soon” and Disabled could remain clickable.
- Generic module fallback landing pages exposed active modules without real menu routes.
- Many enabled database routes have no matching frontend route, particularly Reports, Communication, Facilities, ID Management, and future System tools.
- Printing contains duplicate legacy root records for Requests and Approvals alongside the canonical Printing Management tree.
- Database route `/system/audit-logs` does not match the implemented `/super-admin/audit-logs` route.
- Database route `/system/settings` does not match the implemented `/super-admin/settings` route.
- Assignment Types was attached as an independent group root instead of a User & Access child.
- Module Manager, System Health, and Audit Logs had direct MenuGroup links despite having parent roots.

## Orphaned modules

- inventory (inactive/hidden)
- it_service_desk (inactive/hidden)
- workflow_engine (hidden)
- communication (duplicate/hidden)
- system_control (overlapping platform module)

## Supported final sidebar

Only implemented routes are enabled. Existing future records are preserved as Hidden or Disabled.

- Dashboard
- Platform Foundation
  - Module Manager
  - Menu Manager
  - Navigation Manager
  - Button Manager
  - Widget Manager
  - Feature Flags
  - System Settings
  - Audit Logs
- User & Access
  - Users
  - Roles
  - Permissions
  - Permission Groups
  - Role Permissions
  - Access Levels
  - Assignment Types
  - User Assignments
  - User Permission Overrides
- School Configuration
  - Branding & Theme
- IT Operations
  - Dashboard
  - Asset Management
  - Asset Tag Printer
  - Assignments
  - Borrow & Return
  - Transfers
  - Issues
  - Maintenance
  - Disposals
  - Reports
- Printing Management
  - Dashboard
  - Print Queue
  - Paper Stock
  - Inventory Transactions
  - Purchases
  - Distributions
  - User Management
  - Master Data
  - Access Levels

## Visibility policy

- Enabled records must have an implemented frontend route.
- Hidden records are not returned by navigation.
- Disabled records are not returned by navigation.
- Platform Foundation and User & Access require effective permissions or an administrative role.
- Future modules remain in the database but are hidden.
- Generic module landing pages are removed from navigation and routing.

## Cleanup result

- Enabled grouped menus: 37.
- Enabled ungrouped menus: 0.
- Duplicate enabled routes: 0.
- Supported groups: Main, Platform Foundation, User & Access, School Configuration, IT Operations, Printing Management.
- Unsupported and overlapping modules/menus are preserved as Hidden.
- MenuGroupItems now contains only root-level enabled records; child-to-group duplication was removed.
- SuperAdmin and PlatformAdmin receive the complete administrative sidebar.
- PrintingAdmin receives Printing Management only.
- ITAdmin receives IT Operations only.
- Admin and Teacher receive no platform-administration sidebar.
- Effective user overrides can add or revoke individual permission-bound menu items.
