'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/app/store/store'
import { 
  createFolder, 
  getFolders, 
  createNote, 
  getNotes, 
  updateNote, 
  deleteNote,
  searchNotes,
  Note,
  NoteFolder 
} from '@/app/utils/supabase'
import { FiPlus, FiFolder, FiFile, FiEdit2, FiTrash2, FiSearch, FiDownload, FiX } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default function NoteManager() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const { currentFolderId, setCurrentFolderId, theme } = useAppStore();
  const noteEditorRef = useRef<HTMLDivElement>(null);
  
  // Load folders and notes
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const folderData = await getFolders();
        setFolders(folderData);
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    };
    
    loadFolders();
  }, []);
  
  // Load notes when folder changes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsSearching(false);
        setSearchTerm('');
        const noteData = await getNotes(currentFolderId || undefined);
        setNotes(noteData);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    
    loadNotes();
  }, [currentFolderId]);
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folder = await createFolder(newFolderName, currentFolderId || undefined);
      setFolders(prev => [...prev, folder]);
      setNewFolderName('');
      setIsCreatingFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  
  const handleCreateNote = async () => {
    try {
      const note = await createNote('New Note', '', currentFolderId || undefined);
      setNotes(prev => [note, ...prev]);
      setCurrentNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setIsEditingNote(true);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };
  
  const handleSaveNote = async () => {
    if (!currentNote) return;
    
    try {
      const updatedNote = await updateNote(currentNote.id, {
        title: noteTitle,
        content: noteContent
      });
      
      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      
      setCurrentNote(updatedNote);
      setIsEditingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setNoteTitle('');
        setNoteContent('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to current folder's notes
      const noteData = await getNotes(currentFolderId || undefined);
      setNotes(noteData);
      setIsSearching(false);
      return;
    }
    
    try {
      const results = await searchNotes(searchTerm);
      setNotes(results);
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };
  
  const handleExportNote = async () => {
    if (!currentNote || !noteEditorRef.current) return;
    
    try {
      const canvas = await html2canvas(noteEditorRef.current);
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
      
      pdf.setFontSize(16);
      pdf.text(currentNote.title, 10, 10);
      
      pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${currentNote.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error exporting note:', error);
      alert('Failed to export note. Please try again.');
    }
  };
  
  return (
    <div className="flex flex-col h-screen dark:bg-dark-background bg-background transition-colors">
      <header className="px-4 py-3 bg-primary dark:bg-dark-primary text-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Notes</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="px-3 py-1 pr-8 text-sm rounded border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
            >
              <FiSearch size={16} />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-700 dark:text-gray-200">Folders</h2>
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                title="Create new folder"
              >
                <FiPlus size={18} />
              </button>
            </div>
            
            {isCreatingFolder && (
              <div className="mb-3 flex items-center">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <button 
                  onClick={handleCreateFolder}
                  className="ml-1 p-1 text-green-500"
                  title="Save folder"
                >
                  <FiPlus size={18} />
                </button>
                <button 
                  onClick={() => setIsCreatingFolder(false)}
                  className="p-1 text-red-500"
                  title="Cancel"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}
            
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setCurrentFolderId(null)}
                  className={`flex items-center px-2 py-1 w-full text-left rounded ${
                    currentFolderId === null 
                      ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiFolder className="mr-2" /> All Notes
                </button>
              </li>
              {folders.map(folder => (
                <li key={folder.id}>
                  <button 
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={`flex items-center px-2 py-1 w-full text-left rounded ${
                      currentFolderId === folder.id 
                        ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiFolder className="mr-2" /> {folder.name}
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 mb-2 flex justify-between items-center">
              <h2 className="font-medium text-gray-700 dark:text-gray-200">Notes</h2>
              <button 
                onClick={handleCreateNote}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                title="Create new note"
              >
                <FiPlus size={18} />
              </button>
            </div>
            
            {isSearching && (
              <div className="mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Search results for: <strong>{searchTerm}</strong></span>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearching(false);
                    getNotes(currentFolderId || undefined).then(setNotes);
                  }}
                  className="ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-red-500"
                  title="Clear search"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
            
            <ul className="space-y-1">
              {notes.length === 0 ? (
                <li className="text-gray-500 dark:text-gray-400 text-sm italic px-2 py-1">
                  {isSearching 
                    ? 'No notes match your search.' 
                    : 'No notes in this folder.'}
                </li>
              ) : (
                notes.map(note => (
                  <li key={note.id}>
                    <div className="flex items-center justify-between group">
                      <button 
                        onClick={() => {
                          setCurrentNote(note);
                          setNoteTitle(note.title);
                          setNoteContent(note.content);
                          setIsEditingNote(false);
                        }}
                        className={`flex-1 flex items-center px-2 py-1 text-left rounded truncate ${
                          currentNote?.id === note.id 
                            ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FiFile className="mr-2 flex-shrink-0" /> 
                        <span className="truncate">{note.title}</span>
                      </button>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setCurrentNote(note);
                            setNoteTitle(note.title);
                            setNoteContent(note.content);
                            setIsEditingNote(true);
                          }}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                          title="Edit note"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500"
                          title="Delete note"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        
        {/* Note Content */}
        <div className="flex-1 overflow-auto">
          {currentNote ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                {isEditingNote ? (
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-lg font-semibold border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Note title"
                  />
                ) : (
                  <h1 className="text-lg font-semibold dark:text-white">{currentNote.title}</h1>
                )}
                
                <div className="flex items-center space-x-2">
                  {isEditingNote ? (
                    <button 
                      onClick={handleSaveNote}
                      className="px-3 py-1 bg-primary dark:bg-dark-primary text-white rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditingNote(true)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                        title="Edit note"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={handleExportNote}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                        title="Export as PDF"
                      >
                        <FiDownload size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div 
                ref={noteEditorRef}
                className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900"
              >
                {isEditingNote ? (
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full h-full p-2 border rounded resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Note content..."
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {currentNote.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FiFile size={48} className="mx-auto mb-2" />
                <p className="text-lg">Select a note or create a new one</p>
                <button 
                  onClick={handleCreateNote}
                  className="mt-4 px-4 py-2 bg-primary dark:bg-dark-primary text-white rounded-lg flex items-center mx-auto"
                >
                  <FiPlus size={18} className="mr-1" /> Create New Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 