import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

let socketInstance = null;

export const useSocket = () => {
  const { token, user } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Token nahi hai ya already connected hai toh skip
    if (!token || !user) return;
    if (!token || !user || initialized.current) return;

    // ── Connect karo ────────────────────────────────────────────────────────
    socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth:              { token },
      withCredentials:   true,
      transports:        ['websocket', 'polling'],
    });

    initialized.current = true;

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ── Events sunna — role ke hisaab se ────────────────────────────────────
    if (user.role === 'admin') {
      socketInstance.on('new_complaint', (data) => {
        toast(`📋 New complaint: ${data.title}`, { duration: 5000 });
      });
    }

    socketInstance.on('complaint_updated', (data) => {
      toast(`✅ Complaint status updated: ${data.status}`);
    });

    socketInstance.on('complaint_ai_updated', (data) => {
      toast(`🤖 AI analyzed — Priority: ${data.priority} (${data.severityScore}/10)`);
    });

    if (user.role === 'staff') {
      socketInstance.on('task_assigned', (data) => {
        toast(`🔔 New task assigned: ${data.title}`, { duration: 6000 });
      });
    }

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      initialized.current = false;
    });

    // Cleanup — logout pe disconnect
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, [token, user]);

  return socketInstance;
};

// Kisi bhi component se directly access ke liye
export const getSocket = () => socketInstance;