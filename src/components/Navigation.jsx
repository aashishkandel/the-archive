import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, List, BarChart2, PlusCircle, Settings as SettingsIcon } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const isEditor = location.pathname.includes('/new') || location.pathname.includes('/edit');

  // Hide navigation entirely when in the editor for a distraction-free experience
  if (isEditor) return null;

  const navItems = [
    { to: '/', icon: Home, label: 'Today' },
    { to: '/timeline', icon: List, label: 'Archive' },
    { to: '/new', icon: PlusCircle, label: 'Write', isPrimary: true },
    { to: '/insights', icon: BarChart2, label: 'Insights' },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  return (
    <>
      {/* Mobile-First Bottom Nav (Native App Style) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-200/50 dark:border-zinc-800/50 md:hidden">
        <div className="flex justify-around items-end pt-3 pb-safe px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 transition-all duration-300 py-2
                ${isActive ? 'text-primary-600 scale-110' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}
                ${item.isPrimary ? '-translate-y-4' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${item.isPrimary ? 'w-14 h-14 bg-primary-600 text-white rounded-[1.25rem] shadow-xl shadow-primary-500/40 rotate-45' : 'mb-1'}`}>
                    <div className={item.isPrimary ? '-rotate-45' : ''}>
                      <item.icon
                        size={item.isPrimary ? 28 : (isActive ? 24 : 22)}
                        strokeWidth={isActive || item.isPrimary ? 2.5 : 2}
                      />
                    </div>
                    {isActive && !item.isPrimary && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-1.5 w-1 h-1 bg-primary-600 rounded-full"
                      />
                    )}
                  </div>
                  {!item.isPrimary && (
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isActive ? 'text-primary-600' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Clean Desktop Sidebar/Top Nav */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center justify-between px-10 h-20 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl rotate-12 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <List size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-headline font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
              The Archive
            </h1>
          </div>
          <div className="flex items-center gap-10">
            {navItems.filter(i => !i.isPrimary).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative flex items-center gap-2.5 font-black text-[11px] uppercase tracking-[0.2em] transition-all py-2 group
                  ${isActive ? 'text-primary-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}
                `}
              >
                <item.icon size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                {item.label}
                {location.pathname === item.to && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                  />
                )}
              </NavLink>
            ))}
            <NavLink
              to="/new"
              className="relative flex items-center gap-6 px-4 group py-2"
            >
              {/* Icon with expanding Liquid Aura */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full scale-0 group-hover:scale-[2.5] opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out" />
                <PlusCircle
                  size={26}
                  strokeWidth={1.5}
                  className="text-primary-500 relative z-10 transition-all duration-700 group-hover:rotate-45 group-hover:scale-110"
                />
              </div>

              {/* Editorial Typography & Flowing Wave */}
              <div className="flex flex-col relative">
                <span className="text-[14px] font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-zinc-50 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-500">
                  New Entry
                </span>

                {/* Animated Liquid Underline */}
                <div className="w-full h-4 -mt-1 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-primary-500">
                      <path
                        d="M 0 10 C 25 2, 25 18, 50 10 C 75 2, 75 18, 100 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
