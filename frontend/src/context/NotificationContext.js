import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    o.start();
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      o.stop();
    }, 250);
  } catch (e) {
    // ignore if WebAudio not available
    console.warn('Audio play failed', e);
  }
}

const NotificationStateContext = createContext();
const NotificationDispatchContext = createContext();

function notificationsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state];
    case 'MARK_READ':
      return state.map(n => (n.id === action.payload ? { ...n, read: true } : n));
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const initial = (() => {
    try {
      const raw = localStorage.getItem('notifications');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return [];
  })();

  const [state, dispatch] = useReducer(notificationsReducer, initial);
  const prevLenRef = useRef(state.length);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist notifications', e);
    }
  }, [state]);

  // Request Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission().catch(() => {});
      } catch (e) {}
    }
  }, []);

  // Play sound and show toast/browser notification when a new notification is added
  useEffect(() => {
    if (state.length > prevLenRef.current) {
      const latest = state[0];
      if (latest) {
        // toast
        toast.info(latest.title + (latest.message ? ` — ${latest.message}` : ''), { autoClose: 4000 });

        // sound
        playSound();

        // Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const n = new Notification(latest.title, {
              body: latest.message,
            });
            setTimeout(() => n.close(), 5000);
          } catch (e) {}
        }
      }
    }
    prevLenRef.current = state.length;
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <NotificationDispatchContext.Provider value={dispatch}>
      <NotificationStateContext.Provider value={state}>
        {children}
      </NotificationStateContext.Provider>
    </NotificationDispatchContext.Provider>
  );
}

export function useNotifications() {
  const state = useContext(NotificationStateContext);
  if (state === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return state;
}

export function useNotificationDispatch() {
  const dispatch = useContext(NotificationDispatchContext);
  if (dispatch === undefined) {
    throw new Error('useNotificationDispatch must be used within NotificationProvider');
  }
  return dispatch;
}

export function addNotification(dispatch, { type, title, message, data }) {
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
  dispatch({ type: 'ADD', payload: { id, type, title, message, data, createdAt: new Date(), read: false } });
  return id;
}

export function markRead(dispatch, id) {
  dispatch({ type: 'MARK_READ', payload: id });
}

export function clearNotifications(dispatch) {
  dispatch({ type: 'CLEAR' });
}

export default NotificationProvider;
