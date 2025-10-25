'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  onClose?: () => void
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg',
        variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-900'
          : 'border-green-200 bg-green-50 text-green-900'
      )}
    >
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  )
}

interface ToastContextType {
  toast: (props: Omit<ToastProps, 'onClose'>) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...props, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.map(({ id, ...props }) => (
        <Toast key={id} {...props} onClose={() => removeToast(id)} />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}