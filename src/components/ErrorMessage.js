import React from 'react'; import { Text } from 'react-native'; export default ({message})=>message?<Text style={{color:'red',marginBottom:10}}>{message}</Text>:null;
