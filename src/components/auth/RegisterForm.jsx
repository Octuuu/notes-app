import React, { useState } from 'react'
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Check, X } from 'lucide-react'

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' })

  const validatePassword = (password) => {
    let score = 0
    if (password.length >= 8) score++
    if (password.match(/[a-z]/)) score++
    if (password.match(/[A-Z]/)) score++
    if (password.match(/[0-9]/)) score++
    if (password.match(/[^a-zA-Z0-9]/)) score++
    
    let message = ''
    if (score <= 2) message = 'Débil'
    else if (score <= 4) message = 'Media'
    else message = 'Fuerte'
    
    return { score, message }
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setFormData({ ...formData, password })
    setPasswordStrength(validatePassword(password))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    onSubmit(formData)
  }

  const passwordsMatch = formData.password === formData.confirmPassword
  const isPasswordValid = formData.password.length >= 8

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Nombre de usuario
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="input-primary pl-10"
            placeholder="ej: alex123"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-primary pl-10"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handlePasswordChange}
            className="input-primary pl-10 pr-10"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formData.password && (
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    passwordStrength.score <= 2 ? 'bg-red-500' :
                    passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{passwordStrength.message}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="input-primary pl-10"
            placeholder="••••••••"
            required
          />
        </div>
        {formData.confirmPassword && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {passwordsMatch ? (
              <>
                <Check size={12} className="text-green-500" />
                <span className="text-green-500">Las contraseñas coinciden</span>
              </>
            ) : (
              <>
                <X size={12} className="text-red-500" />
                <span className="text-red-500">Las contraseñas no coinciden</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || !passwordsMatch || !isPasswordValid} 
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <UserPlus size={18} /> Crear Cuenta
          </>
        )}
      </button>
    </form>
  )
}

export default RegisterForm