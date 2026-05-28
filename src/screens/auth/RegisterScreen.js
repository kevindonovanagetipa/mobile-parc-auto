import React,{useState} from 'react';
import {View,Text} from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
export default function RegisterScreen(){const {register}=useAuth();const [form,setForm]=useState({nom:'',prenom:'',email:'',password:''});const upd=(k,v)=>setForm({...form,[k]:v});return <View style={{padding:16}}><Text>Inscription</Text><AppInput label='Nom' value={form.nom} onChangeText={(v)=>upd('nom',v)}/><AppInput label='Prénom' value={form.prenom} onChangeText={(v)=>upd('prenom',v)}/><AppInput label='Email' value={form.email} onChangeText={(v)=>upd('email',v)}/><AppInput label='Password' value={form.password} onChangeText={(v)=>upd('password',v)} secureTextEntry/><AppButton title="S'inscrire" onPress={()=>register(form)}/></View>;}