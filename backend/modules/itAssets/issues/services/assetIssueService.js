const repository = require("../repositories/assetIssueRepository");

const userId = (user) => user?.id || user?.UserId || null;

const reportIssue = async ({ payload, user, ipAddress }) => {
  const asset = await repository.getAssetById(payload.assetId);
  if (!asset) throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });

  const faultyStatus = await repository.getStatusByKey("Faulty");
  if (!faultyStatus) throw Object.assign(new Error("Faulty status is missing."), { statusCode: 400 });

  return repository.reportIssue({
    asset,
    payload,
    faultyStatusId: faultyStatus.ITAssetStatusId,
    actionByUserId: userId(user),
    ipAddress,
  });
};

const assignIssue = async ({ payload }) => {
  const issue = await repository.assignIssue({
    issueLogId: payload.issueLogId,
    assignedToUserId: payload.assignedToUserId,
  });

  if (!issue) throw Object.assign(new Error("Issue not found or cannot be assigned."), { statusCode: 404 });
  return issue;
};

const resolveIssue = async ({ payload, user, ipAddress }) => {
  const issue = await repository.getIssueById(payload.issueLogId);
  if (!issue) throw Object.assign(new Error("Issue not found."), { statusCode: 404 });

  const asset = await repository.getAssetById(issue.AssetId);
  if (!asset) throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });

  const availableStatus = await repository.getStatusByKey("Available");
  if (!availableStatus) throw Object.assign(new Error("Available status is missing."), { statusCode: 400 });

  return repository.resolveIssue({
    issue,
    asset,
    availableStatusId: availableStatus.ITAssetStatusId,
    payload,
    actionByUserId: userId(user),
    ipAddress,
  });
};

module.exports = {
  reportIssue,
  assignIssue,
  resolveIssue,
  getIssues: repository.getIssues,
};