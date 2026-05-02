import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Home, Folder, Star, LogOut, User, Settings } from 'lucide-react'

const Sidebar = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/favorites', icon: Star, label: 'Favoritos' },
    { to: '/all-folders', icon: Folder, label: 'Todas las carpetas' },
  ]

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NoteKeep
          </h1>
        </div>
      </div>

      {/* Perfil */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.username || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700 space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors w-full"
        >
          <Settings size={18} />
          <span className="text-sm">Configuración</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut size={18} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar