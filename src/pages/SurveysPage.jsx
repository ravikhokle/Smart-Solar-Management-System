import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Compass,
  Sun,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import surveyService from '../services/survey.service';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import SurveyForm from '../components/forms/SurveyForm';
import { formatDate } from '../utils/formatters';

const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const res = await surveyService.getSurveys();
      setSurveys(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await surveyService.createSurvey(formData);
      setSurveys([res.data, ...surveys]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Audit ID',
      key: 'surveyCode',
      render: (item) => (
        <span className="font-bold text-solar-primary">{item.surveyCode}</span>
      ),
    },
    {
      header: 'Client / Site',
      key: 'customerName',
      render: (item) => (
        <div>
          <span className="font-semibold text-solar-text block">
            {item.customerName || item.customer?.name || 'Commercial Client'}
          </span>
          <span className="text-[11px] text-solar-text-muted">
            Auditor: {item.auditorName}
          </span>
        </div>
      ),
    },
    {
      header: 'Roof Condition & Tilt',
      key: 'roofCondition',
      render: (item) => (
        <div className="space-y-0.5">
          <span className="font-medium text-solar-text block">
            {item.roofCondition}
          </span>
          <span className="text-[11px] text-solar-text-muted flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" />
            {item.roofTiltDegrees}° Pitch | {item.azimuthOrientation}
          </span>
        </div>
      ),
    },
    {
      header: 'Shading & Service',
      key: 'shadingPercentage',
      render: (item) => (
        <div className="space-y-0.5">
          <span className="text-solar-text font-medium flex items-center gap-1">
            <Sun className="w-3 h-3 text-solar-accent" />
            {item.shadingPercentage}% Solar Shading
          </span>
          <span className="text-[11px] text-solar-text-muted flex items-center gap-1">
            <Zap className="w-3 h-3 text-slate-400" />
            {item.electricalServiceAmps}A Service Panel
          </span>
        </div>
      ),
    },
    {
      header: 'MPU Required',
      key: 'mainPanelUpgradeRequired',
      render: (item) =>
        item.mainPanelUpgradeRequired ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Upgrade Needed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compatible
          </span>
        ),
    },
    {
      header: 'Audit Status',
      key: 'status',
      render: (item) => <Badge type="status">{item.status}</Badge>,
    },
    {
      header: 'Date',
      key: 'auditDate',
      align: 'right',
      render: (item) => (
        <span className="text-solar-text-muted text-[11px]">
          {formatDate(item.auditDate)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-solar-primary">
            Solar Site Audits & Assessments
          </h1>
          <p className="text-xs sm:text-sm text-solar-text-muted mt-0.5">
            Structural roof integrity, solar irradiance shading, and main service panel evaluations
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Schedule Site Audit
        </Button>
      </div>

      {/* Table */}
      {surveys.length === 0 && !loading ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No site audits recorded"
          description="Schedule a solar auditor or field technician to perform a physical roof assessment."
          actionLabel="Schedule Audit"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={surveys}
          isLoading={loading}
          emptyMessage="No site surveys found"
        />
      )}

      {/* Schedule Audit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Solar Site Audit"
        subtitle="Record electrical specifications, roof angle, and shading measurements"
      >
        <SurveyForm
          onSubmit={handleCreateSurvey}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default SurveysPage;
