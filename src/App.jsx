import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import FolderView from './pages/FolderView'
import NoteDetail from './pages/NoteDetail'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/folder/:folderId" element={
            <ProtectedRoute>
              <FolderView />
            </ProtectedRoute>
          } />
          <Route path="/folder/:folderId/note/:noteId" element={
            <ProtectedRoute>
              <NoteDetail />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App