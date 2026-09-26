import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Kanban,
  BarChart3,
  User,
  Bell,
  LogOut,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useNotifications, useMarkNotificationRead } from '../api/queries.js';

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Internships', to: '/internships', icon: Compass },
    { label: 'Kanban Tracker', to: '/tracker', icon: Kanban },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Profile & Resume', to: '/profile', icon: User }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper text-ink">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-moss flex items-center justify-center text-white shadow-soft font-bold text-base">
              CP
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-ink-900 block leading-tight">
                CareerPilot AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-moss">
                Agentic CRM
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-moss text-white shadow-soft'
                      : 'text-ink-600 hover:text-ink-950 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-ink-700 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-ink-900 truncate">{user?.name || 'Student'}</p>
                <p className="text-[11px] text-ink-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-ink-400 hover:text-coral hover:bg-coral-subtle transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-moss flex items-center justify-center text-white font-bold text-xs">
              CP
            </div>
            <span className="font-bold text-sm text-ink-900">CareerPilot</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-ink-500 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-moss animate-pulse" />
            <span>Agentic Orchestration Active</span>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-elevated p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-ink-900">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-coral-subtle text-coral">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-ink-400 text-center py-6">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`py-3 text-xs flex items-start justify-between gap-3 ${
                              !notif.read ? 'bg-moss/5 -mx-2 px-2 rounded-lg' : ''
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-ink-900">{notif.title}</p>
                              <p className="text-ink-600">{notif.message}</p>
                              <p className="text-[10px] text-ink-400">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => markReadMutation.mutate(notif._id)}
                                title="Mark as read"
                                className="text-moss hover:text-moss-dark p-1 rounded"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-xl text-ink-500 hover:text-coral transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-elevated">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-moss font-bold' : 'text-ink-500 hover:text-ink-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
