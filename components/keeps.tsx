'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { FileText, Image as ImageIcon, ListChecks, Plus, Save, Trash2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type KeepKind = 'note' | 'todo' | 'photo' | 'video' | 'gif'

type Keep = {
  id: string
  title: string
  content: string
  kind: KeepKind
  mediaUrl?: string
  completed?: boolean
  createdAt: string
}

const starterKeeps: Keep[] = [
  { id: 'k1', title: 'Sunday prep', content: 'Roast vegetables and cook grains for the week.', kind: 'note', createdAt: 'Today' },
  { id: 'k2', title: 'Market checklist', content: 'Fresh herbs and lemons', kind: 'todo', completed: false, createdAt: 'Yesterday' },
  { id: 'k3', title: 'Plating inspiration', content: 'A colorful bowl makes healthy food feel special.', kind: 'note', createdAt: 'Monday' },
]

const kindLabels: Record<KeepKind, string> = { note: 'Note', todo: 'To-do', photo: 'Photo', video: 'Video', gif: 'GIF' }

export function Keeps() {
  const [keeps, setKeeps] = useState<Keep[]>(starterKeeps)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [kind, setKind] = useState<KeepKind>('note')
  const [mediaUrl, setMediaUrl] = useState('')

  const recentKeeps = useMemo(() => keeps.slice(0, 7), [keeps])

  const addKeep = () => {
    if (!title.trim() && !content.trim() && !mediaUrl.trim()) return
    setKeeps((current) => [{ id: crypto.randomUUID(), title: title || 'Untitled keep', content, kind, mediaUrl: mediaUrl || undefined, completed: kind === 'todo' ? false : undefined, createdAt: 'Just now' }, ...current])
    setTitle('')
    setContent('')
    setMediaUrl('')
    setKind('note')
  }

  const addFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const fileKind: KeepKind = file.type === 'image/gif' ? 'gif' : file.type.startsWith('video/') ? 'video' : 'photo'
    setKind(fileKind)
    setMediaUrl(url)
    setTitle(file.name.replace(/\.[^/.]+$/, ''))
  }

  const toggleTodo = (id: string) => setKeeps((current) => current.map((keep) => keep.id === id ? { ...keep, completed: !keep.completed } : keep))
  const removeKeep = (id: string) => setKeeps((current) => current.filter((keep) => keep.id !== id))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">Keep it close</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Your food keeps</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Save recipes, photos, videos, GIFs, to-dos, and quick zápisky in one calm space.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="gap-2"><Save data-icon="inline-start" />Save / print keeps</Button>
      </div>

      <Card className="border-amber-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(kindLabels) as KeepKind[]).map((option) => <Button key={option} size="sm" variant={kind === option ? 'default' : 'outline'} onClick={() => setKind(option)}>{kindLabels[option]}</Button>)}
          </div>
          <Input aria-label="Keep title" placeholder="Title your keep..." value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea aria-label="Keep content" placeholder={kind === 'todo' ? 'Add a checklist item or a few lines...' : 'Write a quick zápisek...'} value={content} onChange={(event) => setContent(event.target.value)} rows={3} />
          {kind === 'photo' || kind === 'video' || kind === 'gif' ? <div className="flex flex-wrap gap-2"><Input aria-label="Media URL" placeholder="Paste a photo, video, or GIF URL..." value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} /><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"><Plus data-icon="inline-start" />Upload<input className="sr-only" type="file" accept={kind === 'video' ? 'video/*' : kind === 'gif' ? 'image/gif' : 'image/*'} onChange={addFile} /></label></div> : null}
          <Button onClick={addKeep} className="w-full gap-2 bg-amber-600 hover:bg-amber-700"><Plus data-icon="inline-start" />Add to keeps</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentKeeps.map((keep) => <Card key={keep.id} className="group relative overflow-hidden border-amber-200 bg-amber-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-700 dark:text-amber-300">{kindLabels[keep.kind]}</span><button aria-label={`Delete ${keep.title}`} onClick={() => removeKeep(keep.id)} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"><Trash2 data-icon="inline-start" /></button></div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{keep.title}</h3>
          {keep.kind === 'todo' ? <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={keep.completed} onChange={() => toggleTodo(keep.id)} /> <span className={keep.completed ? 'line-through text-muted-foreground' : ''}>{keep.content}</span></label> : <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{keep.content}</p>}
          {keep.mediaUrl && (keep.kind === 'video' ? <video className="mt-4 max-h-48 w-full rounded-lg object-cover" src={keep.mediaUrl} controls /> : <img className="mt-4 max-h-48 w-full rounded-lg object-cover" src={keep.mediaUrl} alt={keep.title} />)}
          <p className="mt-4 text-xs text-muted-foreground">{keep.createdAt}</p>
        </Card>)}
      </div>
      <p className="text-center text-xs text-muted-foreground">Showing the last {recentKeeps.length} keeps. New keeps appear first.</p>
    </div>
  )
}
