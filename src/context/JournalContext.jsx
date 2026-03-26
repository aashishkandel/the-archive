import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const JournalContext = createContext();

// Storage configuration
localforage.config({
    name: 'the-archive-app',
    storeName: 'journals_v1',
    description: 'IndexedDB storage for The Archive personal journal entries and user preferences.'
});

const initialJournals = [
  {
    id: 1,
    title: "Lake Reflection Therapy",
    content: "The water was perfectly still today. It's rare to find that kind of silence in the city. I felt a sense of immense calm that I hadn't experienced in weeks. The sunset reflecting off the surface was breathtaking.",
    date: new Date(Date.now() - 86400000).toISOString(),
    mood: "Radiant",
    tags: ["nature", "solitude"],
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
    isFavorite: true
  },
  {
    id: 2,
    title: "Morning Brew & Ideation",
    content: "Finally started sketching out the new project. The smell of roasted beans always gets the creative gears turning. The cafe was quiet, just the way I like it for focus work.",
    date: new Date(Date.now() - 259200000).toISOString(),
    mood: "Calm",
    tags: ["work", "coffee"],
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
    isFavorite: false
  }
];

export const JournalProvider = ({ children }) => {
  const [journals, setJournals] = useState([]);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    primaryColor: '#f43f5e',
    userName: 'Alex',
    userEmail: 'alex.j@archive.io',
    profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
  });
  const [loading, setLoading] = useState(true);

  // Initial Load from IndexedDB
  useEffect(() => {
    const initializeData = async () => {
        try {
            const [savedJournals, savedPreferences] = await Promise.all([
                localforage.getItem('journals'),
                localforage.getItem('preferences')
            ]);

            // Migration from LocalStorage (if any)
            const legacyJournals = localStorage.getItem('journals');
            const legacyPrefs = localStorage.getItem('preferences');

            if (!savedJournals && legacyJournals) {
                try {
                    const migrated = JSON.parse(legacyJournals);
                    if (Array.isArray(migrated)) {
                        setJournals(migrated);
                        await localforage.setItem('journals', migrated);
                    } else {
                        setJournals(initialJournals);
                    }
                } catch (e) {
                    console.warn("Failed to migrate legacy journals:", e);
                    setJournals(initialJournals);
                }
                localStorage.removeItem('journals'); 
            } else if (savedJournals) {
                setJournals(savedJournals);
            } else {
                setJournals(initialJournals);
                await localforage.setItem('journals', initialJournals);
            }

            if (!savedPreferences && legacyPrefs) {
                try {
                    const migrated = JSON.parse(legacyPrefs);
                    if (migrated && typeof migrated === 'object') {
                        setPreferences(prev => ({ ...prev, ...migrated }));
                        await localforage.setItem('preferences', { ...preferences, ...migrated });
                    }
                } catch (e) {
                    console.warn("Failed to migrate legacy preferences:", e);
                }
                localStorage.removeItem('preferences');
            } else if (savedPreferences) {
                setPreferences(savedPreferences);
                // Apply theme immediately
                if (savedPreferences.theme === 'dark') document.documentElement.classList.add('dark');
                if (savedPreferences.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', savedPreferences.primaryColor);
                }
            }
        } catch (err) {
            console.error("Failed to load journals from IndexedDB:", err);
            setJournals(initialJournals);
        } finally {
            setLoading(false);
        }
    };

    initializeData();
  }, []);

  // Persistent save on state changes
  useEffect(() => {
    if (loading) return; // Don't overwrite with empty state during load
    localforage.setItem('journals', journals).catch(console.error);
  }, [journals, loading]);

  useEffect(() => {
    if (loading) return;
    localforage.setItem('preferences', preferences).catch(console.error);
    
    // Theme application logic
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (preferences.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', preferences.primaryColor);
    }
  }, [preferences, loading]);

  const addJournal = (entry) => {
    setJournals(prev => [entry, ...prev]);
  };

  const updateJournal = (updated) => {
    setJournals(prev => prev.map(j => j.id === updated.id ? updated : j));
  };

  const deleteJournal = (id) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  const toggleFavorite = (id) => {
    setJournals(prev => prev.map(j => j.id === id ? { ...j, isFavorite: !j.isFavorite } : j));
  };

  const updatePreferences = (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  if (loading) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-black z-[1000]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Restoring Memories...</span>
            </div>
        </div>
    );
  }

  return (
    <JournalContext.Provider value={{
      journals,
      addJournal,
      updateJournal,
      deleteJournal,
      toggleFavorite,
      preferences,
      updatePreferences
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within a JournalProvider');
  return context;
};
