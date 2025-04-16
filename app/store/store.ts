'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserPreferences, updateUserPreferences } from '../utils/supabase';

// Define the store state type
interface AppState {
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Language state
  language: string;
  setLanguage: (language: string) => void;
  
  // Reading level state
  readingLevel: 'elementary' | 'middle' | 'high' | 'university' | 'standard';
  setReadingLevel: (level: 'elementary' | 'middle' | 'high' | 'university' | 'standard') => void;
  
  // Step by step explanations
  showStepByStep: boolean;
  toggleStepByStep: () => void;
  
  // Current chat state
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  
  // Chat history sidebar state
  isChatHistorySidebarOpen: boolean;
  toggleChatHistorySidebar: () => void;
  
  // Notes state
  currentNoteId: string | null;
  setCurrentNoteId: (id: string | null) => void;
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  
  // Notes sidebar state
  isNotesSidebarOpen: boolean;
  toggleNotesSidebar: () => void;
  
  // Initialize from database
  initFromDatabase: () => Promise<void>;
  
  // Sync preferences to database
  syncPreferencesToDatabase: () => Promise<void>;
}

// Create the store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        get().syncPreferencesToDatabase();
      },
      setTheme: (theme) => {
        set({ theme });
        get().syncPreferencesToDatabase();
      },
      
      // Language
      language: 'en',
      setLanguage: (language) => {
        set({ language });
        get().syncPreferencesToDatabase();
      },
      
      // Reading level
      readingLevel: 'standard',
      setReadingLevel: (level) => {
        set({ readingLevel: level });
        get().syncPreferencesToDatabase();
      },
      
      // Step by step explanations
      showStepByStep: true,
      toggleStepByStep: () => {
        set((state) => ({ showStepByStep: !state.showStepByStep }));
        get().syncPreferencesToDatabase();
      },
      
      // Current chat
      currentChatId: null,
      setCurrentChatId: (id) => set({ currentChatId: id }),
      
      // Chat history sidebar
      isChatHistorySidebarOpen: false,
      toggleChatHistorySidebar: () => set((state) => ({ 
        isChatHistorySidebarOpen: !state.isChatHistorySidebarOpen 
      })),
      
      // Notes
      currentNoteId: null,
      setCurrentNoteId: (id) => set({ currentNoteId: id }),
      currentFolderId: null,
      setCurrentFolderId: (id) => set({ currentFolderId: id }),
      
      // Notes sidebar
      isNotesSidebarOpen: false,
      toggleNotesSidebar: () => set((state) => ({ 
        isNotesSidebarOpen: !state.isNotesSidebarOpen 
      })),
      
      // Initialize from database
      initFromDatabase: async () => {
        try {
          const prefs = await getUserPreferences();
          set({
            theme: prefs.theme as 'light' | 'dark',
            language: prefs.language,
            readingLevel: prefs.reading_level,
            showStepByStep: prefs.show_step_by_step
          });
        } catch (error) {
          console.error('Failed to initialize preferences from database:', error);
        }
      },
      
      // Sync preferences to database
      syncPreferencesToDatabase: async () => {
        try {
          const { theme, language, readingLevel, showStepByStep } = get();
          await updateUserPreferences({
            theme,
            language,
            reading_level: readingLevel,
            show_step_by_step: showStepByStep
          });
        } catch (error) {
          console.error('Failed to sync preferences to database:', error);
        }
      }
    }),
    {
      name: 'eduhalal-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
); 