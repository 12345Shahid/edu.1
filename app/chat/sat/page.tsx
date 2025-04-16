import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SAT - EduHalal Bangladesh',
  description: 'Preparation for SAT examination',
}

export default function SATChatPage() {
  return (
    <ChatInterface 
      categoryTitle="SAT" 
      categoryDescription="Preparation for SAT examination"
    />
  )
} 