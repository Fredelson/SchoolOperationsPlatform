const fs = require("fs");
const path = require("path");

require("dotenv").config();

const { poolPromise, sql } = require("../config/db");

async function main() {
  const migrationPath = path.resolve(
    __dirname,
    "../../scripts/004_Printing_Management_Workflow.sql"
  );
  const batches = fs
    .readFileSync(migrationPath, "utf8")
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    for (const batch of batches) {
      await new sql.Request(transaction).batch(batch);
    }
    await transaction.commit();
    console.log(
      `Applied printing workflow migration successfully (${batches.length} batches).`
    );
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the migration error.
    }
    throw error;
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("Printing workflow migration failed.");
  console.error(error);
  process.exit(1);
});
