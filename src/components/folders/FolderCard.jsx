import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, MoreVertical, Edit2, Trash2, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

const FolderCard = ({ folder, onDelete, onUpdate }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(folder.name)

  const handleDelete = async () => {
    if (confirm(`¿Eliminar la carpeta "${folder.name}" y todas sus notas?`)) {
      await supabase.from('folders').delete().eq('id', folder.id).eq('user_id', user.id)
      onDelete?.()
    }
    setShowMenu(false)
  }

  const handleUpdate = async () => {
    if (!newName.trim()) return
    const { error } = await supabase
      .from('folders')
      .update({ name: newName })
      .eq('id', folder.id)
      .eq('user_id', user.id)
    
    if (!error) {
      onUpdate?.()
      setIsEditing(false)
    }
  }

  // Contar notas en la carpeta (simulado - puedes hacer fetch real)
  const noteCount = folder.note_count || 0

  return (
    <div className="group bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl overflow-hidden hover:border-purple-500/50 hover:bg-dark-800 transition-all duration-200">
      {isEditing ? (
        <div className="p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-purple-500 mb-2"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="btn-primary text-sm py-1 px-3">Guardar</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm py-1 px-3">Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div
            onClick={() => navigate(`/folder/${folder.id}`)}
            className="p-5 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Folder className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 text-lg">{folder.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText size={12} className="text-gray-500" />
                    <p className="text-xs text-gray-500">{noteCount} notas</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                  className="p-1 rounded-lg hover:bg-dark-700 transition opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical size={18} className="text-gray-400" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 animate-fade-in">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FolderCard