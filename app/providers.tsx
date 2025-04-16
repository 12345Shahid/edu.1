'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAppStore } from '@/app/store/store';
import { AuthProvider } from '@/app/auth/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, initFromDatabase } = useAppStore();
  
  // Initialize preferences from database on first load
  useEffect(() => {
    initFromDatabase();
  }, [initFromDatabase]);

  // Configure HTML element with appropriate class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
} 