import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import ControlScreen from './src/screens/ControlScreen';
import { Provider as PaperProvider } from 'react-native-paper';

export type RootStackParamList = {
  Home: undefined;
  Connect: undefined;
  Control: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
  <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Connect" component={ConnectScreen} />
        <Stack.Screen name="Control" component={ControlScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </PaperProvider>
  );
};

export default App;