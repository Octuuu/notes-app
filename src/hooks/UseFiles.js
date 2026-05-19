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
    let interval = null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${noteId}/${fileName}`

      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // SOLUCIÓN RADICAL: Convertimos el archivo a un ArrayBuffer de bytes puros.
      // Cero formularios, cero envolturas. Datos binarios crudos que no generan error 400.
      const arrayBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('notes-attachments')
        .upload(filePath, arrayBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true
        })

      if (uploadError) throw uploadError

      clearInterval(interval)
      setProgress(100)

      const { data: { publicUrl } } = supabase.storage
        .from('notes-attachments')
        .getPublicUrl(filePath)

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
      if (interval) clearInterval(interval)
      setError(err.message)
      setUploading(false)
      return null
    }
  }

  const deleteFile = async (noteId, fileUrl) => {
    if (!noteId || !fileUrl) return false
    try {
      const filePath = fileUrl.split('/').slice(-3).join('/')
      const { error: deleteError } = await supabase.storage
        .from('notes-attachments')
        .remove([filePath])

      if (deleteError) throw deleteError

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

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
    error,
  }
}