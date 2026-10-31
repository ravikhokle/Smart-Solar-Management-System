import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  SunMedium,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  Leaf,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import GenerationChart from '../components/dashboard/GenerationChart';
import PipelineFunnel from '../components/dashboard/PipelineFunnel';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import { fetchDashboardMetrics, fetchProjects } from '../features/projects/projectSlice';
import { formatCurrency, formatCapacity, formatDate } from '../utils/formatters';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openNewProjectModal } = useOutletContext();
  const { metrics, items: projects, loading } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchProjects());
  }, [dispatch]);

  const kpi = metrics?.kpi || {
    totalProjects: 5,
    totalCapacityKw: 699.2,
    totalCapacityMw: 0.7,
    totalContractValue: 978500,
    activeInstallations: 4,
    completedProjects: 1,
    estimatedCo2OffsetTons: 839,
  };

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-solar-primary to-solar-primary-light text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-teal-200 border border-white/10 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-solar-accent animate-pulse" />
            Solar Operations Center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            EPC Project Operations & Telemetry
          </h1>
          <p className="text-xs text-teal-100/80 max-w-xl">
            Real-time tracking of engineering permits, utility grid interconnections, and photovoltaic generation across all active microgrids.
          </p>
        </div>
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="accent"
            size="md"
            icon={Plus}
            onClick={openNewProjectModal}
          >
            New Installation
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !metrics ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Installed Capacity"
              value={formatCapacity(kpi.totalCapacityKw)}
              subtitle={`${kpi.totalCapacityMw} MW Cumulative Array`}
              icon={Zap}
              trend="+18.4% MoM"
              trendDirection="up"
              iconBgColor="bg-amber-50"
              iconTextColor="text-solar-accent"
            />
            <StatCard
              title="Active Pipeline"
              value={kpi.activeInstallations}
              subtitle="Installations in execution"
              icon={Activity}
              trend="4 on track"
              trendDirection="up"
              iconBgColor="bg-teal-50"
              iconTextColor="text-solar-secondary"
            />
            <StatCard
              title="Portfolio Value"
              value={formatCurrency(kpi.totalContractValue)}
              subtitle="Signed EPC contracts"
              icon={DollarSign}
              trend="+24% target"
              trendDirection="up"
              iconBgColor="bg-blue-50"
              iconTextColor="text-solar-info"
            />
            <StatCard
              title="CO₂ Offset"
              value={`${kpi.estimatedCo2OffsetTons} Tons`}
              subtitle="Annual clean emission reduction"
              icon={Leaf}
              trend="Net Zero Tier"
              trendDirection="up"
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
          </>
        )}
      </div>

      {/* Main Analytics Row: Generation Chart + Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GenerationChart data={metrics?.generationMonthly} />
        </div>
        <div>
          <PipelineFunnel pipeline={metrics?.pipeline} />
        </div>
      </div>

      {/* Active Installations Table Section */}
      <Card
        title="Active Solar Installations"
        subtitle="Current status, hardware specs, and milestone progress"
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/projects')}
          >
            View All ({projects.length})
          </Button>
        }
      >
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="p-4 rounded-xl border border-solar-border hover:border-solar-secondary/50 bg-slate-50/40 hover:bg-white transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-solar-primary">
                    {project.projectCode}
                  </span>
                  <Badge type="status">{project.status}</Badge>
                  <Badge type="priority">{project.priority}</Badge>
                </div>
                <h4 className="text-sm font-semibold text-solar-text hover:text-solar-secondary transition-colors">
                  {project.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-solar-text-muted flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {project.installationAddress}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-solar-accent" />
                    {formatCapacity(project.systemCapacityKw)} DC
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-solar-border">
                <div className="text-left md:text-right">
                  <p className="text-[11px] text-solar-text-muted">Target Commissioning</p>
                  <p className="text-xs font-semibold text-solar-text flex items-center md:justify-end gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDate(project.targetCompletionDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-solar-text-muted">Contract Value</p>
                  <p className="text-sm font-bold text-solar-primary">
                    {formatCurrency(project.contractValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
