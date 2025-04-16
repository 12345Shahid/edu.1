import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbgbbhcrghkdowatupmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2JiaGNyZ2hrZG93YXR1cG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTA1MzcsImV4cCI6MjA2MDAyNjUzN30.fm3vOuo_hBZ9C9jhfjQ1WppDRZjmv6t05FrOThY5_bY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database tables
export interface ChatHistory {
  id: string;
  user_id: string;
  category: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  has_attachment: boolean;
  attachment_url?: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  language: string;
  reading_level: 'elementary' | 'middle' | 'high' | 'university' | 'standard';
  show_step_by_step: boolean;
  created_at: string;
  updated_at: string;
}

// Chat history functions
export async function createChat(category: string, title: string = 'New Chat') {
  const { data, error } = await supabase
    .from('chat_history')
    .insert([{ category, title }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getChatHistory() {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Alias for getChatHistory to make the API more intuitive
export const getAllChats = getChatHistory;

export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function saveChatMessage(chatId: string, role: 'user' | 'assistant', content: string, hasAttachment: boolean = false, attachmentUrl?: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      chat_id: chatId,
      role,
      content,
      has_attachment: hasAttachment,
      attachment_url: attachmentUrl
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { data, error } = await supabase
    .from('chat_history')
    .update({ title })
    .eq('id', chatId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteChat(chatId: string) {
  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('id', chatId);
  
  if (error) throw error;
  return true;
}

// Notes functions
export async function createFolder(name: string, parentId?: string) {
  const { data, error } = await supabase
    .from('note_folders')
    .insert([{ name, parent_id: parentId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getFolders() {
  const { data, error } = await supabase
    .from('note_folders')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createNote(title: string, content: string, folderId?: string, tags: string[] = []) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content, folder_id: folderId, tags }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getNotes(folderId?: string) {
  let query = supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (folderId) {
    query = query.eq('folder_id', folderId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function searchNotes(searchTerm: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .textSearch('title', searchTerm, { 
      type: 'websearch',
      config: 'english' 
    })
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateNote(noteId: string, updates: Partial<Note>) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  if (error) throw error;
  return true;
}

// User preferences functions
export async function getUserPreferences() {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', 'anonymous')
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found"
    throw error;
  }
  
  if (!data) {
    // Create default preferences if none exists
    return createUserPreferences();
  }
  
  return data;
}

export async function createUserPreferences(
  theme: 'light' | 'dark' = 'light',
  language: string = 'en',
  readingLevel: string = 'standard',
  showStepByStep: boolean = true
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .insert([{
      user_id: 'anonymous',
      theme,
      language,
      reading_level: readingLevel,
      show_step_by_step: showStepByStep
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserPreferences(updates: Partial<UserPreferences>) {
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', 'anonymous')
    .select()
    .single();
  
  if (error) throw error;
  return data;
} 