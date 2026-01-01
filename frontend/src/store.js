import { reactive } from 'vue';
import axios from 'axios';
import socketService from './services/socket';

const state = reactive({
  user: {
    id: null,
    username: null,
    token: localStorage.getItem('token') || null,
    color: '#000000',
  },
  rooms: [],
  currentRoomId: null,
  messages: [],
  typingUsers: {},
});

const API_URL = 'http://localhost:3000';

const actions = {
  init() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setUser({ access_token: token });
    }
  },

  setupSocketListeners() {
    socketService.on('newMessage', (message) => {
      if (message.room && message.room.id === state.currentRoomId) {
        if (!state.messages.find((m) => m.id === message.id)) {
          state.messages.push(message);
        }
      } else if (message.roomId === state.currentRoomId) {
        state.messages.push(message);
      }
    });

    socketService.on('allMessages', (messages) => {
      state.messages = messages;
    });

    socketService.on('userTyping', (payload) => {
      if (payload.roomId === state.currentRoomId) {
        if (payload.isTyping) {
          state.typingUsers[payload.username] = true;
        } else {
          delete state.typingUsers[payload.username];
        }
      }
    });

    socketService.on('colorChange', (payload) => {
      if (state.user.id === payload.userId) {
        state.user.color = payload.color;
      }

      state.messages.forEach((msg) => {
        if (msg.sender && msg.sender.id === payload.userId) {
          msg.sender.color = payload.color;
        }
      });
    });
  },

  setUser(data) {
    const token = data.access_token;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      const payload = JSON.parse(jsonPayload);

      state.user.id = payload.sub;
      state.user.username = payload.username;
      state.user.color = payload.color || '#000000';
      state.user.token = token;

      localStorage.setItem('token', token);

      socketService.connect(state.user.token);
      this.setupSocketListeners();
    } catch (e) {
      console.error('Failed to decode token', e);
      this.logout();
    }
  },

  logout() {
    state.user.id = null;
    state.user.username = null;
    state.user.token = null;
    state.rooms = [];
    state.messages = [];
    state.currentRoomId = null;

    localStorage.removeItem('token');

    socketService.disconnect();
  },

  async fetchRooms() {
    try {
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${state.user.token}` },
      });
      state.rooms = response.data;
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  },

  async createRoom(name, isPrivate) {
    try {
      const response = await axios.post(
        `${API_URL}/rooms`,
        { name, isPrivate },
        { headers: { Authorization: `Bearer ${state.user.token}` } }
      );
      state.rooms.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create room', error);
      throw error;
    }
  },

  joinRoom(roomId) {
    if (state.currentRoomId) {
      socketService.leaveRoom(state.currentRoomId);
    }

    state.currentRoomId = roomId;
    state.messages = [];
    state.typingUsers = {};

    socketService.joinRoom(roomId);
  },

  async addUserToRoom(roomId, username) {
    try {
      await axios.post(
        `${API_URL}/rooms/${roomId}/users`,
        { username },
        { headers: { Authorization: `Bearer ${state.user.token}` } }
      );
    } catch (error) {
      throw error;
    }
  },
};

export const store = {
  state,
  ...actions,
};
