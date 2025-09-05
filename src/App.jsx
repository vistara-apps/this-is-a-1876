import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RightsCards from './pages/RightsCards'
import Recorder from './pages/Recorder'
import AIAssistant from './pages/AIAssistant'
import Profile from './pages/Profile'
import StateLaws from './pages/StateLaws'
import { useApp } from './context/AppContext'

function App() {
  const { isLoading } = useApp()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rights" element={<RightsCards />} />
        <Route path="/laws" element={<StateLaws />} />
        <Route path="/record" element={<Recorder />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App