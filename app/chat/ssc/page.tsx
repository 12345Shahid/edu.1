import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SSC - EduHalal Bangladesh',
  description: 'Homework help for Secondary School Certificate students',
}

export default function SSCChatPage() {
  return (
    <ChatInterface 
      categoryTitle="SSC" 
      categoryDescription="Help for Secondary School Certificate students"
    />
  )
} 