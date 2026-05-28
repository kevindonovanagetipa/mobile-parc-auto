import React from 'react'; import { View, ActivityIndicator, Text } from 'react-native';
export default ({text='Chargement...'})=><View style={{padding:20,alignItems:'center'}}><ActivityIndicator/><Text>{text}</Text></View>;
