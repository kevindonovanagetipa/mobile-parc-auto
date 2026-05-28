import React from 'react'; import { TextInput, Text, View, StyleSheet } from 'react-native';
export default function AppInput({label,...props}){return <View style={s.w}><Text style={s.l}>{label}</Text><TextInput style={s.i} {...props}/></View>}
const s=StyleSheet.create({w:{marginBottom:10},l:{marginBottom:4},i:{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10}});
