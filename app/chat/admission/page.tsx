import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admission Tests - EduHalal Bangladesh',
  description: 'Help for university admission test preparation',
}

export default function AdmissionChatPage() {
  return (
    <ChatInterface 
      categoryTitle="Admission Tests" 
      categoryDescription="Help for university admission test preparation"
    />
  )
} 