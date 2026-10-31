import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardCheck,
  FileText,
  Warehouse,
  QrCode,
  ShoppingCart,
  Wallet,
  Wrench,
  CalendarDays,
  Shield,
  LifeBuoy,
  PieChart,
  Landmark,
  Bell,
  UserCog,
  Settings,
  LogOut,
  Menu,
  Sun,
} from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import { setSidebar } from '../features/ui/uiSlice.js';
import ToastStack from '../components/common/ToastStack.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales_executive', 'warehouse_manager', 'technician'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'sales_executive', 'technician'] },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquare, roles: ['admin', 'sales_executive'] },
  { to: '/surveys', label: 'Site surveys', icon: ClipboardCheck, roles: ['admin', 'sales_executive', 'technician'] },
  { to: '/quotations', label: 'Quotations', icon: FileText, roles: ['admin', 'sales_executive'] },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, roles: ['admin', 'warehouse_manager', 'sales_executive'] },
  { to: '/serials', label: 'Serial numbers', icon: QrCode, roles: ['admin', 'warehouse_manager', 'technician'] },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'sales_executive', 'warehouse_manager', 'technician'] },
  { to: '/payments', label: 'Payments', icon: Wallet, roles: ['admin', 'sales_executive'] },
  { to: '/technicians', label: 'Technicians', icon: Wrench, roles: ['admin', 'sales_executive'] },
  { to: '/installations', label: 'Installations', icon: CalendarDays, roles: ['admin', 'sales_executive', 'technician'] },
  { to: '/warranties', label: 'Warranties', icon: Shield, roles: ['admin', 'sales_executive', 'technician', 'warehouse_manager'] },
  { to: '/tickets', label: 'Service tickets', icon: LifeBuoy, roles: ['admin', 'sales_executive', 'technician'] },
  { to: '/finance', label: 'Finance', icon: PieChart, roles: ['admin'] },
  { to: '/subsidies', label: 'Subsidies', icon: Landmark, roles: ['admin', 'sales_executive'] },
  { to: '/reports', label: 'Reports', icon: PieChart, roles: ['admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'sales_executive', 'warehouse_manager', 'technician'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function DashboardLayout() {
  const user = useSelector((s) => s.auth.user);
  const open = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = NAV.filter((i) => i.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-solar-cream">
      <ToastStack />
      {open && (
        <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => dispatch(setSidebar(false))} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-solar-border bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-solar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-solar-charcoal text-solar-orange">
            <Sun size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">HELIOSFLOW</div>
            <div className="text-[11px] text-solar-muted">Operations</div>
          </div>
        </div>
        <nav className="h-[calc(100%-8rem)] overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => dispatch(setSidebar(false))}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-orange-50 font-medium text-solar-orange' : 'text-solar-charcoal hover:bg-solar-cream'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-solar-border p-3">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-solar-muted hover:bg-solar-cream"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-solar-border bg-white px-4">
          <button className="lg:hidden" onClick={() => dispatch(setSidebar(true))}>
            <Menu />
          </button>
          <div className="text-sm text-solar-muted">Rooftop solar operations</div>
          <button onClick={() => navigate('/profile')} className="text-right">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs capitalize text-solar-muted">{user?.role?.replaceAll('_', ' ')}</div>
          </button>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
