import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  LogOut,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import Button from '../common/Button';
import api from '../../services/api';

const TopNavbar = ({ setIsMobileOpen, onQuickNewProject }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, label: 'Checking...' });

  // Poll or check system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.data?.database) {
          const isConnected = res.data.data.database.connected;
          setDbStatus({
            connected: isConnected,
            label: isConnected ? 'Atlas DB Active' : 'In-Memory Store (Dev)',
          });
        }
      } catch {
        setDbStatus({
          connected: false,
          label: 'In-Memory Store (Dev)',
        });
      }
    };
    checkHealth();
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Site Survey Completed',
      desc: 'Apex Logistics rooftop feasibility approved (180 kW)',
      time: '12m ago',
      read: false,
    },
    {
      id: 2,
      title: 'Permit Issued',
      desc: 'Highland Oaks Agrivoltaic permit issued by Sedona AHJ',
      time: '1h ago',
      read: false,
    },
    {
      id: 3,
      title: 'Low Stock Alert',
      desc: 'Enphase Microinverters reached reorder threshold (94 units left)',
      time: '3h ago',
      read: true,
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-solar-border shadow-xs px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Trigger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-solar-text hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            placeholder="Search projects, client records, panels, surveys..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-solar-border rounded-lg text-xs text-solar-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-solar-secondary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: DB Status + Quick Actions + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Health / MongoDB Indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 border border-teal-200 text-solar-primary"
          title="Backend Database Status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus.connected ? 'bg-solar-secondary animate-pulse' : 'bg-solar-accent'
            }`}
          />
          <Database className="w-3 h-3 text-solar-secondary" />
          <span>{dbStatus.label}</span>
        </div>

        {/* Quick New Project Button */}
        {onQuickNewProject && (
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={onQuickNewProject}
            className="hidden sm:inline-flex"
          >
            New Project
          </Button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-solar-text-muted hover:text-solar-primary hover:bg-slate-100 relative focus:outline-none transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-solar-accent ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-modal border border-solar-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-solar-border bg-slate-50/70 flex items-center justify-between">
                <span className="text-xs font-bold text-solar-primary">Notifications</span>
                <span className="text-[10px] text-solar-secondary font-semibold cursor-pointer hover:underline">
                  Mark all as read
                </span>
              </div>
              <div className="divide-y divide-solar-border max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-left transition-colors hover:bg-slate-50/70 ${
                      !n.read ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-solar-text">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-solar-text-muted mt-0.5 line-clamp-2">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-solar-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-solar-text leading-tight">
                {user?.name || 'Solar Operator'}
              </p>
              <p className="text-[10px] text-solar-text-muted leading-tight capitalize">
                {user?.role?.replace('_', ' ') || 'Admin'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-modal border border-solar-border z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-solar-border mb-1">
                <p className="text-xs font-bold text-solar-primary">{user?.name}</p>
                <p className="text-[11px] text-solar-text-muted truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-solar-danger rounded-lg hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
