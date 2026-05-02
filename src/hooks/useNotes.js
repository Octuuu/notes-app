import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export const useNotes = (folderId = null) => {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (folderId) {
        query = query.eq('folder_id', folderId)
      }

      const { data, error } = await query

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, folderId])

  const createNote = useCallback(async (title, folderIdParam = folderId) => {
    if (!user || !folderIdParam) return null

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: title || 'Nueva nota',
          folder_id: folderIdParam,
          user_id: user.id,
          content: ''
        }])
        .select()
        .single()

      if (error) throw error
      setNotes(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [user, folderId])

  const updateNote = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setNotes(prev => prev.map(n => n.id === id ? data : n))
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  const deleteNote = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotes(prev => prev.filter(n => n.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  const toggleFavorite = useCallback(async (id, isFavorite) => {
    return updateNote(id, { is_favorite: !isFavorite })
  }, [updateNote])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  }
}