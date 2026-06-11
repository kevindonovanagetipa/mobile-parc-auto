import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

export const socket = io('http://192.168.1.100:5000', {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export async function connectSocketWithAuth() {
  const token = await AsyncStorage.getItem('token');

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }
}
