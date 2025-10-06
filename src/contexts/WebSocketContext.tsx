/**
 * WebSocket Context for React Components
 * Provides WebSocket connection and notification state management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService, WebSocketMessage, NotificationMessage, WebSocketConnection } from '../services/websocketService';

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  connectionState: WebSocketConnection;
  
  // Notifications
  notifications: NotificationMessage[];
  unreadCount: number;
  
  // Methods
  connect: (token: string) => Promise<boolean>;
  disconnect: () => void;
  markNotificationRead: (notificationId: number) => void;
  markAllNotificationsRead: () => void;
  sendMessage: (message: WebSocketMessage) => boolean;
  
  // Real-time data
  newNotification: NotificationMessage | null;
  clearNewNotification: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<WebSocketConnection>({
    isConnected: false,
    reconnectAttempts: 0,
    lastMessageTime: null,
    connectionId: null
  });
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    // Subscribe to WebSocket events
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionState(websocketService.getConnectionState());
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionState(websocketService.getConnectionState());
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    const handleMessage = (message: WebSocketMessage) => {
      console.log('WebSocket message received:', message);
    };

    const handleNotification = (notification: NotificationMessage) => {
      console.log('New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Set as new notification for UI alerts
      setNewNotification(notification);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted' && notification.priority === 'critical') {
        new Notification(notification.title || 'PsychNow Alert', {
          body: notification.message,
          icon: '/favicon.ico',
          tag: 'psychnow-notification'
        });
      }
    };

    const handleHighRiskAlert = (alert: NotificationMessage) => {
      console.log('High-risk alert received:', alert);
      
      // Handle high-risk alerts with special priority
      setNotifications(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
      setNewNotification(alert);
      
      // Show critical browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 High-Risk Patient Alert', {
          body: alert.message,
          icon: '/favicon.ico',
          tag: 'high-risk-alert',
          requireInteraction: true
        });
      }
    };

    const handleProviderAssignment = (assignment: NotificationMessage) => {
      console.log('Provider assignment received:', assignment);
      
      setNotifications(prev => [assignment, ...prev]);
      setUnreadCount(prev => prev + 1);
      setNewNotification(assignment);
    };

    // Subscribe to WebSocket events
    websocketService.subscribe('connected', handleConnected);
    websocketService.subscribe('disconnected', handleDisconnected);
    websocketService.subscribe('error', handleError);
    websocketService.subscribe('message', handleMessage);
    websocketService.subscribe('high_risk_alert', handleHighRiskAlert);
    websocketService.subscribe('provider_assignment', handleProviderAssignment);
    websocketService.subscribe('system_notification', handleNotification);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
    }, 1000);

    return () => {
      // Unsubscribe from events
      websocketService.unsubscribe('connected', handleConnected);
      websocketService.unsubscribe('disconnected', handleDisconnected);
      websocketService.unsubscribe('error', handleError);
      websocketService.unsubscribe('message', handleMessage);
      websocketService.unsubscribe('high_risk_alert', handleHighRiskAlert);
      websocketService.unsubscribe('provider_assignment', handleProviderAssignment);
      websocketService.unsubscribe('system_notification', handleNotification);
      
      clearInterval(stateInterval);
    };
  }, []);

  const connect = async (token: string): Promise<boolean> => {
    try {
      const success = await websocketService.connect(token);
      if (success) {
        setIsConnected(true);
        setConnectionState(websocketService.getConnectionState());
      }
      return success;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return false;
    }
  };

  const disconnect = (): void => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionState(websocketService.getConnectionState());
  };

  const markNotificationRead = (notificationId: number): void => {
    websocketService.markNotificationRead(notificationId);
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = (): void => {
    // Mark all unread notifications as read
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);
  };

  const sendMessage = (message: WebSocketMessage): boolean => {
    return websocketService.sendMessage(message);
  };

  const clearNewNotification = (): void => {
    setNewNotification(null);
  };

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionState,
    notifications,
    unreadCount,
    connect,
    disconnect,
    markNotificationRead,
    markAllNotificationsRead,
    sendMessage,
    newNotification,
    clearNewNotification
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
