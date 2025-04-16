'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistance } from 'date-fns'
import { FiMessageSquare, FiTrash } from 'react-icons/fi'
import { getAllChats, deleteChat } from '@/app/utils/supabase'
import { useAppStore } from '@/app/store/store'

interface ChatHistoryItem {
  id: string
  title: string
  category: string
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { setCurrentChatId } = useAppStore()

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    setIsLoading(true)
    try {
      const chats = await getAllChats()
      setChatHistory(chats)
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChat = (chatId: string) => {
    setCurrentChatId(chatId)
    // Find the category to navigate to the correct chat route
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      const category = chat.category.toLowerCase().replace(' ', '-')
      router.push(`/chat/${category}`)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the chat when deleting
    
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId)
        // Update local state to remove the deleted chat
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
      } catch (error) {
        console.error('Error deleting chat:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistance(date, new Date(), { addSuffix: true })
    } catch (error) {
      return 'Unknown date'
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Chat History</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : chatHistory.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No chat history found</p>
          <p className="text-sm text-gray-400 mt-2">Start a new conversation to see it here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {chatHistory.map(chat => (
            <div 
              key={chat.id}
              onClick={() => handleOpenChat(chat.id)}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-primary/10 rounded-full">
                    <FiMessageSquare className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{chat.title}</h3>
                    <p className="text-sm text-gray-500">
                      Category: {chat.category}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Delete chat"
                >
                  <FiTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 