import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const SurveyForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || '',
    auditorName: initialData?.auditorName || 'Sarah Connor',
    roofCondition: initialData?.roofCondition || 'Good',
    roofTiltDegrees: initialData?.roofTiltDegrees || 20,
    azimuthOrientation: initialData?.azimuthOrientation || 'South (180°)',
    shadingPercentage: initialData?.shadingPercentage || 5,
    electricalServiceAmps: initialData?.electricalServiceAmps || 200,
    mainPanelUpgradeRequired: initialData?.mainPanelUpgradeRequired || false,
    status: initialData?.status || 'Scheduled',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName) {
      setErrors({ customerName: 'Customer name is required' });
      return;
    }
    onSubmit({
      ...formData,
      roofTiltDegrees: Number(formData.roofTiltDegrees),
      shadingPercentage: Number(formData.shadingPercentage),
      electricalServiceAmps: Number(formData.electricalServiceAmps),
      customer: initialData?.customer || '67c1e0020000000000000001',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Customer / Site Name"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          error={errors.customerName}
          placeholder="Client site name"
          required
        />
        <Input
          label="Auditor / Field Engineer"
          name="auditorName"
          value={formData.auditorName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Roof Condition"
          name="roofCondition"
          options={['Excellent', 'Good', 'Fair', 'Requires Repair / Replacement']}
          value={formData.roofCondition}
          onChange={handleChange}
        />
        <Input
          label="Roof Tilt (Degrees)"
          name="roofTiltDegrees"
          type="number"
          value={formData.roofTiltDegrees}
          onChange={handleChange}
        />
        <Select
          label="Azimuth / Orientation"
          name="azimuthOrientation"
          options={[
            'South (180°)',
            'South-West (225°)',
            'West (270°)',
            'East (90°)',
            'North-East (45°)',
          ]}
          value={formData.azimuthOrientation}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Annual Shading (%)"
          name="shadingPercentage"
          type="number"
          min="0"
          max="100"
          value={formData.shadingPercentage}
          onChange={handleChange}
        />
        <Select
          label="Main Service Panel (Amps)"
          name="electricalServiceAmps"
          options={['100', '125', '150', '200', '400']}
          value={formData.electricalServiceAmps}
          onChange={handleChange}
        />
        <Select
          label="Audit Status"
          name="status"
          options={['Scheduled', 'In Progress', 'Completed', 'Action Required']}
          value={formData.status}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="mainPanelUpgradeRequired"
          name="mainPanelUpgradeRequired"
          checked={formData.mainPanelUpgradeRequired}
          onChange={handleChange}
          className="h-4 w-4 rounded border-solar-border text-solar-secondary focus:ring-solar-secondary"
        />
        <label htmlFor="mainPanelUpgradeRequired" className="text-xs font-medium text-solar-text">
          Main electrical panel upgrade required (MPU)
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-solar-text mb-1.5 uppercase tracking-wider">
          Site Audit Observations
        </label>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notes on conduit run path, attic rafter measurements, meter collar fitment..."
          className="w-full rounded-lg border border-solar-border p-3 text-xs text-solar-text focus:outline-none focus:ring-2 focus:ring-solar-secondary"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-solar-border">
        {onCancel && (
          <Button variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="secondary" size="md" type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Survey' : 'Schedule Site Audit'}
        </Button>
      </div>
    </form>
  );
};

export default SurveyForm;
