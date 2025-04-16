import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notes - EduHalal Bangladesh',
  description: 'Manage your study notes and organize them in folders',
}

// Import client-side components after server exports
import NotesLayoutClient from './NotesLayoutClient';

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotesLayoutClient>
      {children}
    </NotesLayoutClient>
  )
} 