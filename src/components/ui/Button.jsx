import React from 'react'

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default',
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none btn-touch'
  
  const variants = {
    default: 'bg-primary text-white hover:bg-blue-600 focus:ring-primary',
    secondary: 'bg-gray-100 text-textPrimary hover:bg-gray-200 focus:ring-gray-500',
    destructive: 'bg-destructive text-white hover:bg-red-600 focus:ring-destructive',
    ghost: 'hover:bg-gray-100 focus:ring-gray-500',
    accent: 'bg-accent text-white hover:bg-orange-500 focus:ring-accent'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6',
    icon: 'h-10 w-10'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button