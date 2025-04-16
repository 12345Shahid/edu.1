import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat - EduHalal Bangladesh',
  description: 'Helping students in Bangladesh with their homework using AI',
}

// Import client-side components after server exports
import ChatLayoutClient from './ChatLayoutClient';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatLayoutClient>
      {children}
    </ChatLayoutClient>
  )
} 