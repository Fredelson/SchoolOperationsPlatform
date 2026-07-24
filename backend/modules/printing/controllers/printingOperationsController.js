const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const service = require("../services/printingOperationsService");

const getInventory = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper inventory loaded.",
    await service.getInventory(req.printingActor)
  )
);

const adjustInventory = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper inventory adjusted.",
    await service.adjustInventory(req.printingActor, req.body)
  )
);

const getInventoryTransactions = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Inventory transactions loaded.",
    await service.getInventoryTransactions(req.printingActor)
  )
);

const getPurchases = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper purchases loaded.",
    await service.getPurchases(req.printingActor)
  )
);

const addPurchase = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper purchase recorded.",
    await service.addPurchase(req.printingActor, req.body),
    201
  )
);

const searchDistributionUsers = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Distribution recipients loaded.",
    await service.searchDistributionUsers(
      req.printingActor,
      req.query.query
    )
  )
);

const getDistributions = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper distributions loaded.",
    await service.getDistributions(req.printingActor)
  )
);

const addDistribution = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Paper distribution recorded.",
    await service.addDistribution(req.printingActor, req.body),
    201
  )
);

const getDepartmentLimits = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Department limits loaded.",
    await service.getDepartmentLimits(
      req.printingActor,
      req.query.month,
      req.query.year
    )
  )
);

const saveDepartmentLimit = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Department limit saved.",
    await service.saveDepartmentLimit(
      req.printingActor,
      Number(req.params.departmentId),
      req.body
    )
  )
);

const getSubjectLimits = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Subject limits loaded.",
    await service.getSubjectLimits(
      req.printingActor,
      Number(req.query.departmentId),
      req.query.month,
      req.query.year
    )
  )
);

const saveSubjectLimit = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Subject limit saved.",
    await service.saveSubjectLimit(
      req.printingActor,
      Number(req.params.subjectId),
      req.body
    )
  )
);

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
