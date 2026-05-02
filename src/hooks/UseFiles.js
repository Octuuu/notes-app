import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export const useFiles = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFile = async (file, noteId) => {
    if (!user || !noteId) return null

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${noteId}/${fileName}`

      // Simular progreso
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const { error: uploadError } = await supabase.storage
        .from('notes-attachments')
        .upload(filePath, file)

      clearInterval(interval)
      setProgress(100)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('notes-attachments')
        .getPublicUrl(filePath)

      // Actualizar la nota con la URL del archivo
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type
        })
        .eq('id', noteId)

      if (updateError) throw updateError

      setUploading(false)
      return { publicUrl, fileName: file.name, fileType: file.type }
    } catch (err) {
      setError(err.message)
      setUploading(false)
      return null
    }
  }

  const deleteFile = async (noteId, fileUrl) => {
    if (!noteId || !fileUrl) return false

    try {
      // Extraer la ruta del archivo de la URL
      const filePath = fileUrl.split('/').slice(-3).join('/')

      const { error: deleteError } = await supabase.storage
        .from('notes-attachments')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Limpiar la referencia en la nota
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          file_url: null,
          file_name: null,
          file_type: null
        })
        .eq('id', noteId)

      if (updateError) throw updateError

      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const getFileUrl = (path) => {
    const { data: { publicUrl } } = supabase.storage
      .from('notes-attachments')
      .getPublicUrl(path)
    return publicUrl
  }

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    uploading,
    progress,
    error,
  }
}