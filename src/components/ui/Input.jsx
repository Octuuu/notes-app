import React from 'react'

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        )}
        <input
          className={`w-full px-4 py-2 bg-dark-800 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 text-gray-100 placeholder:text-gray-500
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-700 focus:border-purple-500 focus:ring-purple-500'}
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

export default Input