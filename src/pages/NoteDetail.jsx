import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Save, Trash2, Upload, File, X, Download } from 'lucide-react'
import { formatDate } from '../lib/utils'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const NoteDetail = () => {
  const { folderId, noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [note, setNote] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (!error && data) {
      setNote(data)
      setTitle(data.title)
      setContent(data.content || '')
    }
    setLoading(false)
  }

  const saveNote = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('notes')
      .update({ title, content, updated_at: new Date() })
      .eq('id', noteId)

    if (!error) {
      setNote({ ...note, title, content })
    }
    setSaving(false)
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveNote()
    }
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${noteId}/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('notes-attachments')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error al subir archivo')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('notes-attachments')
      .getPublicUrl(filePath)

    await supabase
      .from('notes')
      .update({ file_url: publicUrl, file_name: file.name, file_type: file.type })
      .eq('id', noteId)

    fetchNote()
    setUploading(false)
  }

  const deleteFile = async () => {
    if (!note?.file_url) return

    const filePath = note.file_url.split('/').slice(-3).join('/')
    await supabase.storage.from('notes-attachments').remove([filePath])

    await supabase
      .from('notes')
      .update({ file_url: null, file_name: null, file_type: null })
      .eq('id', noteId)

    fetchNote()
  }

  const deleteNote = async () => {
    if (confirm('¿Eliminar esta nota permanentemente?')) {
      await supabase.from('notes').delete().eq('id', noteId)
      navigate(`/folder/${folderId}`)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-dark-900" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="border-b border-dark-800 bg-dark-800/30 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/folder/${folderId}`)} className="p-2 hover:bg-dark-700 rounded-lg transition">
                <ArrowLeft size={20} />
              </button>
              <div className="h-6 w-px bg-dark-700" />
              <span className="text-sm text-gray-400">
                {note && formatDate(note.updated_at)}
              </span>
              {saving && <span className="text-xs text-gray-500">Guardando...</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={saveNote} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Save size={16} /> Guardar
              </button>
              <button onClick={deleteNote} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl md:text-4xl font-bold bg-transparent focus:outline-none mb-6"
          placeholder="Título de la nota..."
        />

        {/* Archivo adjunto */}
        {note?.file_url && (
          <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File size={24} className="text-purple-400" />
              <div>
                <p className="font-medium">{note.file_name}</p>
                <p className="text-xs text-gray-500">
                  {note.file_type?.split('/').pop()?.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={note.file_url} download className="p-2 hover:bg-dark-700 rounded-lg transition">
                <Download size={18} />
              </a>
              <button onClick={deleteFile} className="p-2 hover:bg-dark-700 rounded-lg transition text-red-400">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Área de texto */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] bg-transparent focus:outline-none text-gray-200 leading-relaxed resize-none"
          placeholder="Escribe aquí tu nota, frase o contenido...
Puedes usar Ctrl+S para guardar"
        />

        {/* Botón subir archivo */}
        <div className="mt-8 pt-6 border-t border-dark-800">
          <label className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition cursor-pointer w-fit">
            <Upload size={18} />
            <span>{uploading ? 'Subiendo...' : 'Subir documento o imagen'}</span>
            <input type="file" onChange={uploadFile} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}

export default NoteDetail