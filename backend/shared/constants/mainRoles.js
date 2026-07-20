const MAIN_ROLE_KEYS = Object.freeze([
  "SuperAdmin",
  "PlatformAdmin",
  "PrintingAdmin",
  "Admin",
  "Teacher",
]);

function isMainRole(roleKey) {
  const normalized = String(roleKey || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  return MAIN_ROLE_KEYS.some(
    (key) => key.toLowerCase() === normalized
  );
}

const SPECIALIZED_ROLE_MESSAGE =
  "This value is a specialized assignment, not a main role. Import the user with Admin or Teacher and configure the assignment separately in User Assignments.";

module.exports = { MAIN_ROLE_KEYS, isMainRole, SPECIALIZED_ROLE_MESSAGE };
