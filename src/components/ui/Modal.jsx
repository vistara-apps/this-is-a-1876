import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-surface rounded-xl shadow-modal w-full max-w-md animate-slide-up ${className}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-heading text-textPrimary">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className={title ? 'px-6 pb-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  )
}