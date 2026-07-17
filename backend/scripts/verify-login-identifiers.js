const { poolPromise } = require("../database/connection");
const authRepository = require("../modules/auth/repositories/authRepository");

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function main() {
  const pool = await poolPromise;

  try {
    const result = await pool.request().query(`
      SELECT
        u.UserId,
        u.EmployeeId,
        u.SchoolEmail,
        u.PersonalEmail
      FROM dbo.Users u
      INNER JOIN dbo.Roles r
        ON r.RoleId = u.RoleId
        AND r.IsActive = 1
      WHERE u.IsActive = 1
        AND ISNULL(u.IsDeleted, 0) = 0
      ORDER BY u.UserId;
    `);

    const users = result.recordset;
    assert(users.length > 0, "No active users are available.");

    let checkedIdentifiers = 0;
    let checkedPersonalEmails = 0;

    for (const row of users) {
      const identifiers = [
        ["EmployeeId", row.EmployeeId],
        ["SchoolEmail", row.SchoolEmail],
        ["PersonalEmail", row.PersonalEmail],
      ].filter(([, value]) => value && String(value).trim());

      for (const [kind, value] of identifiers) {
        const matched = await authRepository.findActiveUserByIdentifier(
          String(value).trim()
        );

        assert(
          matched?.UserId === row.UserId,
          `${row.EmployeeId} was not resolved by ${kind}.`
        );
        checkedIdentifiers += 1;
        if (kind === "PersonalEmail") checkedPersonalEmails += 1;
      }
    }

    console.log(
      JSON.stringify(
        {
          checkedUsers: users.length,
          checkedIdentifiers,
          checkedPersonalEmails,
          loginIdentifierResolution: "passed",
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
