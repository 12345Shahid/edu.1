-- Enable Row Level Security (RLS) on all tables
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Update user_id fields to use auth.uid() instead of 'anonymous'
ALTER TABLE chat_history ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
ALTER TABLE notes ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
ALTER TABLE note_folders ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
ALTER TABLE user_preferences ALTER COLUMN user_id SET DEFAULT auth.uid()::text;

-- Create policies for chat_history table
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own chat history"
  ON chat_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own chat history"
  ON chat_history FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own chat history"
  ON chat_history FOR DELETE
  USING (user_id = auth.uid()::text);

-- Create policies for chat_messages table (based on chat_id)
CREATE POLICY "Users can view messages in their chats"
  ON chat_messages FOR SELECT
  USING (chat_id IN (SELECT id FROM chat_history WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can insert messages in their chats"
  ON chat_messages FOR INSERT
  WITH CHECK (chat_id IN (SELECT id FROM chat_history WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update messages in their chats"
  ON chat_messages FOR UPDATE
  USING (chat_id IN (SELECT id FROM chat_history WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete messages in their chats"
  ON chat_messages FOR DELETE
  USING (chat_id IN (SELECT id FROM chat_history WHERE user_id = auth.uid()::text));

-- Create policies for notes table
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (user_id = auth.uid()::text);

-- Create policies for note_folders table
CREATE POLICY "Users can view their own folders"
  ON note_folders FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own folders"
  ON note_folders FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own folders"
  ON note_folders FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own folders"
  ON note_folders FOR DELETE
  USING (user_id = auth.uid()::text);

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Migration: Update existing records with anonymous user_id
-- This will associate existing anonymous data with new users during their first login
-- Create a function that can be called from client-side after authentication
CREATE OR REPLACE FUNCTION migrate_anonymous_data(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update chat history
  UPDATE chat_history
  SET user_id = p_user_id
  WHERE user_id = 'anonymous';
  
  -- Update notes
  UPDATE notes
  SET user_id = p_user_id
  WHERE user_id = 'anonymous';
  
  -- Update note folders
  UPDATE note_folders
  SET user_id = p_user_id
  WHERE user_id = 'anonymous';
  
  -- Update user preferences
  UPDATE user_preferences
  SET user_id = p_user_id
  WHERE user_id = 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 