const { poolPromise } = require("../database/connection");
const authService = require("../modules/auth/services/authService");
const navigationService = require("../modules/navigation/services/navigationService");
const permissionService = require("../modules/permissionResolver/services/permissionResolverService");
const { authorizeRoles } = require("../middleware/authMiddleware");

function assert(value, message) {
  if (!value) throw new Error(message);
}

function runRoleGuard(guard, req) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
        return this;
      },
    };

    guard(req, res, (error) => {
      if (error) reject(error);
      else resolve({ status: 200 });
    });
  });
}

function collectRoutes(sidebar) {
  const routes = new Set();
  const collect = (items = []) => {
    for (const item of items) {
      if (item.path) routes.add(item.path);
      collect(item.children);
    }
  };

  for (const group of sidebar || []) collect(group.items);
  return routes;
}

async function main() {
  const pool = await poolPromise;

  try {
    const result = await pool.request().query(`
      SELECT
        u.UserId,
        u.EmployeeId,
        at.AssignmentKey,
        w.WorkspaceKey,
        w.DefaultRoute,
        p.PermissionKey AS LandingPermissionKey
      FROM dbo.Users u
      INNER JOIN dbo.UserAssignments ua
        ON ua.UserId = u.UserId
        AND ua.IsActive = 1
        AND ua.IsPrimary = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
      INNER JOIN dbo.AssignmentTypes at
        ON at.AssignmentTypeId = ua.AssignmentTypeId
        AND at.IsActive = 1
      INNER JOIN dbo.AssignmentTypeWorkspaces atw
        ON atw.AssignmentTypeId = ua.AssignmentTypeId
        AND atw.IsActive = 1
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = atw.WorkspaceId
        AND w.IsActive = 1
      LEFT JOIN dbo.Menus m
        ON m.Route = w.DefaultRoute
      LEFT JOIN dbo.Permissions p
        ON p.PermissionId = m.PermissionId
        AND p.IsActive = 1
      WHERE u.IsActive = 1
        AND ISNULL(u.IsDeleted, 0) = 0
      ORDER BY u.UserId;
    `);

    const users = result.recordset;
    assert(users.length > 0, "No active primary assignment users are available.");

    const checked = [];

    for (const row of users) {
      const [profile, permissions, sidebar] = await Promise.all([
        authService.getMe(row.UserId),
        permissionService.resolveUserPermissions(row.UserId),
        navigationService.getMySidebar({ id: row.UserId }),
      ]);
      const routes = collectRoutes(sidebar);

      assert(
        profile.defaultWorkspaceRoute === row.DefaultRoute,
        `${row.EmployeeId} resolved ${profile.defaultWorkspaceRoute} instead of ${row.DefaultRoute}.`
      );
      assert(
        profile.primaryAssignment?.assignmentKey === row.AssignmentKey,
        `${row.EmployeeId} did not return the expected primary assignment.`
      );
      assert(sidebar.length > 0, `${row.EmployeeId} received an empty sidebar.`);
      assert(
        routes.has(row.DefaultRoute),
        `${row.EmployeeId} sidebar does not include ${row.DefaultRoute}.`
      );

      if (row.LandingPermissionKey) {
        assert(
          permissions.allowedPermissionKeys.includes(row.LandingPermissionKey),
          `${row.EmployeeId} is missing ${row.LandingPermissionKey}.`
        );
      }

      checked.push({
        employeeId: row.EmployeeId,
        assignment: row.AssignmentKey,
        workspace: row.WorkspaceKey,
        landing: row.DefaultRoute,
        sidebarGroups: sidebar.length,
      });
    }

    const hodUser = users.find((user) => user.AssignmentKey === "HOD");
    if (hodUser) {
      const allowed = await runRoleGuard(authorizeRoles("HOD"), {
        user: { id: hodUser.UserId, role: "Admin", assignmentScopes: [] },
      });
      assert(
        allowed.status === 200,
        "Database-refreshed HOD compatibility authorization failed."
      );
    }

    console.log(
      JSON.stringify(
        {
          checkedUsers: checked.length,
          assignmentRouting: "passed",
          assignmentPermissions: "passed",
          assignmentSidebar: "passed",
          refreshedCompatibilityAuthorization: "passed",
          users: checked,
        },
        null,
        2
      )
    );
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
