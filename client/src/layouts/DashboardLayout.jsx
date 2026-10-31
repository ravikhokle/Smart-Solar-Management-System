import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import api, { toast } from '../services/api.js';
import { dt } from '../utils/format.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales_executive', 'warehouse_manager', 'technician'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'sales_executive'] },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquare, roles: ['admin', 'sales_executive'] },
  { to: '/surveys', label: 'Site surveys', icon: ClipboardCheck, roles: ['admin', 'sales_executive', 'technician'] },
  { to: '/quotations', label: 'Quotations', icon: FileText, roles: ['admin', 'sales_executive'] },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, roles: ['admin', 'warehouse_manager'] },
  { to: '/serials', label: 'Serial numbers', icon: QrCode, roles: ['admin', 'warehouse_manager', 'technician'] },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'sales_executive', 'warehouse_manager'] },
  { to: '/payments', label: 'Payments', icon: Wallet, roles: ['admin', 'sales_executive'] },
  { to: '/technicians', label: 'Technicians', icon: Wrench, roles: ['admin'] },
  { to: '/installations', label: 'Installations', icon: CalendarDays, roles: ['admin', 'technician'] },
  { to: '/warranties', label: 'Warranties', icon: Shield, roles: ['admin', 'sales_executive', 'technician', 'warehouse_manager'] },
  { to: '/tickets', label: 'Service tickets', icon: LifeBuoy, roles: ['admin', 'technician'] },
  { to: '/finance', label: 'Finance & reports', icon: PieChart, roles: ['admin'] },
  { to: '/subsidies', label: 'Subsidies', icon: Landmark, roles: ['admin'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function DashboardLayout() {
  const user = useSelector((s) => s.auth.user);
  const open = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const items = NAV.filter((i) => i.roles.includes(user?.role));

  useEffect(() => {
    api.get('/finance/notifications')
      .then((res) => setNotifications(res.data.data || []))
      .catch((error) => toast('error', error.response?.data?.message || 'Unable to load notifications'));
  }, []);

  const unread = notifications.filter((notification) => !notification.read).length;
  const markRead = async (notification) => {
    if (notification.read) return;
    await api.patch(`/finance/notifications/${notification._id}/read`);
    setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, read: true } : item));
    toast('success', 'Marked read');
  };

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
          <div className="relative flex items-center gap-4">
            <button
              className="relative text-solar-charcoal"
              aria-label="Notifications"
              onClick={() => setShowNotifications((value) => !value)}
            >
              <Bell size={19} />
              {unread > 0 && <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-solar-orange px-1 text-[10px] text-white">{unread}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-24 top-10 z-50 w-80 rounded-lg border border-solar-border bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between font-semibold">
                  <span>Notifications</span>
                  {unread > 0 && <span className="text-xs text-solar-muted">{unread} unread</span>}
                </div>
                {!notifications.length && <p className="text-sm text-solar-muted">No notifications yet.</p>}
                <div className="max-h-80 space-y-2 overflow-auto">
                  {notifications.slice(0, 8).map((notification) => (
                    <button
                      key={notification._id}
                      className={`w-full rounded-md p-2 text-left text-sm ${notification.read ? 'opacity-60' : 'bg-orange-50'}`}
                      onClick={() => {
                        markRead(notification);
                        if (notification.link) navigate(notification.link);
                      }}
                    >
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-xs text-solar-muted">{notification.body}</div>
                      <div className="mt-1 text-[11px] text-solar-muted">{dt(notification.createdAt)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => navigate('/profile')} className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs capitalize text-solar-muted">{user?.role?.replaceAll('_', ' ')}</div>
            </button>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
