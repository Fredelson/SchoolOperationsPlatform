const repository = require("../repositories/printingOperationsRepository");
const requestRepository = require("../repositories/printingRequestRepository");
const accessService = require("./printingAccessService");
const settingsService = require("./printingSettingsService");

const error = (message, statusCode = 400, details = null) => {
  const serviceError = new Error(message);
  serviceError.statusCode = statusCode;
  if (details) serviceError.details = details;
  return serviceError;
};

const withTransaction = async (callback) => {
  const transaction = await repository.beginTransaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (transactionError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original operation error.
    }
    throw transactionError;
  }
};

const normalizePaperType = (paperType) => {
  const value = String(paperType || "").trim().toUpperCase();
  if (!["A4", "A3"].includes(value)) {
    throw error("Paper type must be A4 or A3.");
  }
  return value;
};

const positiveInteger = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw error(`${fieldName} must be a positive whole number.`);
  }
  return number;
};

const nonNegativeInteger = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw error(`${fieldName} must be a non-negative whole number.`);
  }
  return number;
};

const getMonthYear = (month, year) => {
  const now = new Date();
  const monthNumber = Number(month) || now.getMonth() + 1;
  const yearNumber = Number(year) || now.getFullYear();

  if (monthNumber < 1 || monthNumber > 12) {
    throw error("Month must be between 1 and 12.");
  }
  if (yearNumber < 2000 || yearNumber > 2200) {
    throw error("Year is outside the supported range.");
  }
  return { monthNumber, yearNumber };
};

const getInventory = (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_INVENTORY
  );
  return repository.listInventory();
};

const adjustInventory = async (actor, payload = {}) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_INVENTORY
  );

  const requestedUpdates = [];
  if (payload.paperType) {
    requestedUpdates.push({
      paperType: normalizePaperType(payload.paperType),
      currentStock: nonNegativeInteger(payload.currentStock, "Current stock"),
    });
  } else {
    if (payload.a4Stock !== undefined) {
      requestedUpdates.push({
        paperType: "A4",
        currentStock: nonNegativeInteger(payload.a4Stock, "A4 stock"),
      });
    }
    if (payload.a3Stock !== undefined) {
      requestedUpdates.push({
        paperType: "A3",
        currentStock: nonNegativeInteger(payload.a3Stock, "A3 stock"),
      });
    }
  }

  if (!requestedUpdates.length) {
    throw error("At least one paper stock value is required.");
  }

  return withTransaction(async (transaction) => {
    const results = [];
    for (const update of requestedUpdates.sort((a, b) =>
      a.paperType.localeCompare(b.paperType)
    )) {
      const inventory = await repository.getInventoryForUpdate(
        transaction,
        update.paperType
      );
      if (!inventory) {
        throw error(`No inventory record exists for ${update.paperType}.`, 404);
      }

      const previousStock = Number(inventory.CurrentStock || 0);
      const updated = await repository.setInventoryStock(
        transaction,
        inventory.InventoryId,
        update.currentStock
      );
      await repository.insertInventoryTransaction(transaction, {
        paperType: update.paperType,
        transactionType: "ADJUSTMENT",
        quantity: Math.abs(update.currentStock - previousStock),
        previousStock,
        newStock: update.currentStock,
        remarks:
          payload.remarks ||
          `Manual ${update.paperType} stock adjustment in Printing Management`,
        createdBy: actor.userId,
      });
      results.push(updated);
    }
    return results;
  });
};

const getInventoryTransactions = (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_INVENTORY
  );
  return repository.listInventoryTransactions();
};

const getPurchases = (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_INVENTORY
  );
  return repository.listPurchases();
};

const addPurchase = async (actor, payload = {}) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_INVENTORY
  );
  const paperType = normalizePaperType(payload.paperType);
  const quantityBoxes = positiveInteger(
    payload.quantityBoxes,
    "Quantity boxes"
  );
  const purchaseDate = payload.purchaseDate
    ? new Date(payload.purchaseDate)
    : new Date();
  if (Number.isNaN(purchaseDate.getTime())) {
    throw error("Purchase date is invalid.");
  }
  const settings = await settingsService.getSettings(actor.schoolId);
  const totalSheets =
    quantityBoxes *
    settings.bundlesPerBox *
    settings.bundleSheets;

  return withTransaction(async (transaction) => {
    const inventory = await repository.getInventoryForUpdate(
      transaction,
      paperType
    );
    if (!inventory) {
      throw error(`No inventory record exists for ${paperType}.`, 404);
    }

    const purchase = await repository.insertPurchase(transaction, {
      paperType,
      quantityBoxes,
      bundlesPerBox: settings.bundlesPerBox,
      sheetsPerBundle: settings.bundleSheets,
      purchaseDate,
      createdBy: actor.userId,
    });
    const previousStock = Number(inventory.CurrentStock || 0);
    const updatedInventory = await repository.changeInventoryStock(
      transaction,
      inventory.InventoryId,
      totalSheets
    );
    await repository.insertInventoryTransaction(transaction, {
      paperType,
      transactionType: "PURCHASE",
      quantity: totalSheets,
      previousStock,
      newStock: previousStock + totalSheets,
      referenceId: purchase.PurchaseId,
      remarks: `Purchased ${quantityBoxes} boxes of ${paperType}`,
      createdBy: actor.userId,
    });

    return { purchase, inventory: updatedInventory };
  });
};

const searchDistributionUsers = (actor, search) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_INVENTORY
  );
  const value = String(search || "").trim();
  if (value.length < 2) return [];
  return repository.searchDistributionUsers(value);
};

const getDistributions = (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_INVENTORY
  );
  return repository.listDistributions();
};

const addDistribution = async (actor, payload = {}) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_INVENTORY
  );
  const paperType = normalizePaperType(payload.paperType);
  const bundlesIssued = positiveInteger(
    payload.bundlesIssued,
    "Bundles issued"
  );
  const requestedByUserId = positiveInteger(
    payload.requestedByUserId,
    "Requested by user"
  );
  const issuedDate = payload.issuedDate
    ? new Date(payload.issuedDate)
    : new Date();
  if (Number.isNaN(issuedDate.getTime())) {
    throw error("Issued date is invalid.");
  }
  const settings = await settingsService.getSettings(actor.schoolId);
  const totalSheets = bundlesIssued * settings.bundleSheets;

  return withTransaction(async (transaction) => {
    const inventory = await repository.getInventoryForUpdate(
      transaction,
      paperType
    );
    const recipient = await repository.getDistributionUser(
      transaction,
      requestedByUserId
    );
    if (!inventory) {
      throw error(`No inventory record exists for ${paperType}.`, 404);
    }
    if (!recipient) throw error("The selected recipient is unavailable.", 404);

    const previousStock = Number(inventory.CurrentStock || 0);
    if (previousStock < totalSheets) {
      throw error(
        `Not enough ${paperType} stock. Available: ${previousStock}, required: ${totalSheets}.`,
        409
      );
    }

    const distribution = await repository.insertDistribution(transaction, {
      paperType,
      bundlesIssued,
      sheetsPerBundle: settings.bundleSheets,
      issuedTo:
        payload.issuedTo ||
        recipient.DepartmentName ||
        recipient.FullName,
      receivedByName: payload.receivedByName || recipient.FullName,
      requestedByUserId,
      departmentId: recipient.DepartmentId,
      issuedDate,
    });
    const updatedInventory = await repository.changeInventoryStock(
      transaction,
      inventory.InventoryId,
      -totalSheets
    );
    if (!updatedInventory) throw error("Inventory changed during distribution.", 409);

    await repository.insertInventoryTransaction(transaction, {
      paperType,
      transactionType: "DISTRIBUTION",
      quantity: totalSheets,
      previousStock,
      newStock: previousStock - totalSheets,
      referenceId: distribution.DistributionId,
      remarks: `Distributed ${bundlesIssued} bundles of ${paperType} to ${recipient.FullName}`,
      createdBy: actor.userId,
    });
    return {
      distribution: { ...distribution, TotalSheets: totalSheets },
      inventory: updatedInventory,
    };
  });
};

const actorDepartmentIds = (actor) =>
  new Set(
    actor.assignments.flatMap((assignment) =>
      (assignment.scopes || [])
        .filter(
          (scope) =>
            String(scope.scopeType || "").toUpperCase() === "DEPARTMENT"
        )
        .map((scope) => Number(scope.scopeEntityId))
    )
  );

const assertLimitDepartment = (actor, departmentId) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_LIMITS
  );
  if (
    accessService.isPrintingOperator(actor) ||
    accessService.isPlatformAdministrator(actor)
  ) {
    return;
  }
  if (!actorDepartmentIds(actor).has(Number(departmentId))) {
    throw error("This department is outside your active assignment scope.", 403);
  }
};

const getDepartmentLimits = async (actor, month, year) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.MANAGE_LIMITS
  );
  const { monthNumber, yearNumber } = getMonthYear(month, year);
  const rows = await repository.listDepartmentLimits(monthNumber, yearNumber);
  if (
    accessService.isPrintingOperator(actor) ||
    accessService.isPlatformAdministrator(actor)
  ) {
    return rows;
  }
  const allowedDepartments = actorDepartmentIds(actor);
  return rows.filter((row) =>
    allowedDepartments.has(Number(row.DepartmentId))
  );
};

const saveDepartmentLimit = async (
  actor,
  departmentId,
  payload = {}
) => {
  assertLimitDepartment(actor, departmentId);
  const { monthNumber, yearNumber } = getMonthYear(
    payload.month,
    payload.year
  );
  const sheetLimit = nonNegativeInteger(payload.sheetLimit, "Sheet limit");
  return withTransaction((transaction) =>
    repository.upsertDepartmentLimit(transaction, {
      departmentId: Number(departmentId),
      monthNumber,
      yearNumber,
      sheetLimit,
      createdBy: actor.userId,
    })
  );
};

const getSubjectLimits = async (
  actor,
  departmentId,
  month,
  year
) => {
  assertLimitDepartment(actor, departmentId);
  const { monthNumber, yearNumber } = getMonthYear(month, year);
  return repository.listSubjectLimits(
    Number(departmentId),
    monthNumber,
    yearNumber
  );
};

const saveSubjectLimit = async (
  actor,
  subjectId,
  payload = {}
) => {
  const departmentId = Number(payload.departmentId);
  assertLimitDepartment(actor, departmentId);
  const normalizedSubjectId = positiveInteger(subjectId, "Subject ID");
  const sheetLimit = nonNegativeInteger(payload.sheetLimit, "Sheet limit");
  const { monthNumber, yearNumber } = getMonthYear(
    payload.month,
    payload.year
  );

  return withTransaction(async (transaction) => {
    const departmentLimit =
      await repository.getDepartmentLimitForUpdate(
        transaction,
        departmentId,
        monthNumber,
        yearNumber
      );
    if (!departmentLimit) {
      throw error(
        "Department limit must be configured before subject limits."
      );
    }

    const otherSubjectLimits =
      await repository.getOtherSubjectLimitTotal(transaction, {
        departmentId,
        subjectId: normalizedSubjectId,
        monthNumber,
        yearNumber,
      });
    if (otherSubjectLimits + sheetLimit > Number(departmentLimit.SheetLimit)) {
      throw error("Subject limits cannot exceed the department monthly limit.", 409, {
        departmentLimit: Number(departmentLimit.SheetLimit),
        alreadyAllocated: otherSubjectLimits,
        requestedSubjectLimit: sheetLimit,
      });
    }

    let hodUserId = payload.hodUserId ? Number(payload.hodUserId) : null;
    if (!hodUserId) {
      const hod = await requestRepository.findHodApprover(transaction, {
        schoolId: actor.schoolId,
        departmentId,
        subjectId: normalizedSubjectId,
      });
      hodUserId = hod?.UserId || null;
    }

    return repository.upsertSubjectLimit(transaction, {
      departmentLimitId: departmentLimit.DepartmentLimitId,
      departmentId,
      subjectId: normalizedSubjectId,
      hodUserId,
      monthNumber,
      yearNumber,
      sheetLimit,
      createdBy: actor.userId,
    });
  });
};

module.exports = {
  getInventory,
  adjustInventory,
  getInventoryTransactions,
  getPurchases,
  addPurchase,
  searchDistributionUsers,
  getDistributions,
  addDistribution,
  getDepartmentLimits,
  saveDepartmentLimit,
  getSubjectLimits,
  saveSubjectLimit,
};
