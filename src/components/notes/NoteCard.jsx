import React, { useState } from 'react'
import { FileText, MoreVertical, Edit2, Trash2, Star, File, Calendar } from 'lucide-react'
import { formatDate, truncateText } from '../../lib/utils'

const NoteCard = ({ note, onDelete, onUpdate, onClick }) => {
  const [showMenu, setShowMenu] = useState(false)

  const toggleFavorite = async () => {
    // Implementar favoritos
    onUpdate?.()
  }

  return (
    <div
      onClick={() => onClick?.(note.id)}
      className="group bg-dark-800/50 border border-dark-700 rounded-xl p-4 hover:border-purple-500/50 hover:bg-dark-800 transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-purple-400" />
            <h3 className="font-medium text-gray-100">{note.title || 'Sin título'}</h3>
            {note.is_favorite && (
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
            )}
          </div>
          
          {note.content && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
              {truncateText(note.content, 100)}
            </p>
          )}
          
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
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-2 rounded-lg hover:bg-dark-700 transition opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} className="text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 animate-fade-in">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(); setShowMenu(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition"
              >
                <Star size={14} /> {note.is_favorite ? 'Quitar favorito' : 'Favorito'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); setShowMenu(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteCard