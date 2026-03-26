import React, { useState, useRef } from 'react';
import { useJournal } from '../context/JournalContext';
import { motion } from 'framer-motion';
import { 
  User, Palette, Cloud, Bell, Lock, ChevronRight, Moon, Sun, Check, Camera
} from 'lucide-react';

const Settings = () => {
  const { journals, preferences, updatePreferences } = useJournal();
  const fileInputRef = useRef();

  const handleColorChange = (color) => {
    updatePreferences({ primaryColor: color });
    document.documentElement.style.setProperty('--primary-color', color);
  };

  const handleProfilePicUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePreferences({ profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateStreak = () => {
    if (!journals || journals.length === 0) return 0;
    const dates = [...new Set(journals.map(j => new Date(j.date).toLocaleDateString('en-US')))]
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    
    const firstDate = new Date(dates[0]);
    firstDate.setHours(0,0,0,0);
    const diffDays = Math.round((currentDate - firstDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak is dead logically
    
    let expectedDate = firstDate;
    
    for (let d of dates) {
      const iterDate = new Date(d);
      iterDate.setHours(0,0,0,0);
      if (iterDate.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const colors = [
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Sky', hex: '#0ea5e9' }
  ];

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

  const [toggles, setToggles] = useState({
    sync: preferences.syncCloud || false,
    notifications: preferences.notifications || true,
    privacy: preferences.privacyLock || false
  });

  const handleToggle = (key) => {
    const newValue = !toggles[key];
    setToggles({...toggles, [key]: newValue});
    updatePreferences({ [key]: newValue });
  };

  const [isEditing, setIsEditing] = useState(false);
  const currentStreak = calculateStreak();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-screen-md mx-auto"
    >
      <motion.header 
        variants={itemVariants} 
        className="flex items-center justify-between sticky top-0 md:top-20 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-2xl pt-4 pb-6 md:pb-10 transition-all"
      >
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer
            ${isEditing ? 'bg-primary-600 text-white shadow-primary-600/20' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'}`}
        >
          {isEditing ? <Check size={14} strokeWidth={3} /> : <User size={14} />}
          {isEditing ? 'Save' : 'Edit Profile'}
        </button>
      </motion.header>

      {/* Profile Block */}
      <motion.section variants={itemVariants} className="px-2 md:pt-6">
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-6 overflow-hidden">
          <button 
             onClick={() => isEditing && fileInputRef.current?.click()}
             className={`relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0 overflow-hidden group border border-white dark:border-zinc-800 ${isEditing ? 'cursor-pointer ring-4 ring-primary-500/20' : 'cursor-default'}`}
          >
            {preferences.profilePic ? (
              <img src={preferences.profilePic} alt="Profile" className={`w-full h-full object-cover transition-all ${isEditing ? 'group-hover:blur-sm' : ''}`} />
            ) : (
              <User size={32} />
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={20} className="text-white drop-shadow-md" />
              </div>
            )}
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={handleProfilePicUpdate} accept="image/*" />

          <div className="flex-grow min-w-0 space-y-1">
            {isEditing ? (
              <input 
                autoFocus
                value={preferences.userName || 'Alex'} 
                onChange={(e) => updatePreferences({ userName: e.target.value })} 
                className="font-headline font-bold text-2xl text-zinc-900 dark:text-zinc-50 bg-transparent border-none focus:ring-1 focus:ring-primary-500 rounded-lg p-0 py-1 w-full selection:bg-primary-500/30"
              />
            ) : (
              <h3 className="font-headline font-bold text-2xl text-zinc-900 dark:text-zinc-50 py-1 truncate">
                {preferences.userName || 'Alex'}
              </h3>
            )}
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {currentStreak} Day Streak 🔥
            </p>
          </div>
        </div>
      </motion.section>

      {/* Appearance List */}
      <motion.section variants={itemVariants} className="px-2 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-4">Appearance</h4>
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          
          {/* Theme Toggle Row */}
          <div className="flex items-center justify-between p-5 pl-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <Palette size={18} />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">Theme Mode</span>
            </div>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner">
               <button 
                onClick={() => updatePreferences({ theme: 'light' })}
                className={`p-2 rounded-lg transition-all cursor-pointer ${preferences.theme === 'light' ? 'bg-white shadow text-primary-600 font-bold' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
               >
                 <Sun size={16} />
               </button>
               <button 
                onClick={() => updatePreferences({ theme: 'dark' })}
                className={`p-2 rounded-lg transition-all cursor-pointer ${preferences.theme === 'dark' ? 'bg-zinc-600 shadow text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
               >
                 <Moon size={16} />
               </button>
            </div>
          </div>

          {/* Accent Color Row */}
          <div className="p-5 pl-6 space-y-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
             <span className="font-semibold text-zinc-900 dark:text-zinc-50 block">Signature Hue</span>
             <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.hex)}
                  className="relative shrink-0 transition-transform active:scale-90 cursor-pointer"
                >
                  <div 
                    className="w-10 h-10 rounded-full border-[3px] shadow-sm hover:scale-110 transition-transform" 
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: preferences.primaryColor === color.hex ? 'var(--color-zinc-200)' : 'transparent'
                    }}
                  />
                  {preferences.primaryColor === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-overlay">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.section>

      {/* System List */}
      <motion.section variants={itemVariants} className="px-2 space-y-3 pb-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-4">System</h4>
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {[
            { id: 'sync', label: 'Cloud Sync', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { id: 'privacy', label: 'Privacy Lock', icon: Lock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
          ].map((item) => (
             <div key={item.id} className="w-full flex items-center justify-between p-5 pl-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm`}>
                  <item.icon size={18} />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</span>
              </div>
              
              <button 
                onClick={() => handleToggle(item.id)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${toggles[item.id] ? 'bg-primary-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggles[item.id] ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Support & About */}
      <motion.section variants={itemVariants} className="px-2 space-y-3 pb-12">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-4">About</h4>
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
           <button className="w-full flex items-center justify-between p-5 pl-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">Storage Usage</span>
              <span className="text-xs font-bold text-zinc-400 uppercase">1.2 MB</span>
           </button>
           <button className="w-full flex items-center justify-between p-5 pl-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">Version</span>
              <span className="text-xs font-bold text-zinc-400 uppercase">2.4.0-pro</span>
           </button>
           <button className="w-full flex items-center justify-between p-5 pl-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <span className="font-semibold text-rose-500">Sign Out</span>
              <ChevronRight size={18} className="text-zinc-300" />
           </button>
        </div>
        <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest pt-4 pb-8">Handcrafted with love in The Archive</p>
      </motion.section>

    </motion.div>
  );
};

export default Settings;
