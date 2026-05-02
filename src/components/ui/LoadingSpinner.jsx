import React from 'react'

const LoadingSpinner = ({ fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <div className="w-12 h-12 border-3 border-pink-500/20 border-b-pink-500 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse' }} />
      </div>
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingSpinner