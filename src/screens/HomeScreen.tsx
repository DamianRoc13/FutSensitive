import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { Button, Text } from 'react-native-paper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
        <Image
        source={require('../assets/words.svg')}
        style={{ width: 400, height: 250, alignSelf: 'center', margin: -20, justifyContent: 'center', alignItems: 'center' }}
        resizeMode="contain"
      />
      <Button
        style={styles.button}
        onPress={() => navigation.navigate('Connect')}
        mode='contained-tonal'
      >
        <Text allowFontScaling maxFontSizeMultiplier={2} style={{color: 'white', fontFamily: 'serif', fontWeight: 'bold'}}>Conectar a un dispositivo</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 32,
    color: colors.primary
  },
  button: {
    backgroundColor: '#1a40fcff',
    paddingVertical: 3,
    paddingHorizontal: 1,
    borderRadius: 20,
    marginBottom: 40
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
  },
});

export default HomeScreen;
