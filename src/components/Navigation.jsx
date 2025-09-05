import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Shield, FileText, Mic, MessageSquare, User } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/rights', icon: Shield, label: 'Rights' },
  { path: '/laws', icon: FileText, label: 'Laws' },
  { path: '/record', icon: Mic, label: 'Record' },
  { path: '/ai', icon: MessageSquare, label: 'AI' },
  { path: '/profile', icon: User, label: 'Profile' }
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-40">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            const isRecordButton = path === '/record'
            
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center space-y-1 btn-touch p-2 rounded-lg transition-colors ${
                  isRecordButton
                    ? 'bg-destructive text-white hover:bg-red-600'
                    : isActive
                    ? 'text-primary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Icon className={`h-5 w-5 ${isRecordButton ? 'h-6 w-6' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}