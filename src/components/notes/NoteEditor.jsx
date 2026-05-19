import React, { useState, useEffect, useCallback } from 'react'
import { Save, File, X, Download } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useFiles } from '../../hooks/useFiles' // <-- Importamos tu hook de archivos
import FileUpload from './FileUpload' 

const NoteEditor = ({ note, onSave, onRefreshNote }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Desestructuramos las utilidades de tu hook useFiles
  const { uploadFile, deleteFile } = useFiles()

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

  // Manejador local que conecta el componente FileUpload con tu hook useFiles
  const handleDirectUpload = async (file) => {
    // LLama directamente a tu función del hook pasando el archivo nativo
    const result = await uploadFile(file, note.id)
    
    if (!result) {
      throw new Error('No se pudo subir el archivo. Revisa los permisos de Supabase Storage.')
    }

    // Refresca el estado de la nota si pasaste la función desencadenante
    if (onRefreshNote) {
      await onRefreshNote(note.id)
    } else {
      window.location.reload()
    }
  }

  // Manejador local para eliminar el archivo usando tu hook useFiles
  const handleDirectDelete = async () => {
    if (!note.file_url) return
    
    const success = await deleteFile(note.id, note.file_url)
    if (success) {
      if (onRefreshNote) {
        await onRefreshNote(note.id)
      } else {
        window.location.reload()
      }
    }
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Selecciona una nota para editarla</p>
      </div>
    )
  }

  // Mapeamos los datos para que el FileUpload sepa que ya hay un archivo en la nota
  const currentAttachedFile = note.file_url 
    ? { name: note.file_name || 'Archivo adjunto', size: 0 } 
    : null

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
          
          {/* Componente drag & drop / click visual limpio */}
          {!note.file_url && (
            <div className="w-64">
              <FileUpload 
                onUpload={handleDirectUpload}
                onRemove={handleDirectDelete}
                file={currentAttachedFile}
                accept=".pdf,.docx,.doc,image/*"
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent focus:outline-none mb-2"
          placeholder="Título de la nota..."
        />
      </div>

      {/* Caja de visualización si el archivo ya existe */}
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
              <a href={note.file_url} download target="_blank" rel="noreferrer" className="p-2 hover:bg-dark-700 rounded-lg transition">
                <Download size={18} />
              </a>
              <button onClick={handleDirectDelete} className="p-2 hover:bg-dark-700 rounded-lg transition text-red-400">
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
        placeholder="Escribe aquí tu nota...&#10;Puedes usar Ctrl+S para guardar"
      />
    </div>
  )
}

export default NoteEditor