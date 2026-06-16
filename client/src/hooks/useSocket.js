import { useEffect, useRef } from 'react'
import { io }               from 'socket.io-client'
import { useAuthStore }     from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import toast from 'react-hot-toast'

let socketInstance = null

export const useSocket = () => {
  const { token, user }          = useAuthStore()
  const { addNotification }      = useNotificationStore()
  const initialized              = useRef(false)

  useEffect(() => {
    // Guard — must be logged in
    if (!token || !user) return
    if (initialized.current) return

    const URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
      .replace('/api', '')

    socketInstance = io(URL, {
      auth:            { token },
      withCredentials: true,
      transports:      ['websocket', 'polling'],
    })

    initialized.current = true

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id)
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message)
    })

    // Admin events
    if (user.role === 'admin') {
      socketInstance.on('new_complaint', (data) => {
        addNotification({ type: 'new_complaint', message: `New complaint: ${data.title}`, data, time: new Date() })
        toast(`New complaint: ${data.title}`, { icon: '📋', duration: 5000 })
      })
      socketInstance.on('complaint_ai_updated', (data) => {
        addNotification({ type: 'ai_analyzed', message: `AI analyzed — Priority: ${data.priority}`, data, time: new Date() })
      })
    }

    // Student + staff events
    socketInstance.on('complaint_updated', (data) => {
      addNotification({ type: 'status_update', message: `Complaint status: ${data.status}`, data, time: new Date() })
      toast(`Status updated: ${data.status}`, { icon: '✅' })
    })

    socketInstance.on('complaint_ai_updated', (data) => {
      toast(`AI analyzed — ${data.priority} priority`, { icon: '🤖', duration: 3000 })
    })

    // Staff events
    if (user.role === 'staff') {
      socketInstance.on('task_assigned', (data) => {
        addNotification({ type: 'task_assigned', message: `Task assigned: ${data.title}`, data, time: new Date() })
        toast(`New task: ${data.title}`, { icon: '🔔', duration: 6000 })
      })
    }

    socketInstance.on('disconnect', () => {
      initialized.current = false
    })

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
        initialized.current = false
      }
    }
  }, [token, user])

  return socketInstance
}

export const getSocket = () => socketInstance