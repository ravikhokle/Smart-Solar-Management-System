import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Zap,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ProjectForm from '../components/forms/ProjectForm';
import {
  fetchProjects,
  addProject,
  updateProjectStatus,
} from '../features/projects/projectSlice';
import { PROJECT_STATUSES } from '../utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '../utils/formatters';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, loading } = useSelector((state) => state.projects);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      p.installationAddress.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = async (formData) => {
    setIsSubmitting(true);
    try {
      await dispatch(addProject(formData)).unwrap();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = (e, projectId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    dispatch(updateProjectStatus({ id: projectId, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-solar-primary">
            Solar Installation Projects
          </h1>
          <p className="text-xs sm:text-sm text-solar-text-muted mt-0.5">
            Manage end-to-end commercial and residential solar installation lifecycles
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-solar-border shadow-xs">
        <div className="relative flex-1">
          <Input
            placeholder="Search by code, title, city, or address..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'all'
                ? 'bg-solar-primary text-white'
                : 'text-solar-text-muted hover:bg-slate-100'
            }`}
          >
            All ({projects.length})
          </button>
          {PROJECT_STATUSES.map((status) => {
            const count = projects.filter((p) => p.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedStatus === status
                    ? 'bg-solar-secondary text-white font-semibold'
                    : 'text-solar-text-muted hover:bg-slate-100'
                }`}
              >
                <span>{status}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedStatus === status
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match criteria"
          description="Try clearing search filters or create a new solar installation contract."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const completedMilestones =
              project.milestones?.filter((m) => m.status === 'completed')?.length || 0;
            const totalMilestones = project.milestones?.length || 6;
            const progressPercent = Math.round(
              (completedMilestones / totalMilestones) * 100
            );

            return (
              <Card
                key={project._id}
                hover
                className="cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="space-y-3">
                  {/* Top Status & Code */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-solar-primary">
                      {project.projectCode}
                    </span>
                    <Badge type="status">{project.status}</Badge>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-base font-bold text-solar-text group-hover:text-solar-secondary line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Address */}
                  <p className="text-xs text-solar-text-muted flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{project.installationAddress}</span>
                  </p>

                  {/* Specs Badge Pills */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      <Zap className="w-3 h-3 text-solar-accent" />
                      <span>{formatCapacity(project.systemCapacityKw)}</span>
                    </div>
                    {project.panelCount > 0 && (
                      <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>{project.panelCount} Panels</span>
                      </div>
                    )}
                    {project.batteryStorageKwh > 0 && (
                      <div className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        {project.batteryStorageKwh} kWh ESS
                      </div>
                    )}
                  </div>

                  {/* Progress Milestone Bar */}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-solar-text-muted">EPC Progress</span>
                      <span className="font-semibold text-solar-primary">
                        {completedMilestones} of {totalMilestones} Milestones ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-solar-secondary rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: Contract Value & Status Quick Changer */}
                <div className="mt-4 pt-3 border-t border-solar-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-solar-text-muted block">Contract Value</span>
                    <span className="text-sm font-bold text-solar-primary">
                      {formatCurrency(project.contractValue)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={project.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleQuickStatusChange(e, project._id)}
                      className="text-[11px] bg-slate-50 border border-solar-border rounded-lg py-1 px-2 font-medium text-solar-text focus:outline-none focus:ring-1 focus:ring-solar-secondary"
                    >
                      {PROJECT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Solar Installation Project"
        subtitle="Configure solar capacity, equipment specifications, and project timeline"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
