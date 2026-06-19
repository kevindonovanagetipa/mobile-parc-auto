const USE_EMULATOR = false;

export const API_BASE_URL = USE_EMULATOR
  ? 'http://192.168.88.74:5000'
  : 'http://192.168.1.100:5000';