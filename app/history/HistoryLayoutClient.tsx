'use client'

import Link from 'next/link'
import { FiBook, FiHome, FiClock, FiMoon, FiSun, FiUser, FiLogOut } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/app/store/store'
import { useAuth } from '@/app/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HistoryLayoutClient({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useAppStore();
  const { setTheme } = useTheme();
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Sync the theme state with next-themes when it changes in the store
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // If loading auth state, show minimal UI
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If no user, don't render anything (redirect happens via useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold">EduHalal</Link>
        </div>
        <nav className="flex flex-col flex-1 p-4">
          <p className="text-gray-400 text-sm mb-2">Education Levels</p>
          <div className="space-y-1">
            <Link href="/chat/below-ssc" className="block px-3 py-2 rounded hover:bg-gray-700">
              Below SSC
            </Link>
            <Link href="/chat/ssc" className="block px-3 py-2 rounded hover:bg-gray-700">
              SSC
            </Link>
            <Link href="/chat/hsc" className="block px-3 py-2 rounded hover:bg-gray-700">
              HSC
            </Link>
            <Link href="/chat/admission" className="block px-3 py-2 rounded hover:bg-gray-700">
              Admission Tests
            </Link>
            <Link href="/chat/university" className="block px-3 py-2 rounded hover:bg-gray-700">
              University
            </Link>
            <Link href="/chat/career" className="block px-3 py-2 rounded hover:bg-gray-700">
              Career Guide
            </Link>
            <Link href="/chat/research" className="block px-3 py-2 rounded hover:bg-gray-700">
              Research Notes
            </Link>
            <Link href="/chat/ielts" className="block px-3 py-2 rounded hover:bg-gray-700">
              IELTS
            </Link>
            <Link href="/chat/sat" className="block px-3 py-2 rounded hover:bg-gray-700">
              SAT
            </Link>
          </div>
          
          <div className="mt-6 border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm mb-2">Tools</p>
            <Link 
              href="/notes" 
              className="flex items-center px-3 py-2 rounded hover:bg-gray-700"
            >
              <FiBook className="mr-2" /> Notes
            </Link>
            <Link 
              href="/history" 
              className="flex items-center px-3 py-2 rounded bg-gray-700 mt-1"
            >
              <FiClock className="mr-2" /> History
            </Link>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div 
              className="flex items-center px-3 py-2 text-gray-400 hover:text-white cursor-pointer"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <><FiSun className="mr-2" /> Light Mode</>
              ) : (
                <><FiMoon className="mr-2" /> Dark Mode</>
              )}
            </div>
            <Link href="/" className="flex items-center px-3 py-2 mt-1 text-gray-400 hover:text-white">
              <FiHome className="mr-2" /> Back to Home
            </Link>
          </div>
          
          {/* User Profile Section */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center px-3 py-2 text-white">
              <FiUser className="mr-2" /> 
              <div className="overflow-hidden text-sm">
                <div className="truncate">{user?.email}</div>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded mt-1"
            >
              <FiLogOut className="mr-2" /> Sign Out
            </button>
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
} 