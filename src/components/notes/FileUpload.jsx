import React, { useState, useRef } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

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
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setError(null)
    if (!validateFile(selectedFile)) return

    setUploading(true)
    setProgress(0)

    try {
      // Simular progreso de subida
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      await onUpload(selectedFile)
      
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setUploading(false), 500)
    } catch (err) {
      setError('Error al subir el archivo')
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (file) {
    return (
      <div className="p-3 bg-dark-700 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <File size={18} className="text-purple-400" />
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
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
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition"
      >
        <Upload className="mx-auto text-gray-500 mb-2" size={32} />
        <p className="text-sm text-gray-400">
          Haz clic para subir un archivo
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, Imágenes, Documentos (máx. 5MB)
        </p>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">Subiendo... {progress}%</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
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