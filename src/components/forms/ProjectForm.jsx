import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { PROJECT_STATUSES } from '../../utils/constants';

const ProjectForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    customerName: initialData?.customerName || initialData?.customer?.name || '',
    systemCapacityKw: initialData?.systemCapacityKw || 25,
    panelCount: initialData?.panelCount || 60,
    panelModel: initialData?.panelModel || 'Tier-1 420W Monocrystalline PERC',
    inverterModel: initialData?.inverterModel || 'SolarEdge Energy Hub 7.6kW',
    batteryStorageKwh: initialData?.batteryStorageKwh || 0,
    status: initialData?.status || 'Site Audit',
    priority: initialData?.priority || 'Medium',
    contractValue: initialData?.contractValue || 45000,
    installationAddress: initialData?.installationAddress || '',
    targetCompletionDate: initialData?.targetCompletionDate
      ? new Date(initialData.targetCompletionDate).toISOString().split('T')[0]
      : '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.installationAddress.trim())
      newErrors.installationAddress = 'Installation address is required';
    if (!formData.systemCapacityKw || Number(formData.systemCapacityKw) <= 0)
      newErrors.systemCapacityKw = 'Capacity must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      systemCapacityKw: Number(formData.systemCapacityKw),
      panelCount: Number(formData.panelCount),
      batteryStorageKwh: Number(formData.batteryStorageKwh),
      contractValue: Number(formData.contractValue),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <Input
        label="Project Title"
        name="title"
        placeholder="e.g. Apex Logistics Solar Hub Phase 2"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Customer / Client Name"
          name="customerName"
          placeholder="e.g. Acme Industrial Corp"
          value={formData.customerName}
          onChange={handleChange}
        />
        <Input
          label="System Capacity (kW DC)"
          name="systemCapacityKw"
          type="number"
          step="0.1"
          placeholder="e.g. 50"
          value={formData.systemCapacityKw}
          onChange={handleChange}
          error={errors.systemCapacityKw}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Panel Model & Specs"
          name="panelModel"
          placeholder="e.g. Canadian Solar 420W Bifacial"
          value={formData.panelModel}
          onChange={handleChange}
        />
        <Input
          label="Inverter Model"
          name="inverterModel"
          placeholder="e.g. SolarEdge 50kW Commercial"
          value={formData.inverterModel}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Panel Count"
          name="panelCount"
          type="number"
          value={formData.panelCount}
          onChange={handleChange}
        />
        <Input
          label="Battery Storage (kWh)"
          name="batteryStorageKwh"
          type="number"
          placeholder="0 if none"
          value={formData.batteryStorageKwh}
          onChange={handleChange}
        />
        <Input
          label="Contract Value ($)"
          name="contractValue"
          type="number"
          value={formData.contractValue}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Pipeline Stage"
          name="status"
          options={PROJECT_STATUSES}
          value={formData.status}
          onChange={handleChange}
        />
        <Select
          label="Priority Level"
          name="priority"
          options={['Low', 'Medium', 'High', 'Urgent']}
          value={formData.priority}
          onChange={handleChange}
        />
        <Input
          label="Target Commissioning Date"
          name="targetCompletionDate"
          type="date"
          value={formData.targetCompletionDate}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Site Installation Address"
        name="installationAddress"
        placeholder="Street, City, State, ZIP"
        value={formData.installationAddress}
        onChange={handleChange}
        error={errors.installationAddress}
        required
      />

      <div>
        <label className="block text-xs font-semibold text-solar-text mb-1.5 uppercase tracking-wider">
          Engineering & Site Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add site access instructions, grid connection details, or AHJ requirements..."
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
          {initialData ? 'Save Changes' : 'Create Solar Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
