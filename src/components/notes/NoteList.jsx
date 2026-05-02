import React from 'react'
import NoteCard from './NoteCard'

const NoteList = ({ notes, onNoteDelete, onNoteUpdate, onNoteClick }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No hay notas en esta carpeta</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primera nota para empezar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onNoteDelete}
          onUpdate={onNoteUpdate}
          onClick={onNoteClick}
        />
      ))}
    </div>
  )
}

export default NoteList