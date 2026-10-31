import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { CUSTOMER_TYPES, ROOF_TYPES } from '../../utils/constants';

const CustomerForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    customerType: initialData?.customerType || 'Residential',
    street: initialData?.address?.street || '',
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || 'AZ',
    zipCode: initialData?.address?.zipCode || '',
    roofType: initialData?.roofType || 'Composite Shingle',
    avgMonthlyPowerBill: initialData?.avgMonthlyPowerBill || 350,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Client name is required' });
      return;
    }
    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      customerType: formData.customerType,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'USA',
      },
      roofType: formData.roofType,
      avgMonthlyPowerBill: Number(formData.avgMonthlyPowerBill),
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Client / Contact Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Input
          label="Company / Enterprise (Optional)"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Select
          label="Client Category"
          name="customerType"
          options={CUSTOMER_TYPES}
          value={formData.customerType}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Street Address"
          name="street"
          value={formData.street}
          onChange={handleChange}
        />
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
        <Input
          label="State / ZIP"
          name="zipCode"
          placeholder="State, ZIP"
          value={formData.zipCode}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Roof Construction Type"
          name="roofType"
          options={ROOF_TYPES}
          value={formData.roofType}
          onChange={handleChange}
        />
        <Input
          label="Avg Monthly Power Bill ($)"
          name="avgMonthlyPowerBill"
          type="number"
          value={formData.avgMonthlyPowerBill}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-solar-border">
        {onCancel && (
          <Button variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="secondary" size="md" type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Client' : 'Add Client Record'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
