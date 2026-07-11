# Current Architecture

The platform currently has two related but separate menu systems:

1. **Menu administration** uses `backend/modules/menus` and the frontend Super Admin Menu Manager to create, edit, show, hide, and delete rows in `dbo.Menus`.
2. **Runtime navigation** uses `backend/modules/navigation` and `PlatformSidebar` to load grouped menu rows from SQL Server and convert them into a recursive sidebar tree for the authenticated user.

The database is the runtime source for sidebar labels, stored routes, icon keys, hierarchy, group placement, and ordering. However, React route registration remains static in frontend route configuration. Creating a menu row therefore creates a navigation link but does not create a routable React page.

The runtime sidebar pipeline is authenticated but is not currently permission-filtered, feature-flag-filtered, workspace-filtered, or visibility-filtered at query level.

## Backend Structure

### Repository

#### Menu Manager repository

File: `backend/modules/menus/repositories/menuRepository.js`

Responsibilities:

- Reads menu records with joined descriptive metadata.
- Supports full-list and paginated reads.
- Supports search and filters.
- Creates, updates, changes visibility, and deletes menu rows.
- Resolves a visibility status ID from its status key.

The base menu query reads:

- `dbo.Menus`
- `dbo.Modules`
- `dbo.FeatureVisibilityStatuses`
- `dbo.Workspaces`
- `dbo.Menus` again for parent metadata
- `dbo.Permissions`
- `dbo.FeatureFlags`

The Manager list is ordered by:

1. `Workspaces.SortOrder`
2. `Modules.SortOrder`
3. `Menus.SortOrder`
4. `Menus.MenuName`

The paginated query caps `pageSize` at 100. Search covers menu key, name, route, badge key, module, workspace, permission key, and feature key. Repository filters support `moduleId`, `workspaceId`, `parentMenuId`, and `visibilityStatusKey`.

Create and update operations write menu metadata directly to `dbo.Menus`. Delete is a physical `DELETE`, not a soft delete.

#### Navigation repository

File: `backend/modules/navigation/repositories/navigationRepository.js`

`getSidebarMenusForUser(userId)` loads the runtime sidebar. It reads:

- `dbo.Menus`
- `dbo.MenuGroupItems`
- `dbo.MenuGroups`
- `dbo.FeatureVisibilityStatuses`
- `dbo.UserMenuPreferences`

Root menus are connected to sections through `MenuGroupItems`. Child menus are included through `ParentMenuId` and are deliberately not required to have their own group assignment.

The query excludes user-hidden items through `ISNULL(ump.IsHidden, 0) = 0`. It excludes ungrouped root menus but includes any child menu whose `ParentMenuId` is non-null.

Runtime SQL ordering is:

1. `MenuGroups.SortOrder`, with null groups treated as 999
2. `UserMenuPreferences.SortOrder`, falling back to `Menus.SortOrder`
3. `Menus.ParentMenuId`
4. `Menus.SortOrder`
5. `Menus.MenuName`

Important current behavior:

- `MenuGroupItems.SortOrder` is stored but not used by this query.
- Menu visibility status is selected but not used in a `WHERE` condition.
- Menu group visibility status is not joined or enforced.
- Menu permissions are not joined or enforced.
- Role permissions and user permission overrides are not queried.
- Feature flags are not joined or enforced.
- Workspace is not filtered.
- Module visibility and active state are not enforced.
- `Menus.IsPinned`, `Menus.IsCollapsible`, and `BadgeQueryKey` are not selected for runtime rendering.

### Service

#### Menu Manager service

File: `backend/modules/menus/services/menuService.js`

Responsibilities:

- Normalizes menu keys to lowercase underscore format.
- Converts optional IDs to nullable numbers.
- Chooses paginated or full-list repository reads.
- Maps SQL PascalCase rows to camelCase API objects.
- Prevents duplicate menu keys during creation.
- Resolves visibility status keys to database IDs.
- Prevents a menu from being its own direct parent.
- Protects a small hardcoded set of normalized keys from hide/delete:
  - `dashboard`
  - `module_manager`
  - `menu_manager`
  - `system_settings`
- Implements show, hide, create, update, read, and delete behavior.

The service does not validate that referenced workspace, module, parent, permission, or feature-flag records are semantically compatible. Foreign keys provide basic referential integrity where defined.

The service prevents only direct self-parenting. It does not detect longer cycles such as A → B → A or deeper circular parent chains.

#### Navigation service

File: `backend/modules/navigation/services/navigationService.js`

Responsibilities:

- Extracts the authenticated user ID from several possible claim shapes.
- Calls the runtime navigation repository.
- Creates section buckets from grouped root menus.
- Finds all descendants belonging to each root group.
- Converts flat menu rows into recursive nodes.
- Removes empty `children` arrays.
- Sorts sections by group sort order.

Runtime menu nodes contain:

- `id`
- `key`
- `label`
- `path`
- `iconKey`
- `comingSoon`
- `backendReady`
- optional `children`

`comingSoon` is true only when the visibility status key equals `hidden`. `backendReady` is true only when the key equals `enabled`. The frontend currently uses `comingSoon` but does not use `backendReady`.

Tree construction uses two passes: first creating a `Map` of menu ID to node, then attaching nodes to parents. A child whose parent is absent is not promoted to a root and can disappear from the returned tree.

### Controller

#### Menu Manager controller

File: `backend/modules/menus/controllers/menuController.js`

Thin HTTP handlers call the menu service and return `{ success, message, data }`. Errors are passed to the shared error middleware with `next(error)`.

#### Navigation controller

File: `backend/modules/navigation/controllers/navigationController.js`

Uses shared `asyncHandler` and `sendSuccess`. It passes `req.user` to `getMySidebar` and returns the resulting sidebar sections.

### Routes

#### Menu Manager routes

File: `backend/modules/menus/routes/menuRoutes.js`

Registered centrally as `/api/menus` by `backend/routes/index.js`.

The route file itself does not apply authentication, role authorization, or a menu-management permission middleware. Unless protection is applied outside the inspected router chain, the CRUD endpoints are not protected at this module boundary.

#### Navigation routes

File: `backend/modules/navigation/routes/navigationRoutes.js`

Registered centrally as `/api/navigation`. The router applies `protect` to all navigation endpoints. It does not apply an additional permission requirement.

### Validation

File: `backend/modules/menus/validators/menuValidator.js`

Create validation requires:

- `moduleId`
- `menuKey`
- `menuName`

It checks numeric `moduleId` and `sortOrder`, plus maximum lengths for key, name, and visibility key.

Update validation requires `menuName`, even though the service otherwise supports several partial-update fallbacks. It validates optional `moduleId`, visibility-key length, and sort order.

ID validation converts `:id` to a positive/truthy number.

Missing validation includes:

- Route format and route length.
- Icon-key format and availability.
- Badge-query-key format and length.
- Numeric validation for all optional foreign keys.
- Boolean validation.
- Parent existence and same-module/workspace rules at the backend.
- Full parent-cycle detection.
- Parent/child visibility consistency.
- Route uniqueness or route-to-frontend-route verification.
- Permission/module compatibility.

## Frontend Structure

### Components

#### Menu Manager

Primary files:

- `frontend/src/modules/super-admin/menus/pages/MenuManager.jsx`
- `frontend/src/modules/super-admin/menus/dialogs/MenuFormDialog.jsx`
- `frontend/src/modules/super-admin/menus/columns/menuColumns.jsx`
- `frontend/src/modules/super-admin/menus/cards/MenuKpiCards.jsx`

`MenuManager` renders the page title, KPI cards, search and visibility controls, Add Menu action, data table, create/edit dialog, and delete confirmation dialog.

The table displays menu name, key, module, route, parent, visibility, sort order, and row actions. Actions include Edit, Show/Hide, and Delete.

`MenuFormDialog` uses shared SQL-backed lookups for workspaces, modules, menus, permissions, feature flags, and visibility statuses. Parent options are filtered client-side to the selected module and exclude the current menu. The form exposes route, icon key, badge query key, sort order, pinned, and collapsible metadata.

The dialog contains a development `console.log("CREATE MENU BUTTON CLICKED")` in its submit handler.

#### Dynamic Sidebar

Primary files:

- `frontend/src/platform/layout/PlatformSidebar.jsx`
- `frontend/src/platform/navigation/sidebar/components/PlatformSidebarTree.jsx`
- `PlatformSidebarSection.jsx`
- `PlatformSidebarItem.jsx`
- `PlatformSidebarBadge.jsx`

`PlatformSidebar` owns runtime sidebar loading, loading/error/empty states, and retry behavior. It renders `PlatformSidebarTree` after loading.

`PlatformSidebarTree` gets the current pathname and recursively renders sections and items. `PlatformSidebarItem` supports:

- Nested collapsible items.
- Active-route styling.
- Recursive indentation.
- Icon-key resolution.
- A `Soon` badge for hidden menus.
- Disabled navigation for `comingSoon` leaf nodes.
- Mobile drawer closure through `onNavigate`.

Parent nodes with children act only as expand/collapse controls. If a parent also has a route, that route is not navigated by the current renderer.

`PlatformSidebarBadge` supports a supplied label, but the current runtime item always uses `Soon`; stored `BadgeQueryKey` data is not loaded or rendered.

#### Legacy sidebar

`frontend/src/components/sidebar/Sidebar.jsx` is a separate role-based shared sidebar used by legacy dashboard pages. Its item provider, `getSidebarItemsByRole`, currently returns an empty array. Static configurations and legacy backups also remain in the repository.

This means the codebase contains both the active backend-driven `PlatformSidebar` path and older static/role-based sidebar artifacts.

### Hooks

#### `useMenuManager`

File: `frontend/src/modules/super-admin/menus/hooks/useMenuManager.js`

Owns menu rows, filters, pagination, loading/saving state, form state, notifications, CRUD actions, and visibility actions. It normalizes form values into SQL-friendly payloads and accommodates multiple possible API response shapes.

Current query parameters are `page`, `pageSize`, `search`, `status`, and `visibility`. The backend Menu service expects `visibilityStatusKey`, not `visibility`, and does not use `status`. Therefore the Manager's visibility filter is not connected to the backend filter contract.

The hook conditionally checks for `menuApi.getKpis`, but `menuApi` does not define that method. KPI loading therefore exits without a request, leaving KPI data empty/default.

#### `useSidebarState`

File: `frontend/src/platform/navigation/sidebar/hooks/useSidebarState.js`

Tracks open/closed nested menus. Whenever sections or pathname change, it opens ancestor menus containing the active route while preserving existing open-state values.

#### Sidebar helpers

File: `frontend/src/platform/navigation/sidebar/utils/sidebarHelpers.js`

Responsibilities:

- Derives an item key from `path` or `label`.
- Detects active descendants recursively.
- Marks a route active on exact match or pathname-prefix match.
- Builds initial open state for active parent chains.

Using path/label rather than the database menu ID/key can produce React/state-key collisions when labels or paths are duplicated or null.

### Services

#### Menu API

File: `frontend/src/modules/super-admin/menus/api/menuApi.js`

Calls `/menus` using the shared Axios client. It exposes get-all, get-by-ID, create, update, show, hide, and remove methods.

#### Sidebar service

File: `frontend/src/platform/navigation/sidebar/services/sidebarService.js`

Calls `GET /navigation/sidebar` and unwraps `response.data.data` or `response.data.sections`.

#### Lookup service

File: `frontend/src/platform/lookups/lookupApi.js`

The Menu form indirectly calls:

- `/lookups/workspaces`
- `/lookups/modules`
- `/lookups/menus`
- `/lookups/permissions`
- `/lookups/feature-flags`
- `/lookups/visibility-statuses`

The shared Axios client defaults to `http://localhost:5000/api` and attaches the JWT token from local storage.

### Layout

#### `PlatformLayout`

File: `frontend/src/platform/layout/PlatformLayout.jsx`

Provides a fixed topbar, fixed desktop sidebar, responsive mobile drawer, and an `<Outlet />` content region. Desktop sidebar width is 340px, mobile width is 300px, and topbar height is 78px.

The layout does not own navigation data; `PlatformSidebar` fetches it independently each time the sidebar component mounts. Desktop and mobile versions are conditionally rendered, so only one fetches at a time.

#### `PlatformTopbar`

File: `frontend/src/platform/layout/PlatformTopbar.jsx`

Uses authentication and branding contexts. Its title/subtitle are selected from a hardcoded role switch, not from route or menu metadata. Search, notification, mail, settings, help, and user-chevron controls are visual only in the inspected implementation. Badge counts are hardcoded.

The topbar has no direct role in dynamic menu loading, permission filtering, route generation, or sidebar state beyond opening the mobile drawer.

## Database Tables

### Directly used by Menu Manager

| Table | Purpose |
|---|---|
| `Menus` | Core menu definition: module, workspace, parent, key, name, stored route, icon key, permission, feature flag, badge key, visibility, pinned/collapsible flags, and sort order. |
| `Modules` | Required module ownership and Manager display/filter metadata. |
| `Workspaces` | Optional menu workspace and Manager ordering/display metadata. |
| `Permissions` | Optional menu permission metadata shown and editable in Menu Manager. |
| `FeatureFlags` | Optional feature-flag metadata shown and editable in Menu Manager. |
| `FeatureVisibilityStatuses` | Required menu visibility status and show/hide resolution. |
| `Menus` self-reference | Parent menu name/key and hierarchical relationship. |

### Directly used by runtime navigation

| Table | Purpose |
|---|---|
| `Menus` | Runtime labels, routes, icons, parent IDs, visibility status IDs, and menu sort order. |
| `MenuGroupItems` | Assigns root menus to sidebar groups. |
| `MenuGroups` | Supplies section key, name, and group sort order. |
| `FeatureVisibilityStatuses` | Supplies status key/name used to derive `comingSoon` and `backendReady`. |
| `UserMenuPreferences` | Hides or reorders menus per authenticated user. |

### Stored but not effectively enforced by runtime navigation

| Table/field | Current state |
|---|---|
| `Permissions`, `Menus.PermissionId` | Managed by Menu Manager but not read by navigation query. |
| Role permission tables | Not consulted by navigation. |
| User permission override tables | Not consulted by navigation. |
| `FeatureFlags`, `Menus.FeatureFlagId` | Managed but not read/enforced by navigation. |
| `Modules` visibility/active fields | Not read/enforced by navigation. |
| `Workspaces` | Menu workspace exists but runtime sidebar is not scoped by workspace. |
| `MenuGroups.VisibilityStatusId` | Stored but not enforced by navigation. |
| `MenuGroupItems.SortOrder` | Stored but ignored in runtime ordering. |
| `Menus.BadgeQueryKey` | Stored but not returned/rendered. |
| `Menus.IsPinned` | Stored but not returned/rendered. |
| `Menus.IsCollapsible` | Stored but not returned/enforced; nodes collapse based only on whether children exist. |
| `UserMenuPreferences.IsPinned` | Stored but not selected or rendered. |

Foreign keys exist from menus to modules, parent menus, permissions, feature flags, visibility statuses, and workspaces. Group items reference menu groups and menus. User preferences reference users, workspaces, and menus. Unique constraints exist for menu-group item pairs and user-menu preferences. The inspected schema does not show a database constraint preventing recursive hierarchy cycles.

## Current API Endpoints

All paths below are relative to the shared `/api` base.

### Menu Manager

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/menus` | List menus; supports pagination and repository-supported filters. |
| `GET` | `/menus/:id` | Load one menu. |
| `POST` | `/menus` | Create a menu. |
| `PUT` | `/menus/:id` | Update a menu. |
| `PUT` | `/menus/:id/show` | Set visibility to Enabled. |
| `PUT` | `/menus/:id/hide` | Set visibility to Hidden. |
| `DELETE` | `/menus/:id` | Physically delete a menu. |

### Runtime navigation

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/navigation/sidebar` | Return authenticated user's grouped recursive sidebar. |

### Menu form lookups

| Method | Endpoint |
|---|---|
| `GET` | `/lookups/workspaces` |
| `GET` | `/lookups/modules` |
| `GET` | `/lookups/menus` |
| `GET` | `/lookups/permissions` |
| `GET` | `/lookups/feature-flags` |
| `GET` | `/lookups/visibility-statuses` |

No Menu Manager KPI endpoint is defined in the inspected `menuApi` or menu router.

## Menu Loading Flow

### Menu Manager loading

1. The static React route `/super-admin/menus` renders `MenuManager` inside `PlatformLayout`.
2. `useMenuManager` builds pagination/search/filter query parameters.
3. `menuApi.getAll()` calls `GET /api/menus`.
4. `menuController.getMenus` passes query parameters to `menuService.getMenus`.
5. The service normalizes supported filters and chooses paginated or full-list repository access.
6. The repository joins descriptive menu metadata and orders the rows.
7. `menuMapper` converts SQL rows to camelCase.
8. The controller wraps the result.
9. The hook unwraps multiple possible response shapes and updates the data table.

### Runtime sidebar loading

1. A route using `PlatformLayout` mounts `PlatformSidebar`.
2. `PlatformSidebar` calls `getMySidebar()` in an effect.
3. The sidebar service sends authenticated `GET /api/navigation/sidebar`.
4. `protect` populates `req.user`.
5. The navigation controller calls `navigationService.getMySidebar(req.user)`.
6. The service extracts a user ID.
7. The navigation repository loads all grouped roots and all child rows, excluding only user-hidden preferences and ungrouped roots.
8. The service creates section buckets from roots.
9. It walks parent chains to associate descendants with each root group.
10. It builds recursive nodes and removes empty child arrays.
11. The controller returns sections.
12. `PlatformSidebar` stores and renders the sections.

There is no client cache, shared navigation context, refresh event after Menu Manager mutations, or explicit cache invalidation. A changed menu becomes visible when the sidebar is remounted or manually reloaded through an error retry; the normal successful UI has no refresh control.

## Sidebar Rendering Flow

1. `PlatformSidebarTree` receives sections and reads the current pathname.
2. `useSidebarState` recursively opens ancestors of the active path.
3. Each section renders a heading through `PlatformSidebarSection`.
4. Each root item renders through `PlatformSidebarItem`.
5. Items with children become toggle buttons and recursively render descendants in a Material UI `Collapse`.
6. Leaf items become `NavLink` elements unless marked `comingSoon`.
7. Active state uses exact or prefix path matching.
8. Icons are resolved by lowercasing the database icon string and looking it up in a fixed frontend map.
9. Unknown child icons fall back to a dot; unknown root icons render no icon.
10. Hidden-status items are disabled and labeled `Soon`; they are not removed.

The icon resolver currently recognizes a limited fixed set such as `dashboard`, `devices`, `build`, `people`, `print`, `shield`, and similar keys. Menu Manager accepts arbitrary icon text and does not validate it against this registry.

## Permission Flow

### Stored design

`Menus.PermissionId` can reference `Permissions.PermissionId`. Menu Manager displays and edits the permission through SQL-backed lookup data. The Menu Manager list joins and returns permission key/name metadata.

### Runtime behavior

The current dynamic navigation repository does not select `PermissionId`, does not join `Permissions`, and does not join any role/user permission-resolution tables. Consequently:

- A menu with no permission and a menu with a permission are treated identically by runtime navigation.
- `GET /navigation/sidebar` is authenticated, but menu contents are not authorization-filtered.
- User-specific behavior is limited to `UserMenuPreferences.IsHidden` and user sort order.
- A visible sidebar link does not guarantee authorization to its target endpoint.
- Conversely, database permission assignment does not hide the link from unauthorized users.

The frontend dynamic sidebar does not apply `PermissionContext`, `PermissionGate`, `MenuGate`, or `sidebarPermissionFilter`. Any route protection that exists is independent and static in React route configuration or backend endpoint middleware.

## Current Limitations

1. **Runtime permission filtering is absent.** Stored menu permissions have no effect on the dynamic sidebar.
2. **Visibility is not filtering.** Hidden menus are returned and rendered as disabled “Soon” items. Disabled or other visibility states are not consistently interpreted.
3. **Feature flags are administrative metadata only.** They are not enforced in runtime navigation.
4. **Workspace scoping is absent.** Workspace IDs exist, but the sidebar query does not select/filter a current workspace.
5. **Menu group visibility is ignored.** Hidden groups can still produce sections.
6. **Module activity/visibility is ignored.** Menus can load from inactive or hidden modules.
7. **Routes are literal links, not generated application routes.** The database does not register React elements.
8. **Manager visibility filter contract is mismatched.** Frontend sends `visibility`; backend expects `visibilityStatusKey`.
9. **Manager KPI implementation is incomplete.** The hook supports an optional KPI method that the API does not define.
10. **Menu CRUD route protection is not visible at the module boundary.** The inspected router has no auth or Super Admin permission middleware.
11. **Hierarchy validation is incomplete.** Only direct self-parenting is blocked; longer cycles and invalid cross-scope parenting are possible.
12. **Physical deletes can be disruptive.** Deleting parents or referenced menus depends on foreign-key behavior and can fail or remove navigation definitions without archival history.
13. **Group assignment is not part of Menu Manager.** A newly created root menu will not appear in runtime navigation until separately inserted into `MenuGroupItems`.
14. **Group-item sort order is ignored.** Runtime root ordering uses menu/user ordering, not `MenuGroupItems.SortOrder`.
15. **Pinned/collapsible/badge metadata is unused.** The Manager writes values that the runtime pipeline does not consume.
16. **Unknown icons silently degrade.** Root items lose the icon; children fall back to a dot.
17. **Parent routes are unusable when children exist.** Clicking the parent toggles the tree instead of navigating.
18. **Sidebar keys can collide.** React/open-state keys use path or label rather than stable menu ID/key.
19. **No live synchronization.** Menu changes do not automatically refresh an already-mounted sidebar.
20. **Topbar navigation context is static.** Titles are role-based rather than route/menu-aware, and search/actions are not wired.
21. **Duplicate architecture remains.** Backend-driven platform navigation coexists with legacy static/role-based sidebar files and a current fallback that returns no items.
22. **Potential orphan handling is silent.** Children with missing parents can be selected by SQL but disappear during tree construction.
23. **No route validation.** Menu Manager cannot confirm that a stored route exists in `App.jsx` or nested layout route arrays.
24. **No icon catalog endpoint or shared registry contract.** Database values and frontend resolver can drift.

## What is Missing

- Permission-aware navigation query using the platform's effective permission resolver, including role permissions and user overrides.
- Explicit rules for Super Admin bypass behavior.
- Feature-flag enforcement in runtime navigation.
- Menu, group, module, and workspace visibility enforcement.
- Active workspace selection/scoping in the navigation request and query.
- Menu group and group-item administration in the current Menu Manager.
- Runtime use of `MenuGroupItems.SortOrder`.
- Runtime use of pinned, collapsible, and badge-query metadata.
- A badge-data resolver for `BadgeQueryKey`.
- Full hierarchy integrity validation and cycle detection.
- Backend validation that parent and child belong to compatible module/workspace scopes.
- Protected Menu Manager routes at the router boundary.
- A consistent frontend/backend visibility-filter parameter.
- Menu KPI API or removal of the unused KPI contract.
- A shared icon-key catalog used by both the form and renderer.
- A route registry validation mechanism.
- Navigation cache/refresh/invalidation behavior after Manager mutations.
- An intentional policy for hidden versus disabled versus coming-soon states.
- An intentional policy for parent items that have both a route and children.
- Audit logging for menu create/update/show/hide/delete operations.
- Safe delete dependency reporting or archival/soft-delete behavior.
- Automated tests covering permission filtering, visibility, feature flags, hierarchy, sorting, and user preferences.

## Recommendations

The following are recommendations only; no implementation changes were made during this review.

1. **Define one authoritative runtime eligibility rule.** A menu should be returned only when its menu, ancestors, module, group, workspace, feature flag, and effective permission all allow access.
2. **Reuse the effective permission resolver in navigation.** Avoid duplicating role/override logic in the frontend. Return only authorized nodes, while preserving parents needed to reach authorized descendants.
3. **Protect Menu Manager endpoints explicitly.** Apply authentication plus a specific menu-management/Super Admin permission at the menu router boundary.
4. **Separate visibility semantics.** Define Enabled, Hidden, Disabled, and Coming Soon explicitly instead of treating Hidden as Coming Soon.
5. **Add group administration to the same workflow.** Root menu creation should include section assignment and group-item ordering, or clearly direct administrators to a separate manager.
6. **Align sorting rules.** Decide precedence among group sort, group-item sort, menu sort, and user override sort, then use it consistently.
7. **Validate the entire hierarchy.** Prevent cycles, cross-module/workspace parents when invalid, orphaned children, and destructive parent deletion.
8. **Align API contracts.** Use `visibilityStatusKey` consistently and either implement or remove the KPI request contract.
9. **Create a shared icon catalog contract.** Expose supported keys to Menu Manager or centralize icon metadata so arbitrary invalid values cannot be saved unnoticed.
10. **Treat database routes as references to registered routes.** Validate stored paths against a maintained frontend route registry; do not imply that a menu record creates a page.
11. **Use stable IDs for rendering state.** Return and use menu ID or menu key for React keys and expansion state.
12. **Consume or remove unused metadata.** `IsPinned`, `IsCollapsible`, `BadgeQueryKey`, and associated preference fields should have defined runtime behavior.
13. **Add sidebar refresh/invalidation.** Successful Manager mutations should be able to refresh the active navigation without a remount.
14. **Make topbar context route-aware.** Derive current page title/breadcrumb/search scope from route or navigation metadata if the topbar is intended to participate in navigation.
15. **Retire or clearly isolate legacy sidebar paths.** This reduces ambiguity about which navigation system is authoritative for each role/layout.
16. **Add auditability and tests before expanding dynamic behavior.** Menu administration affects access discoverability and should be logged and covered by integration tests.

---

This report is based on the current repository implementation and SQL schema inspected for `modules/menus`, `modules/navigation`, the Super Admin Menu Manager, platform navigation/sidebar files, layout/topbar components, shared lookup/API infrastructure, and the relevant database definitions. No application code was modified.
