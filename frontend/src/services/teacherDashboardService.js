// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard API Service
// Uses the unified Printing Management request APIs
// ============================================

import {
  getMyPrintingAttachments,
  getMyPrintingRequests,
} from "./printingService";

const statusIncludes = (request, value) =>
  String(request?.Status || request?.status || "")
    .toLowerCase()
    .includes(value);

const fileExtension = (fileName = "") =>
  String(fileName).toLowerCase().split(".").pop();

export const getTeacherDashboardData = async () => {
  const [requests = [], attachments = []] = await Promise.all([
    getMyPrintingRequests(),
    getMyPrintingAttachments(),
  ]);

  const stats = {
    TotalRequests: requests.length,
    TotalSheets: requests.reduce(
      (sum, request) => sum + Number(request.TotalSheets || 0),
      0
    ),
    TotalPages: requests.reduce(
      (sum, request) => sum + Number(request.TotalPages || 0),
      0
    ),
    PendingRequests: requests.filter(
      (request) =>
        !statusIncludes(request, "completed") &&
        !statusIncludes(request, "rejected") &&
        !statusIncludes(request, "cancelled")
    ).length,
    ApprovedRequests: requests.filter(
      (request) =>
        statusIncludes(request, "approved") ||
        statusIncludes(request, "forwarded") ||
        statusIncludes(request, "queued") ||
        statusIncludes(request, "printing") ||
        statusIncludes(request, "on hold")
    ).length,
    RejectedRequests: requests.filter((request) =>
      statusIncludes(request, "rejected")
    ).length,
    CompletedRequests: requests.filter((request) =>
      statusIncludes(request, "completed")
    ).length,
  };

  const monthlyMap = new Map();
  for (const request of requests) {
    const submittedAt = new Date(request.SubmittedAt);
    if (Number.isNaN(submittedAt.getTime())) continue;
    const key = `${submittedAt.getFullYear()}-${String(
      submittedAt.getMonth() + 1
    ).padStart(2, "0")}`;
    const current = monthlyMap.get(key) || {
      key,
      MonthName: submittedAt.toLocaleString("en", {
        month: "short",
        year: "numeric",
      }),
      TotalPages: 0,
      TotalSheets: 0,
    };
    current.TotalPages += Number(request.TotalPages || 0);
    current.TotalSheets += Number(request.TotalSheets || 0);
    monthlyMap.set(key, current);
  }

  const purposeMap = new Map();
  for (const request of requests) {
    const purposeName = request.PurposeName || "No Purpose";
    purposeMap.set(purposeName, (purposeMap.get(purposeName) || 0) + 1);
  }

  const attachmentSummary = attachments.reduce(
    (summary, attachment) => {
      const extension = fileExtension(attachment.OriginalFileName);
      const sizeMb = Number(attachment.FileSizeKB || 0) / 1024;
      if (extension === "pdf") summary.pdfFiles += 1;
      else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        summary.imageFiles += 1;
      } else if (["zip", "rar", "7z"].includes(extension)) {
        summary.archiveFiles += 1;
      } else {
        summary.documentFiles += 1;
      }
      summary.usedMB += sizeMb;
      summary.largestFileMB = Math.max(summary.largestFileMB, sizeMb);
      summary.totalAttachments += 1;
      return summary;
    },
    {
      pdfFiles: 0,
      imageFiles: 0,
      documentFiles: 0,
      archiveFiles: 0,
      usedMB: 0,
      totalMB: 1024,
      totalAttachments: 0,
      largestFileMB: 0,
    }
  );
  attachmentSummary.usedMB = Number(attachmentSummary.usedMB.toFixed(2));
  attachmentSummary.largestFileMB = Number(
    attachmentSummary.largestFileMB.toFixed(2)
  );

  return {
    stats,
    recentRequests: requests.slice(0, 10),
    monthlyUsage: [...monthlyMap.values()]
      .sort((left, right) => left.key.localeCompare(right.key))
      .slice(-6),
    purposeBreakdown: [...purposeMap.entries()].map(
      ([PurposeName, TotalRequests]) => ({ PurposeName, TotalRequests })
    ),
    attachmentSummary,
  };
};

export const getTeacherDashboardKpis = async () => {
  const response = await getTeacherDashboardData();
  const stats = response.stats || {};

  return {
    totalRequests: stats.TotalRequests || 0,
    totalSheets: stats.TotalSheets || 0,
    totalPages: stats.TotalPages || 0,
    pendingRequests: stats.PendingRequests || 0,
    approvedRequests: stats.ApprovedRequests || 0,
    rejectedRequests: stats.RejectedRequests || 0,
    completedRequests: stats.CompletedRequests || 0,
  };
};
