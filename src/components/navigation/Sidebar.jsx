import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SunMedium,
  ClipboardCheck,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Solar Projects', path: '/projects', icon: SunMedium },
  { name: 'Site Audits', path: '/surveys', icon: ClipboardCheck },
  { name: 'Inventory & Parts', path: '/inventory', icon: Package },
  { name: 'Clients & Leads', path: '/customers', icon: Users },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useSelector((state) => state.auth);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-solar-primary text-white select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-solar-accent to-solar-secondary flex items-center justify-center shrink-0 shadow-md">
            <SunMedium className="w-5 h-5 text-solar-primary stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                HeliosFlow
                <span className="text-[9px] bg-solar-accent/20 text-solar-accent border border-solar-accent/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                  B2B
                </span>
              </span>
              <span className="text-[10px] text-teal-200/80 truncate">
                Solar Management OS
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-teal-200/70 hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-teal-300/60 uppercase tracking-wider">
              Solar Operations
            </p>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-solar-secondary text-white font-semibold shadow-sm'
                    : 'text-teal-100/80 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Information Footer */}
      <div className="p-3 border-t border-white/10 bg-solar-primary-dark/40 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solar-secondary to-teal-400 flex items-center justify-center font-bold text-white text-xs shadow-inner shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Solar Operator'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-teal-300">
                <ShieldCheck className="w-3 h-3 text-solar-accent" />
                <span className="capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out border-r border-solar-border shadow-md ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
