import React, { useState } from 'react'
import { Plus, StickyNote, Edit3, Trash2, Search, Pin, PinOff, Tag, Folder } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useNotes } from '../../hooks/useBackendData'
import { toast } from 'sonner@2.0.3'

interface NoteFormData {
  title: string
  content: string
  category_id: string | null
  tags: string[]
  is_pinned: boolean
}

export function QuickNotes() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes()
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    category_id: null,
    tags: [],
    is_pinned: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please enter both title and content')
      return
    }

    try {
      if (editingNote) {
        const result = await updateNote(editingNote, formData)
        if (result.success) {
          toast.success('Note updated successfully!')
        } else {
          toast.error(result.error || 'Failed to update note')
        }
        setEditingNote(null)
      } else {
        const result = await createNote(formData)
        if (result.success) {
          toast.success('Note created successfully!')
        } else {
          toast.error(result.error || 'Failed to create note')
        }
        setIsAddingNote(false)
      }
      
      resetForm()
    } catch (error) {
      console.error('Error submitting note:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const result = await deleteNote(noteId)
      if (result.success) {
        toast.success('Note deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const result = await updateNote(noteId, { is_pinned: !currentPinned })
      if (result.success) {
        toast.success(currentPinned ? 'Note unpinned' : 'Note pinned')
      } else {
        toast.error(result.error || 'Failed to update note')
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
      toast.error('Failed to update note')
    }
  }

  const handleEditNote = (note: any) => {
    setFormData({
      title: note.title,
      content: note.content,
      category_id: note.category_id,
      tags: note.tags || [],
      is_pinned: note.is_pinned || false
    })
    setEditingNote(note.id)
    setIsAddingNote(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category_id: null,
      tags: [],
      is_pinned: false
    })
    setTagInput('')
    setEditingNote(null)
    setIsAddingNote(false)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  // Sort notes: pinned first, then by updated date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const recentNotes = sortedNotes.slice(0, 6)
  const pinnedNotes = notes.filter(note => note.is_pinned)

  if (loading) {
    return (
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Quick Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Quick Notes ({notes.length})
          {pinnedNotes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pinnedNotes.length} pinned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add Note Button */}
        <Dialog open={isAddingNote} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddingNote(open)
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start glassmorphism">
              <Plus className="w-4 h-4 mr-2" />
              Add New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="glassmorphism max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
              <DialogDescription>
                {editingNote ? 'Update your note content and organize with tags.' : 'Create a new note to capture your thoughts and ideas.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter note title"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="pinned" className="text-sm">Pin Note</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({...formData, is_pinned: !formData.is_pinned})}
                    className={`p-1 ${formData.is_pinned ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {formData.is_pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your note here..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label>Tags (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingNote ? 'Update Note' : 'Add Note'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notes List */}
        <div className="space-y-3">
          {recentNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No notes found.' : 'No notes yet. Add one to get started!'}</p>
            </div>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} className={`group p-3 glass-card hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 ${note.is_pinned ? 'ring-1 ring-primary-solid/30' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {note.is_pinned && (
                      <Pin className="w-3 h-3 text-primary-solid" />
                    )}
                    <h4 className="font-medium line-clamp-1">{note.title}</h4>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(note.id, note.is_pinned)}
                      className="h-7 w-7 p-0"
                      title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                    >
                      {note.is_pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {note.content}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updated_at).toLocaleDateString()} • {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
        </div>

        {notes.length > 6 && !searchTerm && (
          <div className="text-center">
            <Button variant="outline" size="sm" className="glassmorphism">
              View All Notes ({notes.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}