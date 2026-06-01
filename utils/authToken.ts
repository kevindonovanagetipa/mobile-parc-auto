import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp?: number;
};

export async function getValidToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      await AsyncStorage.removeItem('token');
      return null;
    }

    const isExpired = decoded.exp * 1000 <= Date.now();

    if (isExpired) {
      await AsyncStorage.removeItem('token');
      return null;
    }

    return token;
  } catch (error) {
    await AsyncStorage.removeItem('token');
    return null;
  }
}