import React, { useState, useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Heart, Hash, Sparkles, SlidersHorizontal, ArrowUpDown, Filter, Sun, Moon, Activity } from 'lucide-react';

const Timeline = () => {
  const { journals } = useJournal();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  // Extract unique filters
  const allTags = useMemo(() => {
    const tags = new Set();
    journals.forEach(j => j.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [journals]);

  const allMoods = useMemo(() => {
    const moods = new Set();
    journals.forEach(j => j.mood && moods.add(j.mood));
    return Array.from(moods);
  }, [journals]);

  const filteredJournals = useMemo(() => {
    return journals.filter(j => {
      const textContent = Array.isArray(j.content)
        ? j.content.filter(b => b.type === 'text').map(b => b.content).join(' ')
        : (j.content || '');

      const matchesSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
        textContent.toLowerCase().includes(search.toLowerCase());

      const matchesTag = !selectedTag || j.tags?.includes(selectedTag);
      const matchesMood = !selectedMood || j.mood === selectedMood;
      const matchesFavorite = !showFavoritesOnly || j.isFavorite;

      return matchesSearch && matchesTag && matchesMood && matchesFavorite;
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [journals, search, selectedTag, selectedMood, showFavoritesOnly, sortOrder]);

  // Group by month/year
  const groupedJournals = useMemo(() => {
    const groups = {};
    filteredJournals.forEach(j => {
      const date = new Date(j.date);
      const key = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(j);
    });
    return groups;
  }, [filteredJournals]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-screen-xl mx-auto px-4 md:px-0"
    >
      {/* Header & Controls - Mobile Optimized */}
      <header className="sticky top-0 md:top-20 z-40 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-2xl pt-4 pb-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-zinc-200/20 dark:border-zinc-800/20 transition-all duration-300"
        id="archive-header"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl md:text-5xl font-headline font-black tracking-tight text-zinc-900 dark:text-zinc-50">Archive</h2>
            <span className="hidden md:block text-zinc-400 font-medium text-sm">/ history</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2.5 rounded-xl transition-all border shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest cursor-pointer
                    ${showFavoritesOnly ? 'bg-rose-500 border-rose-500 text-white shadow-rose-500/20' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500'}`}
            >
              <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Favs</span>
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-primary-500 transition-all shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              <span className="hidden sm:inline">{sortOrder === 'desc' ? 'New' : 'Old'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl py-3 pl-11 pr-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-sm md:text-base shadow-sm"
            />
          </div>

          {/* Dynamic Filters - Scrollable Row on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-[10px] font-black uppercase tracking-wider text-zinc-500">
              <SlidersHorizontal size={10} />
              <span>Filters</span>
            </div>

            {(selectedMood || selectedTag || showFavoritesOnly) && (
              <button
                onClick={() => { setSelectedMood(null); setSelectedTag(null); setShowFavoritesOnly(false); }}
                className="shrink-0 px-3 py-1.5 text-[10px] font-black uppercase text-primary-500 hover:text-primary-600 cursor-pointer"
              >
                Reset
              </button>
            )}

            <div className="flex gap-2">
              {allMoods.map(mood => {
                const moodConfigs = {
                  'Radiant': { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                  'Calm': { icon: Moon, color: 'text-sky-500', bg: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
                  'Grounded': { icon: Hash, color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
                  'Quiet': { icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400', shadow: 'shadow-indigo-400/20' },
                  'Flow': { icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400', shadow: 'shadow-rose-400/20' },
                  'Fired Up': { icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
                  'Neutral': { icon: Activity, color: 'text-zinc-500', bg: 'bg-zinc-500', shadow: 'shadow-zinc-500/20' }
                };
                const config = moodConfigs[mood] || { icon: Sparkles, color: 'text-primary-500', bg: 'bg-primary-500', shadow: 'shadow-primary-500/20' };
                const Icon = config.icon;
                const isActive = selectedMood === mood;

                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(isActive ? null : mood)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm cursor-pointer
                        ${isActive ? `${config.bg} text-white border-transparent` : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}
                  >
                    <Icon size={12} className={isActive ? '' : config.color} />
                    {mood}
                  </button>
                );
              })}

              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer
                      ${selectedTag === tag ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}
                >
                  <Hash size={12} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Content */}
      <div className="mt-2 md:mt-12 space-y-12 pb-32">
        {Object.entries(groupedJournals).map(([month, entries], groupIdx) => (
          <section key={month} className="relative">
            {/* Minimalist Sticky Month Divider */}
            <div className="sticky top-[100px] md:top-44 z-30 flex items-center gap-2 md:gap-4 py-2 md:py-8 -mx-4 px-4 md:-mx-8 md:px-8 bg-zinc-50/50 dark:bg-black/50 backdrop-blur-sm">
              <h3 className="text-sm md:text-xl font-black text-primary-500 uppercase tracking-[0.4em] whitespace-nowrap">
                {month}
              </h3>
              <div className="flex-grow max-w-[90%] md:max-w-[65%] h-6 flex items-center">
                <svg 
                  className="w-full h-full text-primary-500 opacity-30" 
                  viewBox="0 0 1000 20" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M 0 10 C 150 2, 350 18, 500 10 C 650 2, 850 18, 1000 10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-4 md:pt-8">
              <AnimatePresence mode="popLayout">
                {entries.map((journal, idx) => (
                  <motion.div
                    key={journal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
                    className="group"
                  >
                    <Link to={`/edit/${journal.id}`} className="block relative h-full">
                      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-7 shadow-sm border border-zinc-100 dark:border-zinc-800/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col gap-5 relative overflow-hidden">

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex justify-between items-start z-10">
                          <div className="flex gap-3 md:gap-4 items-center">
                            <div className="flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl md:rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-inner group-hover:bg-primary-500 transition-colors duration-500">
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/70">
                                {new Date(journal.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="text-xl md:text-2xl font-headline font-black text-zinc-900 dark:text-zinc-100 group-hover:text-white leading-tight">
                                {new Date(journal.date).getDate()}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              {journal.mood && (
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-primary-500 mb-0.5">
                                  <Sparkles size={8} className="animate-pulse" />
                                  {journal.mood}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                {journal.isFavorite && <Heart size={14} className="text-rose-500 shrink-0" fill="currentColor" />}
                                <h4 className="font-headline font-black text-zinc-900 dark:text-zinc-50 text-base md:text-xl truncate group-hover:text-primary-500 transition-colors duration-300">
                                  {journal.title || 'Untitled Entry'}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>

                        {journal.image && (
                          <div className="relative aspect-video md:aspect-[4/3] rounded-[1.4rem] md:rounded-[1.8rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <img
                              src={journal.image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}

                        <div className="flex-grow z-10">
                          <p className="text-zinc-500 dark:text-zinc-400 line-clamp-2 md:line-clamp-3 leading-relaxed font-body text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity">
                            {Array.isArray(journal.content)
                              ? journal.content.find(b => b.type === 'text')?.content || 'No text content...'
                              : (journal.content || 'Start writing...')}
                          </p>
                        </div>

                        {journal.tags && journal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-50 dark:border-zinc-800/40 z-10">
                            {journal.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-zinc-400">
                                #{tag}
                              </span>
                            ))}
                            {journal.tags.length > 3 && (
                              <span className="text-[8px] font-medium text-zinc-300">+{journal.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 translate-x-1 group-hover:translate-x-0 transition-all duration-500 pointer-events-none">
                          <ChevronRight size={24} className="text-primary-500 md:w-10 md:h-10" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}

        {Object.keys(groupedJournals).length === 0 && (
          <div className="text-center py-32 px-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-headline font-black text-zinc-900 dark:text-zinc-50">Nothing found</h3>
            <p className="text-sm text-zinc-500 mt-2">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setSearch(''); setSelectedTag(null); setSelectedMood(null); setShowFavoritesOnly(false); }}
              className="mt-6 text-primary-500 font-black text-xs uppercase tracking-widest"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Timeline;
