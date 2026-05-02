import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, UserCircle, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const UserMenu = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
    setIsOpen(false)
  }

  const menuItems = [
    { icon: UserCircle, label: 'Mi perfil', onClick: () => navigate('/profile') },
    { icon: Settings, label: 'Configuración', onClick: () => navigate('/settings') },
    { icon: HelpCircle, label: 'Ayuda', onClick: () => navigate('/help') },
    { icon: LogOut, label: 'Cerrar sesión', onClick: handleLogout, danger: true },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-700 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <User size={16} />
        </div>
        <span className="hidden md:inline text-sm">
          {profile?.username || user?.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="p-3 border-b border-dark-700">
            <p className="text-sm font-medium text-white">
              {profile?.username || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition ${
                  item.danger 
                    ? 'text-red-400 hover:bg-red-500/10' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu