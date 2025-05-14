import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { Text } from 'react-native-paper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
        <Image
        source={require('../assets/words.png')}
        style={{ width: 250, height: 250, alignSelf: 'center', margin: 16 }}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Connect')}
      >
        <Text variant='bodyMedium' style={{fontWeight: 'bold'}}>Conectar a un dispositivo</Text>
      </TouchableOpacity>
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
    backgroundColor: '#617AFA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginBottom: 40
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
  },
});

export default HomeScreen;
