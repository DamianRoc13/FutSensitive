import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { Button, Text, Dialog, Portal } from 'react-native-paper';
import { PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showGitafDialog, setShowGitafDialog] = useState(false);

  const showGitafDlg = () => setShowGitafDialog(true);
  const hideGitafDialog = () => setShowGitafDialog(false);

  const openGitafUrl = () => {
    Linking.openURL('https://gitaf.pro/');
    hideGitafDialog();
  };
    const requestBluetoothPermission=async()=>{
      const granted=await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,{
          title: 'Permiso para buscar dispositivos Bluetooth',
          message: 'Es necesario para encontrar los dispositivos para conectarse a ellos',
          buttonNeutral: 'Pregúntame Después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Permitir'
        }
      )
      if(granted===PermissionsAndroid.RESULTS.GRANTED){
        console.log('Permiso Concedido')
      }else{
        console.log('Active Bluetooth manualmente ')
      }
    }
  

  return (
    <>
      <View style={{ backgroundColor: colors.background, flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 30, paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={showGitafDlg}
          accessibilityLabel='Documentación de Gitaf'
        >
          <Icon name="information-circle" size={24} color="#fdfdfdff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Image
          source={require('../assets/words.png')}
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

      <Portal>
        <Dialog visible={showGitafDialog} onDismiss={hideGitafDialog} style={styles.dialogCard}>
          <Dialog.Title style={styles.dialogTitle}>
            <Text allowFontScaling maxFontSizeMultiplier={2} style={{color: 'white', fontWeight: 'bold'}}>Documentación Gitaf</Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.dialogText}>
              Accede a la documentación completa de Gitaf para conocer más sobre las características y funcionalidades disponibles en la plataforma.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideGitafDialog} mode='contained' buttonColor='#ff4444'><Text style={{color: 'white'}}>Cerrar</Text></Button>
            <Button onPress={openGitafUrl} mode='contained' buttonColor='#1a40fcff' style={{paddingHorizontal: 20}}><Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Visitar</Text></Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
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
  dialogCard: {
    backgroundColor: '#252525',
    borderRadius: 20,
  },
  dialogTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogText: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default HomeScreen;
