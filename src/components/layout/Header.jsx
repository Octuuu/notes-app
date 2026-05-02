import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Header = ({ onMenuClick }) => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-20">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Botón menú móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-dark-700 transition"
        >
          <Menu size={20} />
        </button>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar notas, carpetas..."
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </form>

        {/* Notificaciones y perfil */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-dark-700 transition relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-700 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="hidden md:inline text-sm">
              {profile?.username || user?.email?.split('@')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header