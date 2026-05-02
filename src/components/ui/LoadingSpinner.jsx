import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner