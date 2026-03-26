import React from 'react';
import Navigation from './Navigation';
import { useJournal } from '../context/JournalContext';

const Layout = ({ children }) => {
  const { preferences } = useJournal();

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 bg-zinc-50 dark:bg-black selection:bg-primary-500/30 overflow-x-hidden`}>
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-safe pb-safe md:pt-32 md:pb-24 max-w-screen-xl mx-auto px-4 md:px-10">
        <div className="pt-4 md:pt-8 min-h-screen">
          {children}
        </div>
      </main>

      {/* Decorative page fade at the very bottom for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-50 dark:from-black to-transparent pointer-events-none z-40" />
    </div>
  );
};

export default Layout;
