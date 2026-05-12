import React, { useState } from 'react'
import { X, FolderPlus } from 'lucide-react'

const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setLoading(true)
    await onCreate(name)
    setLoading(false)
    setName('')
    onClose()
  }

  // Función para cerrar si se hace clic en el fondo (overlay)
  const handleBackdropClick = (e) => {
    // Solo cierra si el clic fue en el fondo y no dentro del contenido del modal
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick} // <--- Cierre al hacer clic fuera
    >
      <div className="bg-dark-800 rounded-2xl w-full max-w-md p-6 border border-dark-700 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="text-purple-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Crear nueva carpeta</h2>
          </div>
          
          {/* Botón X actualizado con color para que sea visible */}
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-dark-700 text-gray-400 hover:text-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-400 mb-3">
            Organiza tus notas en carpetas personalizadas
          </p>
          
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Universidad, Trabajo, Frases inspiradoras..."
            className="input-primary mb-4 w-full p-2 rounded bg-dark-700 text-white outline-none focus:ring-1 focus:ring-purple-500"
          />
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary flex-1 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="btn-primary flex-1 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition"
            >
              {loading ? 'Creando...' : 'Crear carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFolderModal