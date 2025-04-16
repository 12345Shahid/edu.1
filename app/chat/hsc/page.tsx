import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HSC - EduHalal Bangladesh',
  description: 'Homework help for Higher Secondary Certificate students',
}

export default function HSCChatPage() {
  return (
    <ChatInterface 
      categoryTitle="HSC" 
      categoryDescription="Help for Higher Secondary Certificate students"
    />
  )
} 