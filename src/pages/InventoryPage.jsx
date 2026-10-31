import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import inventoryService from '../services/inventory.service';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import InventoryForm from '../components/forms/InventoryForm';
import { formatCurrency } from '../utils/formatters';
import { INVENTORY_CATEGORIES } from '../utils/constants';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [allRes, alertRes] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getLowStockAlerts(),
      ]);
      setItems(allRes.data);
      setLowStock(alertRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await inventoryService.createItem(formData);
      setItems([...items, res.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const columns = [
    {
      header: 'SKU / Code',
      key: 'sku',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-solar-primary">
          {item.sku}
        </span>
      ),
    },
    {
      header: 'Equipment Name & Specs',
      key: 'name',
      render: (item) => (
        <div>
          <span className="font-semibold text-solar-text block">{item.name}</span>
          <span className="text-[11px] text-solar-text-muted">
            Mfg: {item.manufacturer} {item.modelNumber ? `| ${item.modelNumber}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (item) => (
        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
          {item.category}
        </span>
      ),
    },
    {
      header: 'Stock Levels',
      key: 'quantityInStock',
      render: (item) => {
        const isLow = item.quantityInStock <= item.minThreshold;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold ${
                  isLow ? 'text-solar-warning' : 'text-solar-primary'
                }`}
              >
                {item.quantityInStock} Units
              </span>
              {isLow && (
                <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.2 rounded">
                  Low Stock
                </span>
              )}
            </div>
            <span className="text-[10px] text-solar-text-muted block">
              Min Reorder Threshold: {item.minThreshold}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Unit Cost / Price',
      key: 'unitCost',
      render: (item) => (
        <div className="text-xs">
          <span className="text-solar-text-muted">Cost: {formatCurrency(item.unitCost)}</span>
          <span className="font-semibold text-solar-primary block">
            List: {formatCurrency(item.unitPrice)}
          </span>
        </div>
      ),
    },
    {
      header: 'Warehouse Bay',
      key: 'warehouseLocation',
      render: (item) => (
        <span className="text-[11px] text-solar-text flex items-center gap-1">
          <Warehouse className="w-3 h-3 text-slate-400" />
          {item.warehouseLocation}
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
            Solar Equipment & Parts Inventory
          </h1>
          <p className="text-xs sm:text-sm text-solar-text-muted mt-0.5">
            Track solar PV modules, string & microinverters, battery energy storage, and racking
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Equipment
        </Button>
      </div>

      {/* Low Stock Notification Banner */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-solar-warning shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block">
              Procurement Alert: {lowStock.length} items below minimum safety threshold
            </span>
            <p className="mt-0.5 text-amber-800">
              {lowStock.map((i) => `${i.name} (${i.quantityInStock} left)`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-solar-border shadow-xs">
        <div className="relative flex-1">
          <Input
            placeholder="Search parts by SKU, product name, or manufacturer..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-solar-primary text-white'
                : 'text-solar-text-muted hover:bg-slate-100'
            }`}
          >
            All Parts
          </button>
          {INVENTORY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-solar-secondary text-white font-semibold'
                  : 'text-solar-text-muted hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 && !loading ? (
        <EmptyState
          icon={Package}
          title="No inventory records found"
          description="Add solar modules or balance of systems to keep track of installation allocations."
          actionLabel="Add Part"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredItems}
          isLoading={loading}
          emptyMessage="No matching inventory items"
        />
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Equipment to Inventory"
        subtitle="Catalog solar hardware with warranty, supplier SKU, and stock thresholds"
      >
        <InventoryForm
          onSubmit={handleCreateItem}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
