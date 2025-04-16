import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Below SSC - EduHalal Bangladesh',
  description: 'Homework help for students below Secondary School Certificate level',
}

export default function BelowSSCChatPage() {
  return (
    <ChatInterface 
      categoryTitle="Below SSC" 
      categoryDescription="Help for primary and junior secondary school students"
    />
  )
} 