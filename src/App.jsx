import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import FolderView from './pages/FolderView'
import NoteDetail from './pages/NoteDetail'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/ui/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth" />
  return children
}

function AppRoutes() {
  return (
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
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App