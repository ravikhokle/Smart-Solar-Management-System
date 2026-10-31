import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { INVENTORY_CATEGORIES } from '../../utils/constants';

const InventoryForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    category: initialData?.category || 'Solar Panels',
    manufacturer: initialData?.manufacturer || '',
    modelNumber: initialData?.modelNumber || '',
    quantityInStock: initialData?.quantityInStock || 50,
    minThreshold: initialData?.minThreshold || 15,
    unitCost: initialData?.unitCost || 120,
    unitPrice: initialData?.unitPrice || 180,
    warrantyYears: initialData?.warrantyYears || 25,
    warehouseLocation: initialData?.warehouseLocation || 'Warehouse Alpha - Bay 1',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setErrors({
        name: !formData.name ? 'Part name is required' : null,
        sku: !formData.sku ? 'SKU is required' : null,
      });
      return;
    }

    onSubmit({
      ...formData,
      quantityInStock: Number(formData.quantityInStock),
      minThreshold: Number(formData.minThreshold),
      unitCost: Number(formData.unitCost),
      unitPrice: Number(formData.unitPrice),
      warrantyYears: Number(formData.warrantyYears),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Part / Equipment Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g. Canadian Solar 420W Monocrystalline"
          required
        />
        <Input
          label="SKU / Barcode"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          error={errors.sku}
          placeholder="e.g. SOL-MOD-420-CS"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Category"
          name="category"
          options={INVENTORY_CATEGORIES}
          value={formData.category}
          onChange={handleChange}
        />
        <Input
          label="Manufacturer"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          required
        />
        <Input
          label="Model Number"
          name="modelNumber"
          value={formData.modelNumber}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Input
          label="Units in Stock"
          name="quantityInStock"
          type="number"
          value={formData.quantityInStock}
          onChange={handleChange}
        />
        <Input
          label="Low Stock Alert Threshold"
          name="minThreshold"
          type="number"
          value={formData.minThreshold}
          onChange={handleChange}
        />
        <Input
          label="Unit Cost ($)"
          name="unitCost"
          type="number"
          value={formData.unitCost}
          onChange={handleChange}
        />
        <Input
          label="Selling Price ($)"
          name="unitPrice"
          type="number"
          value={formData.unitPrice}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Warranty (Years)"
          name="warrantyYears"
          type="number"
          value={formData.warrantyYears}
          onChange={handleChange}
        />
        <Input
          label="Warehouse Storage Bay"
          name="warehouseLocation"
          value={formData.warehouseLocation}
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
          {initialData ? 'Update Inventory' : 'Add Inventory Item'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
