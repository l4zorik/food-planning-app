'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'

export interface Note {
  id: string
  title: string
  content: string
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple'
  createdAt: Date
}

interface NotesProps {
  notes: Note[]
  onAddNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onUpdateNote: (id: string, note: Partial<Note>) => void
}

const colorClasses = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900',
  blue: 'bg-blue-100 dark:bg-blue-900',
  green: 'bg-green-100 dark:bg-green-900',
  red: 'bg-red-100 dark:bg-red-900',
  purple: 'bg-purple-100 dark:bg-purple-900',
}

const colorBorders = {
  yellow: 'border-yellow-300 dark:border-yellow-700',
  blue: 'border-blue-300 dark:border-blue-700',
  green: 'border-green-300 dark:border-green-700',
  red: 'border-red-300 dark:border-red-700',
  purple: 'border-purple-300 dark:border-purple-700',
}

export function Notes({ notes, onAddNote, onDeleteNote, onUpdateNote }: NotesProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<Note['color']>('yellow')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleAddNote = () => {
    if (title.trim() || content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        content,
        color: selectedColor,
        createdAt: new Date(),
      }
      onAddNote(newNote)
      setTitle('')
      setContent('')
      setSelectedColor('yellow')
    }
  }

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSaveEdit = (id: string, color: Note['color']) => {
    onUpdateNote(id, {
      title: editTitle || 'Untitled',
      content: editContent,
      color,
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Create Note Form */}
      <Card className="border-amber-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Create a Note</h2>
        <div className="space-y-4">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-amber-200 dark:border-slate-600"
          />
          <Textarea
            placeholder="Write your note here... (shopping tips, cooking notes, etc.)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="border-amber-200 dark:border-slate-600"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Color:</span>
            {(Object.keys(colorClasses) as Note['color'][]).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`size-6 rounded-full border-2 transition-all ${colorClasses[color]} ${
                  selectedColor === color ? 'scale-110 border-slate-900 dark:border-white' : 'border-slate-300'
                }`}
              />
            ))}
          </div>
          <Button onClick={handleAddNote} className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="size-4" />
            Add Note
          </Button>
        </div>
      </Card>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Card className="border-amber-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No notes yet. Create your first note above!</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`group relative rounded-lg border-2 ${colorClasses[note.color]} ${colorBorders[note.color]} p-4 shadow-sm transition-all hover:shadow-md`}
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-24 w-full resize-none bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id, note.color)}
                      className="flex-1 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="mb-2 cursor-pointer font-semibold text-slate-900 transition-colors hover:text-slate-700 dark:text-white dark:hover:text-slate-300" onClick={() => handleStartEdit(note)}>
                    {note.title}
                  </h3>
                  <p className="mb-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-4 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
