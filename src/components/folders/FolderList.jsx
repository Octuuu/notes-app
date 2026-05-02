import React from 'react'
import FolderCard from './FolderCard'

const FolderList = ({ folders, onFolderDelete, onFolderUpdate }) => {
  if (!folders || folders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No hay carpetas aún</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primera carpeta para empezar</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onDelete={onFolderDelete}
          onUpdate={onFolderUpdate}
        />
      ))}
    </div>
  )
}

export default FolderList