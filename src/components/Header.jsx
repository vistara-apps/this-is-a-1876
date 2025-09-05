import React from 'react'
import { useLocation } from 'react-router-dom'
import { Shield, Menu, Bell } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const location = useLocation()
  const { user } = useApp()
  const isRecorderPage = location.pathname === '/record'

  if (isRecorderPage) return null

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard'
      case '/rights': return 'Rights Cards'
      case '/laws': return 'State Laws'
      case '/ai': return 'AI Assistant'
      case '/profile': return 'Profile'
      default: return 'Legal Shield'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-gray-200 z-40">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-heading text-textPrimary">Legal Shield</h1>
              <p className="text-xs text-textSecondary">{getPageTitle()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user.subscriptionStatus === 'premium' && (
              <span className="px-2 py-1 bg-accent text-white text-xs rounded-md font-medium">
                Premium
              </span>
            )}
            <button className="btn-touch p-2 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5 text-textSecondary" />
            </button>
            <button className="btn-touch p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-5 w-5 text-textSecondary" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}