import React, { useState, useRef } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'

const FileUpload = ({ onUpload, onRemove, file, accept = '*/*', maxSize = 5242880 }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${maxSize / 1048576}MB`)
      return false
    }
    return true
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)
    if (!validateFile(selectedFile)) return

    setUploading(true)
    setProgress(0)
    let interval

    try {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // BLINDAJE: Forzamos la creación de un Blob binario limpio basado en el archivo
      // Esto destruye cualquier cabecera oculta de formulario que Firefox/Chrome intenten inyectar
      const cleanBlob = new Blob([selectedFile], { type: selectedFile.type })
      cleanBlob.name = selectedFile.name // preservamos el nombre

      await onUpload(cleanBlob)
      
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setUploading(false), 500)
    } catch (err) {
      setError(err?.message || 'Error al subir el archivo')
      setUploading(false)
    } finally {
      if (interval) clearInterval(interval)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onRemove?.()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (file) {
    return (
      <div className="p-3 bg-dark-700 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <File size={18} className="text-purple-400" />
          <div>
            <p className="text-sm font-medium truncate max-w-[150px]">{file.name}</p>
          </div>
        </div>
        <button onClick={handleRemove} className="p-1 hover:bg-dark-600 rounded transition">
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-dark-600 rounded-lg p-4 text-center transition ${
          uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-purple-500'
        }`}
      >
        <Upload className="mx-auto text-gray-500 mb-1" size={24} />
        <p className="text-xs text-gray-400">Subir archivo (máx. 5MB)</p>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg text-red-400 text-xs">
          <AlertCircle size={14} />
          <span className="truncate">{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}

export default FileUpload