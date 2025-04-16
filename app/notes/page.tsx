import { Metadata } from 'next'
import NoteManager from '@/app/components/NoteManager'

export const metadata: Metadata = {
  title: 'Notes - EduHalal Bangladesh',
  description: 'Manage your study notes and organize them in folders',
}

export default function NotesPage() {
  return <NoteManager />
} 