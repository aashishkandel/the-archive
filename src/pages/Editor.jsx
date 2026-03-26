import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Image as ImageIcon, X, Sparkles, Hash, Activity, Sun, Moon, Cloud, Zap, Leaf, Minus
} from 'lucide-react';

const MoodItem = React.memo(({ m, config, isActive, onClick }) => {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-4 group transition-all duration-500 cursor-pointer ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100 hover:translate-y-[-4px]'}`}
    >
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[2rem_0.8rem_2rem_0.8rem] flex items-center justify-center transition-all duration-500 bg-white dark:bg-zinc-800 border-2 ${isActive ? `border-current shadow-2xl scale-110 translate-y-[-8px]` : `${config.border} shadow-lg`} ${config.color} ring-offset-4 ring-offset-white dark:ring-offset-zinc-950`}>
        <Icon size={isActive ? 28 : 24} strokeWidth={isActive ? 3 : 2} className={`${isActive ? '' : 'text-zinc-500'} transition-all`} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] font-headline ${isActive ? config.color : 'text-zinc-600 dark:text-zinc-400'}`}>
        {m}
      </span>
    </button>
  );
});

const Block = React.memo(({ block, updateTextBlock, removeBlock, handleTextareaResize, isOnlyBlock }) => {
  if (block.type === 'text') {
    return (
      <textarea
        value={block.content}
        onChange={(e) => {
          updateTextBlock(block.id, e.target.value);
          handleTextareaResize(e);
        }}
        onInput={handleTextareaResize}
        onFocus={handleTextareaResize}
        placeholder={isOnlyBlock ? "What's on your mind today?" : "Continue writing..."}
        className="w-full min-h-[40px] text-lg md:text-xl font-body text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder:text-zinc-300 dark:placeholder:text-zinc-700 bg-transparent border-none appearance-none outline-none focus:outline-none focus:ring-0 p-0 resize-none selection:bg-primary-500/30 overflow-hidden"
      />
    );
  } else if (block.type === 'image') {
    return (
      <div className="relative group overflow-hidden my-4 flex justify-center">
        <img src={block.url} alt="Memory" className="max-w-full max-h-[60vh] object-contain rounded-[1.5rem]" loading="lazy" />
        <button
          onClick={() => removeBlock(block.id)}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-transform md:opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    );
  }
  return null;
});

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { journals, addJournal, updateJournal } = useJournal();
  const fileInputRef = useRef(null);

  const [entry, setEntry] = useState({
    title: '',
    mood: 'Radiant',
    tags: [],
    date: new Date().toISOString(),
    isFavorite: false
  });

  const [blocks, setBlocks] = useState([
    { id: Date.now().toString(), type: 'text', content: '' }
  ]);

  const [showMoods, setShowMoods] = useState(false);

  useEffect(() => {
    if (id) {
      const existing = journals.find(j => j.id === parseInt(id));
      if (existing) {
        setEntry({
          title: existing.title || '',
          mood: existing.mood || 'Neutral',
          tags: existing.tags || [],
          date: existing.date || new Date().toISOString(),
          isFavorite: existing.isFavorite || false
        });

        // Handle backward compatibility: Array vs legacy String layout
        if (Array.isArray(existing.content)) {
          setBlocks(existing.content);
        } else {
          let legacyBlocks = [];
          if (existing.content) {
            legacyBlocks.push({ id: Date.now().toString() + '-t', type: 'text', content: existing.content });
          }
          if (existing.image) {
            legacyBlocks.push({ id: Date.now().toString() + '-i', type: 'image', url: existing.image });
          }
          if (legacyBlocks.length === 0) {
            legacyBlocks.push({ id: Date.now().toString(), type: 'text', content: '' });
          }
          setBlocks(legacyBlocks);
        }
      }
    }
  }, [id, journals]);

  const handleSave = () => {
    let finalBlocks = blocks.filter(b => b.type === 'image' || (b.type === 'text' && b.content.trim() !== ''));
    if (finalBlocks.length === 0) {
      finalBlocks = [{ id: Date.now().toString(), type: 'text', content: '' }];
    }

    const coverImage = finalBlocks.find(b => b.type === 'image')?.url || null;

    const finalEntry = {
      ...entry,
      content: finalBlocks,
      image: coverImage
    };

    if (id) {
      updateJournal({ ...finalEntry, id: parseInt(id) });
    } else {
      addJournal({ ...finalEntry, id: Date.now() });
    }
    navigate(-1);
  };

  const updateTextBlock = React.useCallback((id, newContent) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  }, []);

  const removeBlock = React.useCallback((id) => {
    setBlocks(prev => {
        const newBlocks = prev.filter(b => b.id !== id);
        return newBlocks.length === 0 ? [{ id: Date.now().toString(), type: 'text', content: '' }] : newBlocks;
    });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlocks(prev => [...prev, { id: Date.now().toString(), type: 'image', url: reader.result }, { id: Date.now().toString() + '-t', type: 'text', content: '' }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null; // reset
  };

  const handleTextareaResize = React.useCallback((e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }, []);

  const moodConfigs = {
    'Radiant': { icon: Sun, color: 'text-amber-500', glow: 'shadow-amber-500/20', bg: 'bg-amber-500/5', border: 'border-amber-500/30' },
    'Calm': { icon: Moon, color: 'text-sky-500', glow: 'shadow-sky-500/20', bg: 'bg-sky-500/5', border: 'border-sky-500/30' },
    'Grounded': { icon: Leaf, color: 'text-emerald-500', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/5', border: 'border-emerald-500/30' },
    'Quiet': { icon: Cloud, color: 'text-indigo-400', glow: 'shadow-indigo-400/20', bg: 'bg-indigo-400/5', border: 'border-indigo-400/30' },
    'Flow': { icon: Activity, color: 'text-rose-400', glow: 'shadow-rose-400/20', bg: 'bg-rose-400/5', border: 'border-rose-400/30' },
    'Fired Up': { icon: Zap, color: 'text-orange-500', glow: 'shadow-orange-500/20', bg: 'bg-orange-500/5', border: 'border-orange-500/30' },
    'Neutral': { icon: Minus, color: 'text-zinc-500', glow: 'shadow-zinc-500/20', bg: 'bg-zinc-500/5', border: 'border-zinc-500/30' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col md:max-w-screen-md md:mx-auto md:relative md:inset-auto md:min-h-[90vh] md:mt-10 md:rounded-[3rem] md:shadow-2xl overflow-hidden"
    >
      <header className="flex items-center justify-between px-4 h-16 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-20 pt-safe shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium active:scale-95 transition-all text-sm cursor-pointer"
        >
          <ChevronLeft size={20} className="-ml-1" />
          Cancel
        </button>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <button
          onClick={handleSave}
          className="font-bold text-sm bg-primary-600 text-white px-4 py-1.5 rounded-full active:scale-95 transition-transform cursor-pointer shadow-lg shadow-primary-500/20 hover:bg-primary-700"
        >
          {id ? 'Update' : 'Save'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-6 pt-10 pb-32 no-scrollbar scroll-smooth">
        <input
          type="text"
          placeholder="Title"
          value={entry.title}
          onChange={(e) => setEntry({ ...entry, title: e.target.value })}
          className="w-full text-4xl font-headline font-extrabold text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-200 dark:placeholder:text-zinc-800 bg-transparent border-none appearance-none outline-none focus:outline-none focus:ring-0 p-0 mb-4 leading-tight selection:bg-primary-500/30"
        />

        <div className="flex flex-wrap gap-3 mb-10 items-center">
          <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-700">
            <Hash size={18} />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {entry.tags.map(t => (
              <span key={t} className="px-3 py-1 bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-black flex items-center gap-2 uppercase tracking-widest border border-zinc-200/50 dark:border-zinc-800/50 group/tag">
                {t}
                <button
                  onClick={() => setEntry({ ...entry, tags: entry.tags.filter(tag => tag !== t) })}
                  className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove tag ${t}`}
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add context..."
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  const newTag = e.target.value.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, '');
                  if (newTag && !entry.tags.includes(newTag)) {
                    setEntry({ ...entry, tags: [...entry.tags, newTag] });
                  }
                  e.target.value = '';
                }
              }}
              onKeyDown={(e) => {
                const currentVal = e.target.value.trim();
                if (['Enter', ',', ' '].includes(e.key) && currentVal) {
                  e.preventDefault();
                  const newTag = currentVal.toLowerCase().replace(/[^a-z0-9\-_]/g, '');
                  if (newTag && !entry.tags.includes(newTag)) {
                    setEntry({ ...entry, tags: [...entry.tags, newTag] });
                  }
                  e.target.value = '';
                }
              }}
              className="bg-transparent border-none appearance-none outline-none focus:outline-none text-[11px] font-bold uppercase tracking-widest placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-0 p-0 w-32 ml-1"
            />
          </div>
        </div>

        <div className="space-y-6">
          {blocks.map((block) => (
            <Block 
              key={block.id} 
              block={block} 
              updateTextBlock={updateTextBlock} 
              removeBlock={removeBlock} 
              handleTextareaResize={handleTextareaResize}
              isOnlyBlock={blocks.length === 1}
            />
          ))}
        </div>
      </main>

      <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl pb-safe z-20 shrink-0">
        <AnimatePresence>
          {showMoods && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-3xl"
            >
              <div className="p-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-10 text-center opacity-70">Emotional Context</p>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-6 max-w-4xl mx-auto items-start">
                  {Object.entries(moodConfigs).map(([m, config]) => (
                    <MoodItem 
                      key={m} 
                      m={m} 
                      config={config} 
                      isActive={entry.mood === m} 
                      onClick={() => { setEntry({ ...entry, mood: m }); setShowMoods(false); }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-8 py-8 md:max-w-screen-md mx-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group active:scale-90 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-[2rem_0.8rem_2rem_0.8rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.05)] shadow-zinc-200/50 dark:shadow-black/40 group-hover:translate-y-[-4px] transition-all duration-300 ring-1 ring-zinc-50 dark:ring-zinc-700">
              <ImageIcon size={24} strokeWidth={2.5} className="text-primary-600 transition-colors" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50 font-headline">Media</span>
          </button>

          <button
            onClick={() => setShowMoods(!showMoods)}
            className="flex flex-col items-center gap-2 group active:scale-90 transition-all cursor-pointer"
          >
            {(() => {
              const config = moodConfigs[entry.mood] || { icon: Sparkles, color: 'text-zinc-400', border: 'border-zinc-200' };
              const Icon = config.icon;
              return (
                <>
                  <div className={`w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-[0.8rem_2rem_0.8rem_2rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.05)] shadow-zinc-200/50 dark:shadow-black/40 group-hover:translate-y-[-4px] transition-all duration-300 border-2 ${showMoods ? 'border-primary-500' : config.border} relative`}>
                    <Icon size={28} strokeWidth={3} className={`${config.color} ${showMoods ? 'animate-pulse scale-110' : ''} transition-all duration-500`} />
                    {showMoods && <div className="absolute -inset-1 border-2 border-primary-500/10 rounded-[0.8rem_2rem_0.8rem_2rem]" />}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-headline ${config.color}`}>{entry.mood}</span>
                  </div>
                </>
              );
            })()}
          </button>

          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" />
        </div>
      </div>
    </motion.div>
  );
};

export default Editor;

