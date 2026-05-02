import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

const DeleteFolderDialog = ({ isOpen, onClose, onConfirm, folderName }) => {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (confirmText !== folderName) return
    
    setLoading(true)
    await onConfirm()
    setLoading(false)
    setConfirmText('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-800 rounded-2xl w-full max-w-md p-6 border border-dark-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-semibold">Eliminar carpeta</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-300 mb-2">
          ¿Estás seguro de eliminar la carpeta <span className="font-semibold text-white">"{folderName}"</span>?
        </p>
        
        <p className="text-sm text-red-400 mb-4">
          ⚠️ Esta acción eliminará permanentemente la carpeta y TODAS las notas dentro de ella.
        </p>
        
        <p className="text-sm text-gray-400 mb-2">
          Escribe <span className="font-mono text-purple-400">{folderName}</span> para confirmar:
        </p>
        
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="input-primary mb-4"
          placeholder={folderName}
          autoFocus
        />
        
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={confirmText !== folderName || loading} 
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteFolderDialog