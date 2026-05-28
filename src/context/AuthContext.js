import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_TOKEN_KEY } from '../constants/config';
import * as authApi from '../api/authApi';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user,setUser]=useState(null); const [token,setToken]=useState(null); const [loading,setLoading]=useState(true);
  const checkAuth = async () => { setLoading(true); try { const t=await AsyncStorage.getItem(STORAGE_TOKEN_KEY); if(!t){setToken(null);setUser(null);return;} setToken(t); const me=await authApi.getMe(); setUser(me.data?.data||null);} catch {await AsyncStorage.removeItem(STORAGE_TOKEN_KEY); setToken(null); setUser(null);} finally {setLoading(false);} };
  useEffect(()=>{checkAuth();},[]);
  const login=async(data)=>{const r=await authApi.login(data); const t=r.data?.data?.token||r.data?.token; await AsyncStorage.setItem(STORAGE_TOKEN_KEY,t); setToken(t); await checkAuth(); return r;};
  const register=async(data)=>authApi.register(data);
  const logout=async()=>{await AsyncStorage.removeItem(STORAGE_TOKEN_KEY); setToken(null); setUser(null);};
  const value=useMemo(()=>({user,token,loading,isAuthenticated:!!token,login,register,logout,checkAuth}),[user,token,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);
