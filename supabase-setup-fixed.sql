-- Note Folders Table (Create this FIRST)
CREATE TABLE IF NOT EXISTS note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'anonymous',
  name TEXT NOT NULL,
  parent_id UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'anonymous',
  category TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chat_history(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  has_attachment BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notes Table (Create this AFTER note_folders)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'anonymous',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY DEFAULT 'anonymous',
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  reading_level TEXT DEFAULT 'standard',
  show_step_by_step BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_chat_id_idx ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_folder_id_idx ON notes(folder_id);
CREATE INDEX IF NOT EXISTS note_folders_user_id_idx ON note_folders(user_id);
CREATE INDEX IF NOT EXISTS note_folders_parent_id_idx ON note_folders(parent_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER update_chat_history_updated_at
BEFORE UPDATE ON chat_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_note_folders_updated_at
BEFORE UPDATE ON note_folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at(); 