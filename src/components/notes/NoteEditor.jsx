import React, { useState, useEffect, useCallback } from 'react'
import { Save, Upload, File, X, Download } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const NoteEditor = ({ note, onSave, onFileUpload, onFileDelete }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
    }
  }, [note])

  const handleSave = useCallback(async () => {
    if (!note) return
    setSaving(true)
    await onSave({ ...note, title, content })
    setSaving(false)
    setLastSaved(new Date())
  }, [note, title, content, onSave])

  // Auto-save cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (title !== note?.title || content !== note?.content) {
        handleSave()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [title, content, note, handleSave])

  // Ctrl+S para guardar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Selecciona una nota para editarla</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Barra de herramientas */}
      <div className="border-b border-dark-700 p-4 bg-dark-800/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Guardado {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition cursor-pointer text-sm">
            <Upload size={16} />
            Subir archivo
            <input type="file" onChange={onFileUpload} className="hidden" />
          </label>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent focus:outline-none mb-2"
          placeholder="Título de la nota..."
        />
      </div>

      {/* Adjuntos */}
      {note.file_url && (
        <div className="border-b border-dark-700 p-4 bg-dark-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File size={20} className="text-purple-400" />
              <div>
                <p className="text-sm font-medium">{note.file_name || 'Archivo adjunto'}</p>
                <p className="text-xs text-gray-500">
                  {note.file_type?.split('/').pop()?.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={note.file_url} download className="p-2 hover:bg-dark-700 rounded-lg transition">
                <Download size={18} />
              </a>
              <button onClick={onFileDelete} className="p-2 hover:bg-dark-700 rounded-lg transition text-red-400">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor de texto */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-6 bg-transparent focus:outline-none text-gray-200 leading-relaxed resize-none"
        placeholder="Escribe aquí tu nota...
Puedes usar Ctrl+S para guardar"
      />
    </div>
  )
}

export default NoteEditor