import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

export default function Layout({ children }) {
  const location = useLocation()
  const isRecorderPage = location.pathname === '/record'

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className={`pb-20 ${isRecorderPage ? 'pt-0' : 'pt-16'}`}>
        <div className="max-w-screen-lg mx-auto px-4">
          {children}
        </div>
      </main>
      <Navigation />
    </div>
  )
}