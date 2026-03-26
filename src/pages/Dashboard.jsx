import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Heart, Sparkles, ChevronRight, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { journals, preferences } = useJournal();
  const userName = preferences.userName || 'Alex';

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const recentJournals = useMemo(() => {
    return [...journals].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [journals]);

  const extractText = (content) => {
    if (Array.isArray(content)) {
      return content.find(b => b.type === 'text')?.content || 'View Entry';
    }
    return content || 'View Entry';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Header section */}
      <motion.header
        variants={itemVariants}
        className="space-y-2 sticky top-0 md:top-20 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-2xl pt-4 pb-3 md:pb-8 transition-all px-2"
      >
        <p className="text-sm font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest leading-none">
          {formatDate(new Date())}
        </p>
        <h1 className="text-5xl md:text-5xl font-headline font-black text-zinc-900 dark:text-zinc-50 tracking-tighter leading-tight mt-1">
          Welcome back, <br className="md:hidden" />
          <span className="text-primary-600">{userName}</span>
        </h1>
      </motion.header>

      {/* Quick Action */}
      <motion.section variants={itemVariants} className="max-w-6xl mx-auto w-full px-2 mt-2 md:mt-12 mb-8">
        <Link
          to="/new"
          className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-primary-500/10 border border-zinc-100 dark:border-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 group"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
              <PenLine size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Capture a moment</h2>
              <p className="text-sm font-medium text-zinc-500">What's on your mind today?</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
            <ChevronRight size={20} strokeWidth={3} />
          </div>
        </Link>
      </motion.section>

      {/* Vertical Feed */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-headline font-bold text-zinc-900 dark:text-zinc-50">Recent Entries</h2>
          <Link to="/timeline" className="text-primary-700 dark:text-primary-400 font-bold text-sm hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentJournals.map((journal) => (
            <Link
              key={journal.id}
              to={`/edit/${journal.id}`}
              className="block bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-premium border border-zinc-50 dark:border-zinc-800/50 active:scale-[0.98] transition-all h-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex flex-col items-center justify-center text-primary-600 dark:text-primary-400 font-body">
                    <span className="text-sm font-bold uppercase leading-none text-primary-700 dark:text-primary-400">{new Date(journal.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-extrabold leading-none mt-0.5 text-zinc-900 dark:text-zinc-50">{new Date(journal.date).getDate()}</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline font-bold text-lg text-zinc-900 dark:text-zinc-50 line-clamp-1">{journal.title || 'Untitled'}</h3>
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{journal.mood}</span>
                  </div>
                </div>
                {journal.isFavorite && (
                  <Heart size={18} fill="currentColor" className="text-rose-500 mt-1" />
                )}
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-3 mb-4 font-body">
                {extractText(journal.content)}
              </p>

              {journal.image && (
                <div className="w-full h-32 md:h-32 rounded-2xl overflow-hidden mb-4 border border-zinc-100 dark:border-zinc-800">
                  <img src={journal.image} alt={journal.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}

              {journal.tags && journal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                  {journal.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-widest rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="absolute bottom-5 right-5 text-primary-600 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 duration-300 pointer-events-none">
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}

          {journals.length === 0 && (
            <div className="text-center py-20 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Sparkles size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">Your journal is empty.</p>
              <p className="text-sm text-zinc-400">Tap 'Capture a moment' to begin.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Dashboard;
