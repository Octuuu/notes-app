import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Plus, FileText, Trash2, MoreVertical, Edit2, Calendar, File } from 'lucide-react'
import { formatDate, truncateText } from '../lib/utils'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const FolderView = () => {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [folder, setFolder] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(null)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')

  useEffect(() => {
    fetchFolderAndNotes()
  }, [folderId, user])

  const fetchFolderAndNotes = async () => {
    if (!user) return

    const { data: folderData } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()

    if (folderData) {
      setFolder(folderData)
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('folder_id', folderId)
        .order('updated_at', { ascending: false })

      setNotes(notesData || [])
    }
    setLoading(false)
  }

  const createNote = async () => {
    if (!newNoteTitle.trim()) return

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        title: newNoteTitle,
        folder_id: folderId,
        user_id: user.id,
        content: ''
      }])
      .select()

    if (!error && data) {
      setNotes([data[0], ...notes])
      setNewNoteTitle('')
      setShowCreateNote(false)
      navigate(`/folder/${folderId}/note/${data[0].id}`)
    }
  }

  const deleteNote = async (noteId) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (!error) {
      setNotes(notes.filter(n => n.id !== noteId))
    }
    setShowMenu(null)
  }

  if (loading) return <LoadingSpinner />
  if (!folder) return <div className="text-center py-20">Carpeta no encontrada</div>

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-800 bg-dark-800/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-dark-700 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{folder.name}</h1>
              <p className="text-gray-400 text-sm">
                {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Botón crear nota */}
        {!showCreateNote ? (
          <button
            onClick={() => setShowCreateNote(true)}
            className="w-full mb-6 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-dark-700 rounded-xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition group"
          >
            <Plus size={20} className="group-hover:scale-110 transition" />
            <span>Crear nueva nota</span>
          </button>
        ) : (
          <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-dark-700">
            <input
              type="text"
              autoFocus
              placeholder="Título de la nota..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-medium focus:outline-none mb-3"
              onKeyDown={(e) => e.key === 'Enter' && createNote()}
            />
            <div className="flex gap-2">
              <button onClick={createNote} className="btn-primary text-sm py-2">Crear</button>
              <button onClick={() => setShowCreateNote(false)} className="btn-secondary text-sm py-2">Cancelar</button>
            </div>
          </div>
        )}

        {/* Lista de notas */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No hay notas en esta carpeta</p>
            <p className="text-gray-500 text-sm">Haz clic en "Crear nueva nota" para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => navigate(`/folder/${folderId}/note/${note.id}`)}
                className="group bg-dark-800/50 border border-dark-700 rounded-xl p-4 hover:border-purple-500/50 hover:bg-dark-800 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-100 mb-1">{note.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(note.updated_at)}
                      </span>
                      {note.file_url && (
                        <span className="flex items-center gap-1">
                          <File size={12} />
                          Adjunto
                        </span>
                      )}
                    </div>
                    {note.content && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {truncateText(note.content, 80)}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === note.id ? null : note.id) }}
                      className="p-2 rounded-lg hover:bg-dark-700 transition opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {showMenu === note.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FolderView