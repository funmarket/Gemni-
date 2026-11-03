import { useState, useEffect, useCallback } from 'react';
import { 
  notificationService, 
  AppNotification 
} from '@/services/notificationService';

export function useAppNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    notificationService.getNotifications()
  );
  const [unreadCount, setUnreadCount] = useState<number>(() => 
    notificationService.getUnreadCount()
  );

  const refresh = useCallback(() => {
    const list = notificationService.getNotifications();
    setNotifications([...list]);
    setUnreadCount(list.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = notificationService.subscribe(refresh);

    const handleCustomChange = () => {
      refresh();
    };

    window.addEventListener('vq_notifications_changed', handleCustomChange);
    window.addEventListener('storage', handleCustomChange);

    return () => {
      unsubscribe();
      window.removeEventListener('vq_notifications_changed', handleCustomChange);
      window.removeEventListener('storage', handleCustomChange);
    };
  }, [refresh]);

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    refresh();
  }, [refresh]);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
    refresh();
  }, [refresh]);

  const deleteNotification = useCallback((id: string) => {
    notificationService.deleteNotification(id);
    refresh();
  }, [refresh]);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
    refresh();
  }, [refresh]);

  const addNotification = useCallback((
    item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const created = notificationService.addNotification(item);
    refresh();
    return created;
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    refresh
  };
}
