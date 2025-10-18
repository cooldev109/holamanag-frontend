import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Attempting to connect to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: false,
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[WebSocket] Connected successfully! Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[WebSocket] Disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && !!this.socket?.connected;
  }

  /**
   * Join a property room for targeted updates
   */
  joinProperty(propertyId: string): void {
    if (this.socket) {
      this.socket.emit('join', { propertyId });
    }
  }

  /**
   * Leave a property room
   */
  leaveProperty(propertyId: string): void {
    if (this.socket) {
      this.socket.emit('leave', { propertyId });
    }
  }

  /**
   * Listen for booking created events
   */
  onBookingCreated(callback: (data: {
    propertyId: string;
    roomId: string;
    dates: string[];
    channel: string;
    guestName: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on('booking:created', callback);
    }
  }

  /**
   * Listen for global booking created events (all properties)
   */
  onBookingCreatedGlobal(callback: (data: {
    propertyId: string;
    roomId: string;
    dates: string[];
    channel: string;
    guestName: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on('booking:created:global', callback);
    }
  }

  /**
   * Listen for inventory updated events
   */
  onInventoryUpdated(callback: (data: {
    propertyId: string;
    roomId: string;
    date: string;
    totalRooms: number;
    availableRooms: number;
    bookedRooms: number;
  }) => void): void {
    if (this.socket) {
      this.socket.on('inventory:updated', callback);
    }
  }

  /**
   * Listen for booking cancelled events
   */
  onBookingCancelled(callback: (data: {
    propertyId: string;
    roomId: string;
    bookingId: string;
    dates: string[];
  }) => void): void {
    if (this.socket) {
      this.socket.on('booking:cancelled', callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;



