/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Timeline Service
========================================================= */

const repository = require("../repositories/assetTimelineRepository");

const normalizeEvent = (event) => ({
  eventDate: event.EventDate,
  eventGroup: event.EventGroup,
  eventType: event.EventType,
  title: event.Title,
  description: event.Description,
  performedBy: event.PerformedBy || null,
  sourceTable: event.SourceTable,
  referenceId: event.ReferenceId,
  notes: event.Notes || null,
  metadata: {
    returnedAt: event.ReturnedAt || null,
    expectedReturnAt: event.ExpectedReturnAt || null,
    nextDueAt: event.NextDueAt || null,
    assignedToName: event.AssignedToName || null,
    assignedToEmail: event.AssignedToEmail || null,
    assignedToEmployeeCode: event.AssignedToEmployeeCode || null,
    borrowedByName: event.BorrowedByName || null,
    borrowedByEmail: event.BorrowedByEmail || null,
    borrowedByEmployeeCode: event.BorrowedByEmployeeCode || null,
  },
});

const sortEvents = (events) => {
  return events
    .filter((event) => event.eventDate)
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
};

const getTimeline = async (assetId) => {
  const asset = await repository.getAssetSummary(assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const [
    assignments,
    borrows,
    transfers,
    maintenance,
    issues,
    notes,
    disposals,
    statuses,
  ] = await Promise.all([
    repository.getAssignmentEvents(assetId),
    repository.getBorrowEvents(assetId),
    repository.getTransferEvents(assetId),
    repository.getMaintenanceEvents(assetId),
    repository.getIssueEvents(assetId),
    repository.getNoteEvents(assetId),
    repository.getDisposalEvents(assetId),
    repository.getStatusEvents(assetId),
  ]);

  const timeline = sortEvents([
    ...assignments.map(normalizeEvent),
    ...borrows.map(normalizeEvent),
    ...transfers.map(normalizeEvent),
    ...maintenance.map(normalizeEvent),
    ...issues.map(normalizeEvent),
    ...notes.map(normalizeEvent),
    ...disposals.map(normalizeEvent),
    ...statuses.map(normalizeEvent),
  ]);

  return {
    asset,
    summary: {
      totalEvents: timeline.length,
      assignmentEvents: assignments.length,
      borrowEvents: borrows.length,
      transferEvents: transfers.length,
      maintenanceEvents: maintenance.length,
      issueEvents: issues.length,
      noteEvents: notes.length,
      disposalEvents: disposals.length,
      statusEvents: statuses.length,
    },
    timeline,
  };
};

const getTimelineSection = async (assetId, section) => {
  const asset = await repository.getAssetSummary(assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const sectionMap = {
    assignments: repository.getAssignmentEvents,
    borrows: repository.getBorrowEvents,
    transfers: repository.getTransferEvents,
    maintenance: repository.getMaintenanceEvents,
    issues: repository.getIssueEvents,
    notes: repository.getNoteEvents,
    disposals: repository.getDisposalEvents,
    status: repository.getStatusEvents,
  };

  const getter = sectionMap[section];

  if (!getter) {
    throw Object.assign(new Error("Invalid timeline section."), { statusCode: 400 });
  }

  const events = await getter(assetId);

  return {
    asset,
    section,
    totalEvents: events.length,
    timeline: sortEvents(events.map(normalizeEvent)),
  };
};

module.exports = {
  getTimeline,
  getTimelineSection,
};