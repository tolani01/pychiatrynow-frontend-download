/**
 * WebSocket Service for Real-time Notifications
 * Handles WebSocket connections, authentication, and message broadcasting
 */

export interface WebSocketMessage {
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  message?: string;
  data?: any;
  timestamp?: string;
  target_role?: string;
}

export interface NotificationMessage extends WebSocketMessage {
  id?: number;
  is_read?: boolean;
  created_at?: string;
}

export interface WebSocketConnection {
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessageTime: Date | null;
  connectionId: string | null;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private connectionState: WebSocketConnection = {
    isConnected: false,
    reconnectAttempts: 0,
    lastMessageTime: null,
    connectionId: null
  };

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize WebSocket connection with authentication
   */
  public async connect(token: string): Promise<boolean> {
    this.token = token;
    
    try {
      const wsUrl = this.buildWebSocketUrl(token);
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionState.isConnected = true;
          this.connectionState.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionState.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (event.code !== 1000) { // Not a normal closure
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.connectionState.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return false;
    }
  }

  /**
   * Disconnect WebSocket connection
   */
  public disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    
    this.connectionState.isConnected = false;
    this.connectionState.reconnectAttempts = 0;
    this.emit('disconnected');
  }

  /**
   * Send message through WebSocket
   */
  public sendMessage(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.connectionState.lastMessageTime = new Date();
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to specific message types
   */
  public subscribe(messageType: string, handler: Function): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Unsubscribe from message types
   */
  public unsubscribe(messageType: string, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get connection state
   */
  public getConnectionState(): WebSocketConnection {
    return { ...this.connectionState };
  }

  /**
   * Mark notification as read
   */
  public markNotificationRead(notificationId: number): void {
    this.sendMessage({
      type: 'mark_notification_read',
      data: { notification_id: notificationId }
    });
  }

  /**
   * Send ping to server
   */
  public ping(): void {
    this.sendMessage({
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }

  private buildWebSocketUrl(token: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port || (protocol === 'wss:' ? '443' : '8000');
    
    return `${protocol}//${host}:${port}/api/v1/ws?token=${encodeURIComponent(token)}`;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.connectionState.lastMessageTime = new Date();
      
      // Handle special message types
      if (message.type === 'ping') {
        this.ping();
        return;
      }
      
      if (message.type === 'connection_established') {
        this.connectionState.connectionId = message.data?.user_id?.toString() || null;
        this.emit('authenticated', message);
        return;
      }

      // Emit message to subscribers
      this.emit(message.type, message);
      
      // Emit to all handlers
      this.emit('message', message);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private attemptReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    if (!this.token) {
      console.error('No authentication token available for reconnection');
      return;
    }

    this.connectionState.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.connectionState.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(this.token!);
    }, this.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState.isConnected) {
        this.ping();
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private emit(event: string, data?: any): void {
    // Emit to specific event handlers
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private setupEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.token) {
        // Reconnect when page becomes visible
        if (!this.connectionState.isConnected) {
          this.connect(this.token);
        }
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export types
export type { WebSocketMessage, NotificationMessage, WebSocketConnection };
