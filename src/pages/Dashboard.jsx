import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { FolderPlus, LogOut, ChevronRight, ChevronDown, Folder, FileText, Plus, Trash2, MoreVertical, Edit2 } from 'lucide-react'
import CreateFolderModal from '../components/folders/CreateFolderModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate, truncateText } from '../lib/utils'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [notesByFolder, setNotesByFolder] = useState({})
  const [loadingNotes, setLoadingNotes] = useState({})
  const [showNoteMenu, setShowNoteMenu] = useState(null)
  const [showFolderMenu, setShowFolderMenu] = useState(null)
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  
  const username = profile?.username || user?.email?.split('@')[0]

  useEffect(() => {
    fetchFolders()
  }, [user])

  const fetchFolders = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFolders(data)
      // Inicializar el estado de expansión (todas cerradas por defecto)
      const initialExpanded = {}
      data.forEach(folder => {
        initialExpanded[folder.id] = false
      })
      setExpandedFolders(initialExpanded)
    }
    setLoading(false)
  }

  const fetchNotesForFolder = async (folderId) => {
    if (notesByFolder[folderId]) return // Ya cargadas
    
    setLoadingNotes(prev => ({ ...prev, [folderId]: true }))
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setNotesByFolder(prev => ({ ...prev, [folderId]: data }))
    }
    
    setLoadingNotes(prev => ({ ...prev, [folderId]: false }))
  }

  const toggleFolder = (folderId) => {
    const isExpanding = !expandedFolders[folderId]
    
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: isExpanding
    }))
    
    if (isExpanding) {
      fetchNotesForFolder(folderId)
    }
  }

  const createFolder = async (name) => {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, user_id: user.id }])
      .select()
    
    if (!error && data) {
      setFolders([data[0], ...folders])
      setExpandedFolders(prev => ({ ...prev, [data[0].id]: false }))
    }
    setShowCreateModal(false)
  }

  const updateFolderName = async (folderId, newName) => {
    if (!newName.trim()) return
    
    const { error } = await supabase
      .from('folders')
      .update({ name: newName })
      .eq('id', folderId)
      .eq('user_id', user.id)

    if (!error) {
      setFolders(prev => prev.map(f => 
        f.id === folderId ? { ...f, name: newName } : f
      ))
    }
    setEditingFolderId(null)
    setEditingFolderName('')
    setShowFolderMenu(null)
  }

  const deleteFolder = async (folderId) => {
    if (confirm('¿Eliminar esta carpeta y TODAS sus notas?')) {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id)

      if (!error) {
        setFolders(prev => prev.filter(f => f.id !== folderId))
        setNotesByFolder(prev => {
          const newState = { ...prev }
          delete newState[folderId]
          return newState
        })
        setExpandedFolders(prev => {
          const newState = { ...prev }
          delete newState[folderId]
          return newState
        })
      }
    }
    setShowFolderMenu(null)
  }

  const createNote = async (folderId, title) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        title: title || 'Nueva nota',
        folder_id: folderId,
        user_id: user.id,
        content: ''
      }])
      .select()

    if (!error && data) {
      setNotesByFolder(prev => ({
        ...prev,
        [folderId]: [data[0], ...(prev[folderId] || [])]
      }))
      navigate(`/folder/${folderId}/note/${data[0].id}`)
    }
  }

  const deleteNote = async (noteId, folderId) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (!error) {
      setNotesByFolder(prev => ({
        ...prev,
        [folderId]: prev[folderId].filter(n => n.id !== noteId)
      }))
    }
    setShowNoteMenu(null)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-800 bg-dark-800/30 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NoteKeep Explorer
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {folders.length} carpetas • {Object.values(notesByFolder).flat().length} notas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-300">{username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-dark-700 rounded-lg transition"
                title="Cerrar sesión"
              >
                <LogOut size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Estilo Windows Explorer */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Barra de herramientas */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm font-medium"
          >
            <FolderPlus size={18} />
            Nueva carpeta
          </button>
          <div className="text-xs text-gray-500">
            {folders.length === 0 ? 'Sin carpetas' : `${folders.length} elementos`}
          </div>
        </div>

        {/* Listado vertical de carpetas (estilo Windows Explorer) */}
        {folders.length === 0 ? (
          <div className="text-center py-20 bg-dark-800/30 rounded-xl border border-dashed border-dark-700">
            <Folder className="mx-auto text-gray-600 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-300">Esta carpeta está vacía</h3>
            <p className="text-gray-500 text-sm mt-1">Haz clic en "Nueva carpeta" para empezar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map((folder) => (
              <div key={folder.id} className="group">
                {/* Cabecera de la carpeta */}
                <div 
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-800 cursor-pointer transition group"
                  style={{ borderLeft: `3px solid ${folder.color || '#8b5cf6'}` }}
                >
                  <div 
                    className="flex items-center gap-2 flex-1"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <button className="p-0.5 hover:bg-dark-700 rounded">
                      {expandedFolders[folder.id] ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                    </button>
                    <Folder size={18} className="text-purple-400" />
                    
                    {editingFolderId === folder.id ? (
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onBlur={() => updateFolderName(folder.id, editingFolderName)}
                        onKeyDown={(e) => e.key === 'Enter' && updateFolderName(folder.id, editingFolderName)}
                        className="bg-dark-700 border border-purple-500 rounded px-2 py-0.5 text-sm focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-200 font-medium text-sm">{folder.name}</span>
                    )}
                    
                    <span className="text-xs text-gray-500 ml-2">
                      ({notesByFolder[folder.id]?.length || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => createNote(folder.id, 'Nueva nota')}
                      className="p-1.5 hover:bg-dark-700 rounded"
                      title="Nueva nota"
                    >
                      <Plus size={14} className="text-gray-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowFolderMenu(showFolderMenu === folder.id ? null : folder.id) }}
                        className="p-1.5 hover:bg-dark-700 rounded"
                      >
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                      {showFolderMenu === folder.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10">
                          <button
                            onClick={() => {
                              setEditingFolderId(folder.id)
                              setEditingFolderName(folder.name)
                              setShowFolderMenu(null)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-dark-700 transition"
                          >
                            <Edit2 size={12} /> Renombrar
                          </button>
                          <button
                            onClick={() => deleteFolder(folder.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-dark-700 transition"
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notas dentro de la carpeta (expandido) */}
                {expandedFolders[folder.id] && (
                  <div className="ml-7 pl-4 border-l border-dark-700 space-y-1 mt-1 mb-2">
                    {loadingNotes[folder.id] ? (
                      <div className="py-4 text-center">
                        <div className="inline-block w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      </div>
                    ) : notesByFolder[folder.id]?.length === 0 ? (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        <FileText size={32} className="mx-auto mb-2 opacity-30" />
                        <p>Esta carpeta está vacía</p>
                        <button
                          onClick={() => createNote(folder.id, 'Nueva nota')}
                          className="mt-2 text-purple-400 hover:text-purple-300 text-xs"
                        >
                          + Crear primera nota
                        </button>
                      </div>
                    ) : (
                      notesByFolder[folder.id]?.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => navigate(`/folder/${folder.id}/note/${note.id}`)}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-800/50 cursor-pointer transition group/item"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText size={14} className="text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-300 truncate">{note.title}</span>
                            {note.content && (
                              <span className="text-xs text-gray-600 truncate hidden sm:block">
                                - {truncateText(note.content, 40)}
                              </span>
                            )}
                            <span className="text-xs text-gray-600 flex-shrink-0 ml-auto hidden md:block">
                              {formatDate(note.updated_at)}
                            </span>
                          </div>
                          
                          <div className="relative opacity-0 group-hover/item:opacity-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowNoteMenu(showNoteMenu === note.id ? null : note.id) }}
                              className="p-1 hover:bg-dark-700 rounded"
                            >
                              <MoreVertical size={14} className="text-gray-500" />
                            </button>
                            {showNoteMenu === note.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10">
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id, folder.id) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-dark-700 transition"
                                >
                                  <Trash2 size={12} /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createFolder}
      />
    </div>
  )
}

export default Dashboard