import Project from '../models/Project.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';
import { mockData } from '../utils/seedData.js';

class ProjectService {
  async getAllProjects(filters = {}) {
    const { status, priority, search } = filters;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (priority && priority !== 'all') {
        query.priority = priority;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { projectCode: { $regex: search, $options: 'i' } },
          { installationAddress: { $regex: search, $options: 'i' } },
        ];
      }
      return await Project.find(query).populate('customer').sort({ updatedAt: -1 });
    } else {
      // In-memory fallback
      let results = [...mockData.projects];
      if (status && status !== 'all') {
        results = results.filter((p) => p.status === status);
      }
      if (priority && priority !== 'all') {
        results = results.filter((p) => p.priority === priority);
      }
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.projectCode.toLowerCase().includes(s) ||
            p.installationAddress.toLowerCase().includes(s) ||
            (p.customerName && p.customerName.toLowerCase().includes(s))
        );
      }
      return results;
    }
  }

  async getProjectById(id) {
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findById(id).populate('customer');
      if (!project) throw new Error(`Project with ID ${id} not found`);
      return project;
    }
    const project = mockData.projects.find((p) => p._id === id || p.projectCode === id);
    if (!project) throw new Error(`Project with ID ${id} not found`);
    return project;
  }

  async createProject(data) {
    const projectCode = data.projectCode || `SOL-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newProjectData = {
      ...data,
      projectCode,
      milestones: data.milestones || [
        { title: 'Site Feasibility Audit', status: 'completed' },
        { title: 'Electrical Engineering Drawings', status: 'in_progress' },
        { title: 'City Permitting Approval', status: 'pending' },
        { title: 'Rooftop Rack & Ballast Mounting', status: 'pending' },
        { title: 'PV Wire Stringing & Inverter Tie', status: 'pending' },
        { title: 'Utility Interconnection & Commissioning', status: 'pending' },
      ],
    };

    if (mongoose.connection.readyState === 1) {
      const project = await Project.create(newProjectData);
      return await project.populate('customer');
    } else {
      const project = {
        _id: 'proj_' + Date.now(),
        ...newProjectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockData.projects.unshift(project);
      return project;
    }
  }

  async updateProject(id, updateData) {
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('customer');
      if (!project) throw new Error(`Project with ID ${id} not found`);
      return project;
    } else {
      const idx = mockData.projects.findIndex((p) => p._id === id);
      if (idx === -1) throw new Error(`Project with ID ${id} not found`);
      mockData.projects[idx] = {
        ...mockData.projects[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      return mockData.projects[idx];
    }
  }

  async deleteProject(id) {
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findByIdAndDelete(id);
      if (!project) throw new Error(`Project with ID ${id} not found`);
      return project;
    } else {
      const idx = mockData.projects.findIndex((p) => p._id === id);
      if (idx === -1) throw new Error(`Project with ID ${id} not found`);
      const removed = mockData.projects.splice(idx, 1)[0];
      return removed;
    }
  }

  async getDashboardAnalytics() {
    let projectsList = [];
    if (mongoose.connection.readyState === 1) {
      projectsList = await Project.find();
    } else {
      projectsList = mockData.projects;
    }

    const totalProjects = projectsList.length;
    const totalCapacityKw = projectsList.reduce((acc, p) => acc + (p.systemCapacityKw || 0), 0);
    const totalContractValue = projectsList.reduce((acc, p) => acc + (p.contractValue || 0), 0);
    const activeInstallations = projectsList.filter((p) =>
      ['Site Audit', 'Engineering Design', 'Permitting', 'Installation', 'Commissioning'].includes(p.status)
    ).length;
    const completedProjects = projectsList.filter((p) => p.status === 'Completed').length;

    // Status breakdown
    const statusCounts = projectsList.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    // Pipeline funnel
    const pipeline = [
      { stage: 'Lead', count: statusCounts['Lead'] || 0 },
      { stage: 'Site Audit', count: statusCounts['Site Audit'] || 0 },
      { stage: 'Engineering', count: statusCounts['Engineering Design'] || 0 },
      { stage: 'Permitting', count: statusCounts['Permitting'] || 0 },
      { stage: 'Installation', count: statusCounts['Installation'] || 0 },
      { stage: 'Commissioning', count: statusCounts['Commissioning'] || 0 },
      { stage: 'Completed', count: statusCounts['Completed'] || 0 },
    ];

    // Power generation trend data (MWh per month)
    const generationMonthly = [
      { month: 'Jan', actualMWh: 42, targetMWh: 38 },
      { month: 'Feb', actualMWh: 54, targetMWh: 50 },
      { month: 'Mar', actualMWh: 78, targetMWh: 70 },
      { month: 'Apr', actualMWh: 95, targetMWh: 90 },
      { month: 'May', actualMWh: 124, targetMWh: 115 },
      { month: 'Jun', actualMWh: 148, targetMWh: 140 },
      { month: 'Jul', actualMWh: 162, targetMWh: 155 },
      { month: 'Aug', actualMWh: 158, targetMWh: 150 },
      { month: 'Sep', actualMWh: 130, targetMWh: 125 },
      { month: 'Oct', actualMWh: 98, targetMWh: 92 },
      { month: 'Nov', actualMWh: 64, targetMWh: 60 },
      { month: 'Dec', actualMWh: 48, targetMWh: 45 },
    ];

    return {
      kpi: {
        totalProjects,
        totalCapacityKw: Math.round(totalCapacityKw * 10) / 10,
        totalCapacityMw: Math.round((totalCapacityKw / 1000) * 100) / 100,
        totalContractValue,
        activeInstallations,
        completedProjects,
        estimatedCo2OffsetTons: Math.round(totalCapacityKw * 1.2),
      },
      pipeline,
      generationMonthly,
    };
  }
}

export default new ProjectService();
