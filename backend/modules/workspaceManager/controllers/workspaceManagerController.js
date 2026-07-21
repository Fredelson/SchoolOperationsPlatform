/* =========================================================
   Workspace Manager Controller
   Purpose:
   Handles HTTP request/response for Workspace Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const workspaceManagerService = require("../services/workspaceManagerService");
const activityLogger = require("../../audit/services/activityLogger");

/* =========================================================
   GET WORKSPACES
========================================================= */

const getWorkspaces = async (req, res) => {
  try {
    const result = await workspaceManagerService.getWorkspaces(req.query, req.user);

    return res.status(200).json({
      success: true,
      message: "Workspaces loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Workspaces Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspaces.",
    });
  }
};

/* =========================================================
   GET WORKSPACE BY ID
========================================================= */

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.getWorkspaceById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Workspace loaded successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Get Workspace By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspace.",
    });
  }
};

/* =========================================================
   CREATE WORKSPACE
========================================================= */

const createWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.createWorkspace(req.body);

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create workspace.",
    });
  }
};

/* =========================================================
   UPDATE WORKSPACE
========================================================= */

const updateWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.updateWorkspace(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update workspace.",
    });
  }
};

/* =========================================================
   DELETE WORKSPACE
========================================================= */

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.deleteWorkspace(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Delete Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete workspace.",
    });
  }
};

/* =========================================================
   GET LOOKUPS
========================================================= */

const getWorkspaceLookups = async (req, res) => {
  try {
    const lookups = await workspaceManagerService.getWorkspaceLookups();

    return res.status(200).json({
      success: true,
      message: "Workspace lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Workspace Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspace lookups.",
    });
  }
};

const getWorkspaceConfiguration = async (req, res) => {
  try {
    const data = await workspaceManagerService.getWorkspaceConfiguration(req.params.id, req.user);
    return res.status(200).json({ success:true, message:"Workspace configuration loaded successfully.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success:false, message:error.message || "Failed to load workspace configuration." });
  }
};

const replaceAssignments = async (req,res) => {
  try {
    const data=await workspaceManagerService.replaceAssignments(req.params.id,req.params.assignmentType,req.body);
    await activityLogger.log({moduleKey:"PLATFORM_FOUNDATION",actionType:"UPDATE",entityType:"WorkspaceAssignments",entityId:req.params.id,title:`Workspace ${req.params.assignmentType} updated`,newValue:req.body?.items,user:req.user,ipAddress:req.ip});
    return res.status(200).json({success:true,message:"Workspace assignments saved successfully.",data});
  } catch(error) { return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to save workspace assignments."}); }
};

const syncRolePermissions = async (req,res) => {
  try {
    const result = await workspaceManagerService.syncWorkspaceRolePermissions(req.params.id);
    return res.status(200).json({success:true,message:`Synced permissions for workspace. ${result.affected} permissions granted.`,data:result});
  } catch(error) { return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to sync workspace permissions."}); }
};

const getUserPreview = async (req,res) => {
  try { const data=await workspaceManagerService.getUserPreview(req.params.userId,req.user); return res.status(200).json({success:true,message:"Read-only user preview loaded.",data}); }
  catch(error) { return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to load user preview."}); }
};
const searchPreviewUsers=async(req,res)=>{try{return res.status(200).json({success:true,message:"Preview users loaded.",data:await workspaceManagerService.searchPreviewUsers(req.user,req.query)});}catch(error){return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to search preview users."});}};
const setWorkspaceDashboard=async(req,res)=>{try{const data=await workspaceManagerService.setWorkspaceDashboard(req.params.id,req.body);await activityLogger.log({moduleKey:"PLATFORM_FOUNDATION",actionType:"UPDATE",entityType:"WorkspaceDashboard",entityId:req.params.id,title:"Workspace dashboard updated",newValue:req.body,user:req.user,ipAddress:req.ip});return res.status(200).json({success:true,message:"Workspace dashboard saved successfully.",data});}catch(error){return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to save workspace dashboard."});}};

const getWorkspaceButtons = async (req, res) => {
  try {
    const data = await workspaceManagerService.getWorkspaceButtons(req.params.id, req.user);
    return res.status(200).json({ success: true, message: "Workspace buttons loaded successfully.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to load workspace buttons." });
  }
};

const updateWorkspaceButton = async (req, res) => {
  try {
    const data = await workspaceManagerService.updateWorkspaceButton(req.params.id, req.params.buttonId, req.body, req.user);
    await activityLogger.log({ moduleKey: "PLATFORM_FOUNDATION", actionType: "UPDATE", entityType: "WorkspaceButton", entityId: req.params.buttonId, title: "Workspace button updated", newValue: req.body, user: req.user, ipAddress: req.ip });
    return res.status(200).json({ success: true, message: "Workspace button updated successfully.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to update workspace button." });
  }
};

const startLiveMode = async (req,res) => {
  try { const data=await workspaceManagerService.startLiveMode(req.user,req.body); await activityLogger.log({moduleKey:"PLATFORM_FOUNDATION",actionType:"LIVE_MODE_ENTER",entityType:"WorkspaceLiveSession",entityId:data.session.LiveSessionId,title:"Super Admin entered Live Mode",description:req.body.reason,newValue:{targetUserId:data.target.UserId},user:req.user,ipAddress:req.ip}); return res.status(201).json({success:true,message:"Live Mode started.",data}); }
  catch(error){return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to start Live Mode."});}
};
const exitLiveMode = async (req,res) => {
  try { const data=await workspaceManagerService.exitLiveMode(req.user,req.params.sessionId); await activityLogger.log({moduleKey:"PLATFORM_FOUNDATION",actionType:"LIVE_MODE_EXIT",entityType:"WorkspaceLiveSession",entityId:req.params.sessionId,title:"Super Admin exited Live Mode",user:req.user,ipAddress:req.ip}); return res.status(200).json({success:true,message:"Live Mode ended.",data}); }
  catch(error){return res.status(error.statusCode||500).json({success:false,message:error.message||"Failed to end Live Mode."});}
};

/* =========================================================
   EXPORT CONTROLLER
========================================================= */

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceLookups,
  getWorkspaceConfiguration,
  replaceAssignments,
  syncRolePermissions,
  getUserPreview,
  searchPreviewUsers,
  setWorkspaceDashboard,
  startLiveMode,
  exitLiveMode,
  getWorkspaceButtons,
  updateWorkspaceButton,
};
