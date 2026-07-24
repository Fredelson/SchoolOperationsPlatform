const accessService = require("../services/printingAccessService");

const requirePrintingCapability = (capability) => {
  return async (req, res, next) => {
    try {
      const actor = await accessService.getActorContext(req.user?.id);
      accessService.assertCapability(actor, capability);
      req.printingActor = actor;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requirePrintingCapability,
};
