import { io } from 'socket.io-client';

export const socket = io('http://192.168.1.100:5000', {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});