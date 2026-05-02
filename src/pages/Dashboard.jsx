import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { FolderPlus, FolderOpen, Plus, LogOut, User } from 'lucide-react'
import CreateFolderModal from '../components/folders/CreateFolderModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const username = profile?.username || user?.email?.split('@')[0]

  useEffect(() => {
    fetchFolders()
  }, [user])

  const fetchFolders = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFolders(data)
    }
    setLoading(false)
  }

  const createFolder = async (name) => {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, user_id: user.id }])
      .select()
    
    if (!error && data) {
      setFolders([data[0], ...folders])
    }
    setShowCreateModal(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-dark-900">
     
      <div className=" bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-white font-bold">
                ¡Bienvenido/a, {username}! 
              </h2>
              <p className="text-gray-400 mt-2">
                Organiza tus ideas, documentos y eventos en carpetas personalizadas
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition"
            >
              <LogOut size={18} className='text-white' />
              <span className="hidden sm:inline text-white">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Botón crear carpeta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="font-bold text-white">Mis Carpetas</h2>
            <p className="text-gray-400 text-sm">
              {folders.length} {folders.length === 1 ? 'carpeta' : 'carpetas'} creadas
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-medium transition-all shadow-lg"
          >
            <FolderPlus size={20} />
            <span>Crear Carpeta</span>
          </button>
        </div>

        {/* Listado de carpetas */}
        {folders.length === 0 ? (
          <div className="text-center py-20 bg-dark-800/30 rounded-2xl border-2 border-dashed border-dark-700 animate-fade-in">
            <FolderOpen className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-300">No tienes carpetas aún</h3>
            <p className="text-gray-500 mt-2">Crea tu primera carpeta para empezar a guardar notas</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              Crear primera carpeta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => navigate(`/folder/${folder.id}`)}
                className="group bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-5 hover:border-purple-500/50 hover:bg-dark-800 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <span className="text-2xl">📁</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 text-lg">{folder.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(folder.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createFolder}
      />
    </div>
  )
}

export default Dashboard