import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import ControlScreen from './src/screens/ControlScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import TalkBackScreen from './src/screens/TalkackScreen';
import Walkthrough from './src/components/Walkthrough';
import { hasCompletedWalkthrough, markWalkthroughCompleted } from './src/services/StorageService';

export type RootStackParamList = {
  Home: undefined;
  Connect: undefined;
  Control: undefined;
  Talkback: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [isLoadingWalkthroughState, setIsLoadingWalkthroughState] = useState(true);

  useEffect(() => {
    const checkAndShowWalkthrough = async () => {
      try {
        const completed = await hasCompletedWalkthrough();
        if (!completed) {
          setShowWalkthrough(true);
        }
      } catch (error) {
        console.error('Error al verificar walkthrough:', error);
      } finally {
        setIsLoadingWalkthroughState(false);
      }
    };

    checkAndShowWalkthrough();
  }, []);

  const handleCloseWalkthrough = async () => {
    setShowWalkthrough(false);
    await markWalkthroughCompleted();
  };

  if (isLoadingWalkthroughState) {
    return null; // O un splash screen si lo prefieres
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Connect" component={ConnectScreen} />
          <Stack.Screen name="Control" component={ControlScreen} />
          <Stack.Screen name="Talkback" component={TalkBackScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Walkthrough visible={showWalkthrough} onDismiss={handleCloseWalkthrough} />
    </PaperProvider>
  );
};

export default App;