import ChatInterface from '@/app/components/ChatInterface'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Career Guide - EduHalal Bangladesh',
  description: 'Career planning and guidance for students in Bangladesh',
}

export default function CareerChatPage() {
  return (
    <ChatInterface 
      categoryTitle="Career Guide" 
      categoryDescription="Career planning and guidance for your future"
    />
  )
} 