import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat History - EduHalal Bangladesh',
  description: 'View your past conversations',
}

// Import client-side components after server exports
import HistoryLayoutClient from './HistoryLayoutClient';

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HistoryLayoutClient>
      {children}
    </HistoryLayoutClient>
  )
} 