import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IELTS - EduHalal Bangladesh',
  description: 'Preparation for IELTS examination',
}

export default function IELTSChatPage() {
  return (
    <ChatInterface 
      categoryTitle="IELTS" 
      categoryDescription="Preparation for IELTS examination"
    />
  )
} 