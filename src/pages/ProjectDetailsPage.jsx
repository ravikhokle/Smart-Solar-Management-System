import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Zap,
  Layers,
  Cpu,
  Battery,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import projectService from '../services/project.service';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/forms/ProjectForm';
import { formatCapacity, formatCurrency, formatDate } from '../utils/formatters';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      setProject(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (index) => {
    if (!project || !project.milestones) return;
    const updatedMilestones = [...project.milestones];
    const current = updatedMilestones[index].status;
    const nextStatus =
      current === 'completed'
        ? 'pending'
        : current === 'in_progress'
        ? 'completed'
        : 'in_progress';

    updatedMilestones[index] = {
      ...updatedMilestones[index],
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
    };

    try {
      const res = await projectService.updateProject(project._id, {
        milestones: updatedMilestones,
      });
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProject = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await projectService.updateProject(project._id, formData);
      setProject(res.data);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete project ${project.projectCode}?`)) {
      try {
        await projectService.deleteProject(project._id);
        navigate('/projects');
      } catch (err) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-solar-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-solar-text-muted">Loading project telemetry and milestones...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-solar-border">
        <AlertCircle className="w-10 h-10 text-solar-danger mx-auto mb-2" />
        <h3 className="text-base font-bold text-solar-text">Project not found</h3>
        <p className="text-xs text-solar-text-muted mt-1">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const completedCount =
    project.milestones?.filter((m) => m.status === 'completed')?.length || 0;
  const totalCount = project.milestones?.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg bg-white border border-solar-border text-solar-text hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-solar-primary">
                {project.projectCode}
              </span>
              <Badge type="status">{project.status}</Badge>
              <Badge type="priority">{project.priority}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-solar-text mt-0.5">
              {project.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Project
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteProject}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Specs Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="text-center p-4">
          <Zap className="w-5 h-5 text-solar-accent mx-auto mb-1.5" />
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold">
            Capacity
          </span>
          <span className="text-base font-bold text-solar-primary">
            {formatCapacity(project.systemCapacityKw)}
          </span>
        </Card>

        <Card className="text-center p-4">
          <Layers className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold">
            Panels
          </span>
          <span className="text-base font-bold text-solar-primary">
            {project.panelCount || 0} Units
          </span>
        </Card>

        <Card className="text-center p-4">
          <Battery className="w-5 h-5 text-solar-secondary mx-auto mb-1.5" />
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold">
            Storage
          </span>
          <span className="text-base font-bold text-solar-primary">
            {project.batteryStorageKwh || 0} kWh
          </span>
        </Card>

        <Card className="text-center p-4">
          <Calendar className="w-5 h-5 text-solar-info mx-auto mb-1.5" />
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold">
            Commission Date
          </span>
          <span className="text-xs font-bold text-solar-primary truncate block mt-1">
            {formatDate(project.targetCompletionDate)}
          </span>
        </Card>

        <Card className="text-center p-4">
          <User className="w-5 h-5 text-teal-600 mx-auto mb-1.5" />
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold">
            Lead Engineer
          </span>
          <span className="text-xs font-bold text-solar-primary truncate block mt-1">
            {project.leadEngineer || 'Alex Rivera'}
          </span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-[10px] text-solar-text-muted uppercase tracking-wider block font-semibold mt-1">
            Contract Value
          </span>
          <span className="text-base font-bold text-solar-secondary block mt-1.5">
            {formatCurrency(project.contractValue)}
          </span>
        </Card>
      </div>

      {/* Grid: Milestones Checklist & Technical Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="EPC Installation Milestones"
            subtitle={`Progress: ${completedCount} of ${totalCount} steps completed (${progressPercent}%)`}
          >
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-solar-secondary to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {project.milestones?.map((milestone, idx) => {
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';

                return (
                  <div
                    key={milestone._id || idx}
                    onClick={() => handleToggleMilestone(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : isInProgress
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                        : 'bg-slate-50/40 border-solar-border text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isCompleted
                            ? 'bg-solar-secondary text-white'
                            : isInProgress
                            ? 'bg-solar-accent text-solar-primary'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            isCompleted ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {milestone.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Click to toggle status: {milestone.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isCompleted ? 'success' : isInProgress ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Technical Hardware Specs Column */}
        <div className="space-y-4">
          <Card title="Hardware Specifications" subtitle="Engineered electrical equipment">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-solar-border space-y-1">
                <span className="text-[10px] font-semibold text-solar-text-muted uppercase">
                  PV Modules / Panels
                </span>
                <p className="font-bold text-solar-primary">{project.panelModel}</p>
                <p className="text-[11px] text-solar-text-muted">
                  Quantity: {project.panelCount} modules
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-solar-border space-y-1">
                <span className="text-[10px] font-semibold text-solar-text-muted uppercase">
                  Inverter System
                </span>
                <p className="font-bold text-solar-primary">{project.inverterModel}</p>
                <p className="text-[11px] text-solar-text-muted">
                  Grid interconnection: 240V / 480V 3-Phase
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-solar-border space-y-1">
                <span className="text-[10px] font-semibold text-solar-text-muted uppercase">
                  Site Installation Address
                </span>
                <p className="font-medium text-solar-text flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{project.installationAddress}</span>
                </p>
              </div>

              {project.notes && (
                <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 space-y-1">
                  <span className="text-[10px] font-semibold text-solar-primary uppercase">
                    Field Engineering Notes
                  </span>
                  <p className="text-[11px] text-solar-text leading-relaxed">
                    {project.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project Configuration"
        subtitle={`Update specifications for ${project.projectCode}`}
      >
        <ProjectForm
          initialData={project}
          onSubmit={handleUpdateProject}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
