import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'University - EduHalal Bangladesh',
  description: 'Homework help for university level students',
}

export default function UniversityChatPage() {
  return (
    <ChatInterface 
      categoryTitle="University" 
      categoryDescription="Help for university level students"
    />
  )
} 