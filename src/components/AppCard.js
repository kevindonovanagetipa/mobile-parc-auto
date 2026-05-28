import React from 'react'; import { Pressable, Text, View, StyleSheet } from 'react-native';
export default function AppCard({title,subtitle,children,onPress}){const C=onPress?Pressable:View; return <C onPress={onPress} style={s.c}><Text style={s.t}>{title}</Text>{subtitle?<Text style={s.s}>{subtitle}</Text>:null}{children}</C>}
const s=StyleSheet.create({c:{backgroundColor:'#fff',padding:12,borderRadius:10,marginBottom:10},t:{fontWeight:'700'},s:{color:'#666',marginBottom:6}});
