import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,

  addNotification: (notif) => set(state => ({
    notifications: [notif, ...state.notifications].slice(0, 50),
    unreadCount:   state.unreadCount + 1,
  })),

  markAllRead: () => set({ unreadCount: 0 }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))