import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { motion } from 'framer-motion';
import { BarChart2, Heart, Image as ImageIcon, Sparkles, Activity, Hash, Calendar, PieChart } from 'lucide-react';

const Insights = () => {
  const { journals } = useJournal();

  const stats = useMemo(() => {
    const total = journals.length;
    const favorites = journals.filter(j => j.isFavorite).length;
    const withImages = journals.filter(j => (Array.isArray(j.content) && j.content.some(b => b.type === 'image')) || j.image).length;
    
    // Standard moods for consistent chart display
    const standardMoods = ['Radiant', 'Calm', 'Neutral', 'Melancholy', 'Overwhelmed', 'Energetic'];
    const moods = {};
    standardMoods.forEach(m => moods[m] = 0);

    journals.forEach(j => {
      if (j.mood && moods.hasOwnProperty(j.mood)) {
        moods[j.mood]++;
      } else if (j.mood) {
        moods[j.mood] = (moods[j.mood] || 0) + 1;
      }
    });
    
    // Sort to show highest count first, but keep all standard moods
    const sortedMoods = Object.entries(moods).sort((a, b) => b[1] - a[1]);
    const topMood = sortedMoods[0]?.[0] || 'Neutral';
    
    // Top Tags
    const tagsCount = {};
    journals.forEach(j => {
        j.tags?.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
        });
    });
    const topTags = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Days Active
    const uniqueDays = new Set(journals.map(j => new Date(j.date).toLocaleDateString())).size;

    return { total, favorites, withImages, topMood, sortedMoods, topTags, uniqueDays };
  }, [journals]);

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
      className="space-y-8"
    >
      <motion.header 
        variants={itemVariants} 
        className="space-y-2 sticky top-0 md:top-20 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-2xl pt-4 pb-6 md:pb-10 transition-all"
      >
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Insights</h2>
        <p className="text-zinc-500 font-medium font-body">Data patterns from your inner mind.</p>
      </motion.header>

      {/* Stats Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:pt-6">
        {[
          { label: 'Total Entries', value: stats.total, icon: BarChart2, color: 'text-zinc-900 dark:text-zinc-100', bg: 'bg-zinc-100 dark:bg-zinc-800' },
          { label: 'Days Active', value: stats.uniqueDays, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Favorites', value: stats.favorites, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Photos', value: stats.withImages, icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-start gap-4 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-2xl font-headline font-bold text-zinc-900 dark:text-zinc-50 leading-none">{stat.value}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.section>

      {/* Mood Resonance & Tags Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.section variants={itemVariants} className="lg:col-span-8 bg-zinc-900 dark:bg-black rounded-3xl p-6 md:p-8 shadow-premium relative overflow-hidden text-white flex flex-col justify-between min-h-[350px] border border-zinc-800">
            <div className="relative z-10 space-y-8 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                    <Activity size={14} className="text-primary-500" />
                    Mood Pulse
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex gap-4">
                    <span>High Vibrancy</span>
                    <span>Low Vibrancy</span>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className="flex-grow min-h-[160px] relative mt-4">
                {(() => {
                    const moodScores = { "Radiant": 5, "Energetic": 4, "Calm": 3, "Neutral": 2, "Melancholy": 1, "Overwhelmed": 0 };
                    const lastEntries = [...journals].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-12);
                    
                    if (lastEntries.length < 2) return (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest opacity-40">
                            Minimum 2 entries required for pulse
                        </div>
                    );

                    const width = 600;
                    const height = 150;
                    const padding = 20;
                    const step = (width - padding * 2) / (lastEntries.length - 1);
                    
                    const points = lastEntries.map((e, i) => {
                        const score = moodScores[e.mood] ?? 2;
                        const x = padding + i * step;
                        const y = height - padding - (score / 5) * (height - padding * 2);
                        return { x, y, mood: e.mood, date: new Date(e.date).toLocaleDateString() };
                    });

                    if (points.some(p => isNaN(p.x) || isNaN(p.y))) return null;

                    const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                    const areaD = d + ` L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

                    return (
                        <div className="w-full h-full relative group">
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                <path 
                                    d={areaD || ""} 
                                    className="fill-primary-500/5 stroke-none" 
                                />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    d={d || ""} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="text-primary-500" 
                                />
                                {points.map((p, i) => (
                                    <motion.circle 
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1 + i * 0.1 }}
                                        cx={p.x} cy={p.y} r="5" 
                                        className="fill-white stroke-primary-500 stroke-[3px]"
                                    />
                                ))}
                            </svg>
                            {/* Mood Labels below points */}
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 overflow-hidden pointer-events-none opacity-40">
                                {points.map((p, i) => (
                                    <span key={i} className="text-[8px] font-black uppercase tracking-tighter w-8 text-center rotate-[-45deg]">
                                        {p.mood?.substring(0,3)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })()}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="space-y-0.5">
                    <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Emotional Horizon</p>
                    <p className="text-xs font-bold text-zinc-100">Most recent 12 entries tracked</p>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-lg text-[10px] font-bold text-primary-400">
                        <Sparkles size={10} /> Syncing...
                    </div>
                </div>
              </div>
            </div>
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-600/5 rounded-full blur-[100px] pointer-events-none" />
          </motion.section>

          {/* Top Tags */}
          <motion.section variants={itemVariants} className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <PieChart size={14} className="text-primary-500" />
                Dominant Subjects
            </div>
            
            {stats.topTags.length > 0 ? (
                <div className="space-y-4">
                   {stats.topTags.map((tagData, i) => (
                       <div key={tagData[0]} className="space-y-2">
                           <div className="flex items-center justify-between text-sm font-bold text-zinc-700 dark:text-zinc-300">
                               <div className="flex items-center gap-1.5"><Hash size={14} className="text-zinc-400"/> {tagData[0]}</div>
                               <span>{tagData[1]}</span>
                           </div>
                           <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                               <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(tagData[1] / stats.total) * 100}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  className="h-full bg-primary-500 rounded-full"
                               />
                           </div>
                       </div>
                   ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                    <Hash size={32} className="mb-2" />
                    <p className="text-sm font-semibold">No tags used yet</p>
                </div>
            )}
          </motion.section>
      </div>

    </motion.div>
  );
};

export default Insights;
