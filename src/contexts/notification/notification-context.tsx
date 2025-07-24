"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type NotificationType = "info" | "success" | "warning" | "error"

export type Notification = {
  id: string
  message: string
  type: NotificationType
  title?: string
  timestamp: Date
  read: boolean
  target?: string[]
  action?: () => void
  expiresAt?: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length

  // Effect to remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications(prev => 
        prev.filter(notification => {
          // Keep notifications that don't have an expiration or haven't expired yet
          return !notification.expiresAt || notification.expiresAt > now
        })
      )
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  // Effect to remove notifications that are older than 3 months
  useEffect(() => {
    const interval = setInterval(() => {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      setNotifications(prev => 
        prev.filter(notification => {
          return notification.timestamp > threeMonthsAgo
        })
      )
    }, 86400000) // Check once a day
    
    return () => clearInterval(interval)
  }, [])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
} 