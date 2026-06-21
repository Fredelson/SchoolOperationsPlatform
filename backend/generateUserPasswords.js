const bcrypt = require("bcryptjs");

async function generateHash() {
  const hash = await bcrypt.hash("A0297", 10);

  console.log(`
INSERT INTO Users
(
    FullName,
    EmployeeId,
    SchoolEmail,
    PasswordHash,
    Role,
    DepartmentId,
    IsActive,
    MustChangePassword
)
VALUES
(
    'Fredelson',
    'A0297',
    'fredelson@arabunityschool.ae',
    '${hash}',
    'PrintingAdmin',
    7,
    1,
    1
);
`);
}

generateHash();