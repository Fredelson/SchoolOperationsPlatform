if (process.argv[2]) process.env.DB_PORT = process.argv[2];
const assignmentService = require("../modules/assignments/services/assignmentService");
const assignmentRepository = require("../modules/assignments/repositories/assignmentRepository");
const permissionRepository = require("../modules/permissionResolver/repositories/permissionResolverRepository");
const authRepository = require("../modules/auth/repositories/authRepository");
const navigationService = require("../modules/navigation/services/navigationService");
const { poolPromise } = require("../config/db");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const pool = await poolPromise;
  let assignmentId = null;
  let userId = null;
  let originalPrimaryIds = [];
  try {
    const fixture = await pool.request().query(`
      SELECT TOP 1 u.UserId FROM dbo.Users u WHERE u.IsActive=1 AND u.IsDeleted=0
        AND NOT EXISTS(SELECT 1 FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND at.AssignmentKey='YEAR_LEADER') ORDER BY u.UserId;
      SELECT TOP 1 AssignmentTypeId FROM dbo.AssignmentTypes WHERE AssignmentKey='YEAR_LEADER' AND IsActive=1;
      SELECT TOP 1 AcademicYearId FROM dbo.AcademicYears WHERE IsActive=1 ORDER BY AcademicYearId DESC;
      SELECT TOP 2 YearLevelId FROM dbo.YearLevels WHERE IsActive=1 ORDER BY YearLevelId;
    `);
    userId = fixture.recordsets[0][0]?.UserId;
    const assignmentTypeId = fixture.recordsets[1][0]?.AssignmentTypeId;
    const academicYearId = fixture.recordsets[2][0]?.AcademicYearId;
    const years = fixture.recordsets[3].map((x) => x.YearLevelId);
    assert(userId && assignmentTypeId && academicYearId && years.length === 2, "Required test fixtures are missing.");
    const primaries = await pool.request().input("UserId", userId).query("SELECT UserAssignmentId FROM dbo.UserAssignments WHERE UserId=@UserId AND IsPrimary=1;");
    originalPrimaryIds = primaries.recordset.map((x) => x.UserAssignmentId);

    const payload = { assignmentTypeId, academicYearId, isPrimary: true, scopes: years.map((id) => ({ scopeType: "YearGroup", scopeEntityId: id })) };
    assignmentId = (await assignmentService.createUserAssignment(userId, payload, { id: userId })).userAssignmentId;
    let current = await assignmentRepository.getScopes(assignmentId);
    assert(current.length === 2 && current.every((x) => x.ScopeVersion === 1), "Two version-one scopes were not created.");

    let duplicateRejected = false;
    try { await assignmentService.updateUserAssignment(userId, assignmentId, { ...payload, scopes: [payload.scopes[0], payload.scopes[0]] }); }
    catch (error) { duplicateRejected = error.statusCode === 409 || error.status === 409 || error.name === "ConflictError"; }
    assert(duplicateRejected, "Duplicate scope validation did not reject the request.");

    await assignmentService.updateUserAssignment(userId, assignmentId, { ...payload, scopes: [payload.scopes[1]] });
    current = await assignmentRepository.getScopes(assignmentId);
    let history = await assignmentRepository.getScopeHistory(assignmentId);
    assert(current.length === 1 && current[0].ScopeVersion === 2, "Edit did not create the latest scope version.");
    assert(history.length === 3 && history.filter((x) => x.ScopeVersion === 1).length === 2, "Scope history was not preserved.");

    const profile = await authRepository.findActiveUserById(userId);
    assert(profile.DefaultWorkspaceRoute === "/year-leader/dashboard", `Workspace resolved ${profile.DefaultWorkspaceRoute} instead of /year-leader/dashboard for user ${userId}.`);
    const permissionScopes = await permissionRepository.getActiveAssignmentScopes(userId);
    assert(permissionScopes.some((x) => x.UserAssignmentId === assignmentId && x.ScopeEntityId === years[1]), "Permission resolver did not receive the active Year Group scope.");
    const sidebar = await navigationService.getMySidebar({ UserId: userId });
    assert(Array.isArray(sidebar), "Sidebar resolution failed for the primary assignment.");

    await assignmentService.deleteUserAssignment(userId, assignmentId);
    current = await assignmentRepository.getScopes(assignmentId);
    assert(current.length === 1 && !current[0].IsActive, "Deactivation did not retain the latest scope for history.");
    await assignmentService.activateUserAssignment(userId, assignmentId);
    history = await assignmentRepository.getScopeHistory(assignmentId);
    assert(history.filter((x) => x.IsActive).length === 1 && history.find((x) => x.IsActive).ScopeVersion === 2, "Reactivation revived obsolete scope versions.");

    console.log(JSON.stringify({ assignmentId, singleAndMultiScope: "passed", duplicateValidation: "passed", history: "passed", loginRedirect: profile.DefaultWorkspaceRoute, sidebarGroups: sidebar.length, resolverScopes: permissionScopes.length, reactivation: "passed" }, null, 2));
  } finally {
    if (assignmentId) {
      const tx = pool.transaction(); await tx.begin();
      try {
        await tx.request().input("Id", assignmentId).query("DELETE dbo.UserAssignmentScopes WHERE UserAssignmentId=@Id; DELETE dbo.UserAssignments WHERE UserAssignmentId=@Id;");
        await tx.request().input("UserId", userId).query("UPDATE dbo.UserAssignments SET IsPrimary=0 WHERE UserId=@UserId;");
        for (const id of originalPrimaryIds) await tx.request().input("Id", id).query("UPDATE dbo.UserAssignments SET IsPrimary=1 WHERE UserAssignmentId=@Id;");
        await tx.commit();
      } catch (error) { await tx.rollback(); throw error; }
    }
    await pool.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
