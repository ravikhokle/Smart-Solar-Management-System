import projectService from '../services/project.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const projects = await projectService.getAllProjects({ status, priority, search });
    return sendSuccess(res, 200, 'Projects retrieved successfully', projects, {
      total: projects.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendSuccess(res, 200, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, systemCapacityKw, installationAddress } = req.body;
    if (!title || !systemCapacityKw || !installationAddress) {
      return sendError(res, 400, 'Title, system capacity (kW), and installation address are required');
    }
    const project = await projectService.createProject(req.body);
    return sendSuccess(res, 201, 'Project created successfully', project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return sendSuccess(res, 200, 'Project updated successfully', project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    return sendSuccess(res, 200, 'Project deleted successfully', project);
  } catch (error) {
    next(error);
  }
};

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const analytics = await projectService.getDashboardAnalytics();
    return sendSuccess(res, 200, 'Dashboard analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};
