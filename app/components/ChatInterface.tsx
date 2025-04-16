'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/app/store/store'
import { createChat, saveChatMessage, getChatMessages } from '@/app/utils/supabase'
import { FiCopy, FiDownload, FiMoon, FiSun, FiMic, FiStopCircle } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  imageData?: string; // Base64 image data for API
}

interface ChatInterfaceProps {
  categoryTitle: string;
  categoryDescription: string;
}

export default function ChatInterface({ categoryTitle, categoryDescription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string>('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { theme, toggleTheme, setCurrentChatId, currentChatId } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSpeechRecognitionSupported(true);
      
      // Setup recognition
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    // Initialize chat or load existing chat
    const initializeChat = async () => {
      if (currentChatId) {
        setChatId(currentChatId);
        
        // Load messages from this chat
        try {
          const chatMessages = await getChatMessages(currentChatId);
          if (chatMessages && chatMessages.length > 0) {
            setMessages(
              chatMessages.map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                attachments: msg.has_attachment ? [msg.attachment_url || ''] : undefined
              }))
            );
          }
        } catch (error) {
          console.error('Error loading chat messages:', error);
        }
      } else {
        // Create a new chat
        try {
          const newChat = await createChat(categoryTitle);
          setChatId(newChat.id);
          setCurrentChatId(newChat.id);
        } catch (error) {
          console.error('Error creating new chat:', error);
        }
      }
    };
    
    initializeChat();
  }, [currentChatId, categoryTitle, setCurrentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || !chatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      imageData: imageData || undefined
    };

    // Clear input and attachments
    setInput('');
    setAttachments([]);
    setImageData('');
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      await saveChatMessage(
        chatId,
        'user',
        userMessage.content,
        !!userMessage.attachments?.length,
        userMessage.attachments?.[0]
      );
      
      // Format messages for API
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      // Prepare API request data
      const requestData: any = {
        messages: apiMessages,
      };
      
      // Add image data if available
      if (userMessage.imageData) {
        requestData.imageData = userMessage.imageData;
      }
      
      // Add preferences if available
      requestData.language = selectedLanguage;
      requestData.showStepByStep = showStepByStep;

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Sorry, I couldn't generate a response. Please try again."
      };

      // Save AI message to database
      await saveChatMessage(
        chatId,
        'assistant',
        aiMessage.content,
        false
      );

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, there was an error processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Also save error message to DB
      if (chatId) {
        try {
          await saveChatMessage(
            chatId,
            'assistant',
            errorMessage.content,
            false
          );
        } catch (dbError) {
          console.error('Error saving error message to DB:', dbError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Create URL for preview in UI
    const newAttachments = Array.from(files).map(file => 
      URL.createObjectURL(file)
    );
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Convert the first image to base64 for Gemini API
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the prefix (e.g., "data:image/jpeg;base64,") to get just the base64 data
      const base64Content = base64data.split(',')[1];
      setImageData(base64Content);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Response copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  const handleExportToPDF = async () => {
    if (!chatContainerRef.current || messages.length === 0) return;
    
    try {
      const canvas = await html2canvas(chatContainerRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`eduhalal-chat-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export conversation to PDF. Please try again.');
    }
  };
  
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-screen dark:bg-dark-background bg-background transition-colors">
      {/* Header */}
      <header className="px-4 py-3 bg-primary dark:bg-dark-primary text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{categoryTitle}</h1>
          <p className="text-sm opacity-90">{categoryDescription}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-700 dark:text-gray-200"
          >
            <option value="en">English</option>
            <option value="bn">Bengali</option>
            <option value="hi">Hindi</option>
            <option value="ar">Arabic</option>
          </select>
          
          <button 
            onClick={() => setShowStepByStep(!showStepByStep)}
            className={`px-2 py-1 rounded text-sm ${
              showStepByStep 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            title={showStepByStep ? "Step-by-step explanations enabled" : "Step-by-step explanations disabled"}
          >
            {showStepByStep ? 'Detailed' : 'Concise'}
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          
          <button
            onClick={handleExportToPDF}
            className="p-2 rounded-full hover:bg-white/20"
            aria-label="Export conversation to PDF"
            title="Export to PDF"
          >
            <FiDownload size={20} />
          </button>
        </div>
      </header>
      
      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-dark-background"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg font-medium">Ask your homework questions</p>
            <p className="text-sm text-center max-w-md mt-1">
              You can type your questions or upload images of your homework for help
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 relative ${
                  message.role === 'user' 
                    ? 'bg-primary dark:bg-dark-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 border shadow-sm dark:border-gray-700 rounded-bl-none dark:text-white'
                }`}
              >
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    {message.attachments.map((url, idx) => (
                      <div key={idx} className="relative h-32 w-full bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <Image 
                          src={url} 
                          alt="Attachment" 
                          fill 
                          style={{ objectFit: 'cover' }} 
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Render markdown for assistant messages */}
                {message.role === 'assistant' ? (
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {/* Copy button for assistant messages */}
                {message.role === 'assistant' && (
                  <button 
                    onClick={() => handleCopyResponse(message.content)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-700 bg-opacity-80 dark:bg-opacity-80 rounded-full p-1"
                    title="Copy response"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm dark:border-gray-700 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 overflow-x-auto">
            {attachments.map((url, idx) => (
              <div key={idx} className="relative h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <Image 
                  src={url} 
                  alt="Attachment preview" 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  unoptimized
                />
                <button 
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  onClick={() => setAttachments(prev => prev.filter((_,i) => i !== idx))}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end gap-2">
          <button 
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </button>
          
          {isSpeechRecognitionSupported && (
            <button
              className={`p-2 ${isListening ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:text-primary dark:hover:text-dark-primary`}
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? <FiStopCircle size={24} /> : <FiMic size={24} />}
            </button>
          )}
          
          <div className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 overflow-hidden focus-within:border-primary dark:focus-within:border-dark-primary focus-within:ring-1 focus-within:ring-primary dark:focus-within:ring-dark-primary">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your homework question..."
              className="w-full px-3 py-2 focus:outline-none resize-none bg-transparent dark:text-white"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <button 
            className="p-2 bg-primary dark:bg-dark-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 