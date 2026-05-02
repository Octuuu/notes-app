import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export const useFolders = () => {
  const { user } = useAuth()
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFolders(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createFolder = useCallback(async (name) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{ name, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setFolders(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [user])

  const updateFolder = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setFolders(prev => prev.map(f => f.id === id ? data : f))
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  const deleteFolder = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFolders(prev => prev.filter(f => f.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  return {
    folders,
    loading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  }
}