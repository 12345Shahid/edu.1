import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Notes - EduHalal Bangladesh',
  description: 'Get resources on specific topics from various platforms',
}

export default function ResearchChatPage() {
  return (
    <ChatInterface 
      categoryTitle="Research Notes" 
      categoryDescription="Get resources on specific topics from various platforms"
    />
  )
} 