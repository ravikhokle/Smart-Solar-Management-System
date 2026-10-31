import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Home,
  Factory,
  Search,
} from 'lucide-react';
import customerService from '../services/customer.service';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import CustomerForm from '../components/forms/CustomerForm';
import { formatCurrency } from '../utils/formatters';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await customerService.createCustomer(formData);
      setCustomers([res.data, ...customers]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      (c.address?.city && c.address.city.toLowerCase().includes(search.toLowerCase()))
  );

  const getClientIcon = (type) => {
    switch (type) {
      case 'Commercial':
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'Industrial':
        return <Factory className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Home className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const columns = [
    {
      header: 'Client / Company',
      key: 'name',
      render: (item) => (
        <div>
          <span className="font-bold text-solar-primary block">{item.name}</span>
          {item.company && (
            <span className="text-[11px] text-solar-text-muted">{item.company}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'customerType',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
          {getClientIcon(item.customerType)}
          <span>{item.customerType}</span>
        </span>
      ),
    },
    {
      header: 'Contact Info',
      key: 'email',
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <span className="text-solar-text flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {item.email}
          </span>
          <span className="text-solar-text-muted text-[11px] flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {item.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Site Location & Roof',
      key: 'address',
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <span className="text-solar-text font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {item.address?.city}, {item.address?.state}
          </span>
          <span className="text-[11px] text-solar-text-muted block">
            Roof: {item.roofType || 'Composite Shingle'}
          </span>
        </div>
      ),
    },
    {
      header: 'Avg Monthly Power Bill',
      key: 'avgMonthlyPowerBill',
      align: 'right',
      render: (item) => (
        <span className="text-xs font-bold text-solar-primary">
          {formatCurrency(item.avgMonthlyPowerBill)}/mo
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
            Solar Clients & Commercial Accounts
          </h1>
          <p className="text-xs sm:text-sm text-solar-text-muted mt-0.5">
            Residential homeowners, commercial facilities, and industrial manufacturing clients
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Client
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-solar-border shadow-xs">
        <Input
          placeholder="Search client directory by name, email, company, or city..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 && !loading ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Register a new residential homeowner or commercial client account."
          actionLabel="Add Client"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredCustomers}
          isLoading={loading}
          emptyMessage="No clients matching your search query"
        />
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Solar Client Account"
        subtitle="Onboard customer for site audit, utility bill analysis, and solar proposals"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default CustomersPage;
