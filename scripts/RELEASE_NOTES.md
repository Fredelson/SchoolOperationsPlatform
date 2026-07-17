# Arab Unity School Operations Platform — Final Release Package

## Deployment order

1. Back up `OperationsPlatformDB` and verify restoration.
2. Run `000_PreDeployment_Check.sql`.
3. Run `001_Final_Migration_DRY_RUN.sql` in SQLCMD mode from this directory and review every result set.
4. Run `002_Final_Migration.sql` normally.
5. Run `003_PostDeployment_Validation.sql`; deployment is accepted only when every validation is `PASS`.

## Database changes

- Finalizes five main roles and preserves compatibility roles.
- Configures five core, eight assignment, and four inactive legacy workspaces.
- Adds the Homeroom Teacher workspace and permission-linked dashboard resources.
- Configures `WorkspaceRoles`, `AssignmentTypeWorkspaces`, modules, menus, and sidebar assignments by stable key.
- Adds missing Secretary, Librarian, and Library Administrator assignment types only when absent.
- Migrates specialized-role users to supported main roles while preserving or creating their assignment history.
- Preserves users, historical assignments, scope versions, audit records, and business data.

## Backend files changed

- Main-role constants and lookup enforcement.
- Roles main-list repository/service/controller/route.
- User create/edit/import main-role validation.
- User assignment summaries.
- Assignment-aware compatibility authorization.
- Enriched login/current-user workspace, assignment, scope, and permission response.
- Integration verification scripts for roles, workspaces, authentication, scopes, navigation, and regressions.

## Frontend files changed

- User Management main-role selection, assignment summary, and Manage Assignments action.
- Auth context effective-permission state.
- Protected route resolved-workspace checks.
- Shared assignment workspace dashboard.
- Admin, Year Leader, Homeroom, Deputy Head, Operations, and Clinic platform-layout routes.

## Breaking changes

- User Management and imports accept only Super Admin, Platform Admin, Printing Admin, Admin, and Teacher as main roles.
- Specialized responsibilities must be configured through User Assignments.
- Legacy workspaces are inactive and excluded from normal runtime resolution.
- The dry run requires SQLCMD mode because it includes the exact production migration with rollback context.

## Migration summaries

- Users on HOD, HOS, Secretary, Librarian, and LibraryAdmin compatibility roles migrate to Admin plus the corresponding assignment.
- ITAdmin users migrate to PlatformAdmin.
- Existing compatible assignments are reused; duplicate active assignments and mappings are prevented.
- Scope history is retained in `UserAssignmentScopes`; no comma-separated scope storage is introduced.

## Manual testing checklist

- Add/edit/filter users and confirm exactly five roles.
- Preview/commit imports and confirm specialized values are rejected.
- Open Manage Assignments for a selected user.
- Test Admin and Teacher fallback workspaces.
- Test HOD, HOS, Year Leader, Homeroom, Library, Deputy Head, Operations, and Clinic primary assignments.
- Confirm additional assignments contribute scopes without duplicating sidebar entries.
- Confirm direct access to unrelated workspaces is denied.
- Verify sidebar active state, nested navigation, buttons, widgets, dashboards, and permissions.
- Regression-test Printing, IT Assets, Observations, Library, login, logout, and password change.

## Rollback instructions

- Preferred rollback: restore the verified pre-deployment database backup.
- Do not delete migrated assignments or scopes manually; they contain historical data.
- If application rollback is required without database restoration, deploy the previous backend/frontend release while retaining the additive schema and mappings, then investigate using audit history.
- The dry-run script always rolls back and requires no cleanup.

## Known limitations

- Vite reports a non-blocking main-bundle size warning; route-level code splitting is a future performance optimization.
- Workspace presentation alone never grants authorization. Active assignments contribute their landing permission and matching compatibility-role permissions; explicit user overrides remain final.
