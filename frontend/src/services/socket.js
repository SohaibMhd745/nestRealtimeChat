import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io('http://localhost:3000', {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
      this.socket = null;
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('joinRoom', roomId);
  }

  leaveRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', roomId);
  }

  sendMessage(content, senderId, roomId) {
    if (!this.socket) return;
    this.socket.emit('sendMessage', { content, senderId, roomId });
  }

  sendTyping(username, isTyping, roomId) {
    if (!this.socket) return;
    this.socket.emit('typing', { username, isTyping, roomId });
  }

  getMessages(roomId) {
    if (!this.socket) return;
    this.socket.emit('getMessages', roomId);
  }

  sendChangeColor(userId, color) {
    if (!this.socket) return;
    this.socket.emit('changeColor', { userId, color });
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

const socketService = new SocketService();
export default socketService;
