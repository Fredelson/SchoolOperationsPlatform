const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

const requestService = require("../services/printingRequestService");
const settingsService = require("../services/printingSettingsService");

const createDraft = asyncHandler(async (req, res) => {
  const draft = await requestService.createDraft(
    req.printingActor,
    req.body
  );
  return sendSuccess(res, "Printing request draft created.", draft, 201);
});

const uploadAttachment = asyncHandler(async (req, res) => {
  const result = await requestService.uploadAttachment(
    req.printingActor,
    Number(req.params.id),
    req.file,
    req.body
  );
  return sendSuccess(res, "Printing document uploaded.", result, 201);
});

const submitRequest = asyncHandler(async (req, res) => {
  const printingRequest = await requestService.submitRequest(
    req.printingActor,
    Number(req.params.id)
  );
  return sendSuccess(res, "Printing request submitted.", printingRequest);
});

const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await requestService.listMyRequests(req.printingActor);
  return sendSuccess(res, "Printing requests loaded.", requests);
});

const listMyAttachments = asyncHandler(async (req, res) => {
  const attachments = await requestService.listMyAttachments(req.printingActor);
  return sendSuccess(res, "Printing attachments loaded.", attachments);
});

const getRequestById = asyncHandler(async (req, res) => {
  const printingRequest = await requestService.getRequestById(
    req.printingActor,
    Number(req.params.id)
  );
  return sendSuccess(res, "Printing request loaded.", printingRequest);
});

const cancelRequest = asyncHandler(async (req, res) => {
  const printingRequest = await requestService.cancelRequest(
    req.printingActor,
    Number(req.params.id),
    req.body?.remarks
  );
  return sendSuccess(res, "Printing request cancelled.", printingRequest);
});

const listHodApprovals = asyncHandler(async (req, res) => {
  const requests = await requestService.listApprovalInbox(
    req.printingActor,
    "HOD"
  );
  return sendSuccess(res, "HOD approval inbox loaded.", requests);
});

const listHosApprovals = asyncHandler(async (req, res) => {
  const requests = await requestService.listApprovalInbox(
    req.printingActor,
    "HOS"
  );
  return sendSuccess(res, "HOS approval inbox loaded.", requests);
});

const listApprovalHistory = asyncHandler(async (req, res) => {
  const requests = await requestService.listApprovalHistory(
    req.printingActor,
    req.params.role
  );
  return sendSuccess(res, "Approval history loaded.", requests);
});

const getApprovalSummary = asyncHandler(async (req, res) => {
  const summary = await requestService.getApprovalSummary(
    req.printingActor,
    req.params.role
  );
  return sendSuccess(res, "Approval summary loaded.", summary);
});

const decideApproval = asyncHandler(async (req, res) => {
  const printingRequest = await requestService.decideApproval(
    req.printingActor,
    Number(req.params.id),
    req.params.role,
    req.body?.decision,
    req.body?.remarks
  );
  return sendSuccess(res, "Approval decision recorded.", printingRequest);
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(
    req.printingActor.schoolId
  );
  return sendSuccess(res, "Printing settings loaded.", settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(
    req.printingActor.schoolId,
    req.body
  );
  return sendSuccess(res, "Printing settings updated.", settings);
});

module.exports = {
  createDraft,
  uploadAttachment,
  submitRequest,
  listMyRequests,
  listMyAttachments,
  getRequestById,
  cancelRequest,
  listHodApprovals,
  listHosApprovals,
  listApprovalHistory,
  getApprovalSummary,
  decideApproval,
  getSettings,
  updateSettings,
};
