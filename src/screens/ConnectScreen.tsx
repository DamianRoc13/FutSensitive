import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform, Image
} from 'react-native';
import BleManager from '../services/BleManager';
import { Device } from 'react-native-ble-plx';
import { colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Surface, Text, Button, Dialog, Portal } from 'react-native-paper';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';


type RootStackParamList = {
  Home: undefined;
  Connect: undefined;
  Control: { deviceName: string | null };
  Talkback: { deviceName: string | null };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Connect'>;

const ConnectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [showTalkBackDialog, setShowTalkBack] = useState(true);
  const [talkbackMode, setTalkbackMode] = useState(false);
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);

  
  //const showTalbackConfirmationDialog = () => setShowTalkBack(true);

  const hideBluetoothDialog = () => setShowBluetoothDialog(false);
  const hideTalkBackConfirmationDialog = () => setShowTalkBack(false);

    const confirmTalkBack = async () => {
    setShowTalkBack(false);
    setTalkbackMode(true)
  }

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
      } else {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
      }
    }
    return true;
  };

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      setShowBluetoothDialog(true);
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      )
      return;
    }
  
    setDevices([]);
    setScanning(true);
  
    BleManager.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn('Error al escanear:', error);
        setScanning(false);
        return;
      }
  
      if (device?.name) {
        setDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
  
    setTimeout(() => {
      BleManager.manager.stopDeviceScan();
      setScanning(false);
    }, 20000);
  };

  const stopScan = () => {
    BleManager.manager.stopDeviceScan();
    setScanning(false);
  };
  
  const connectToDevice = async (device: Device) => {
    setConnectingId(device.id);
    try {
      if(talkbackMode){
        await BleManager.connectTo(device)
        navigation.navigate('Talkback', { deviceName: device.name });
        return;
      } else {
      await BleManager.connectTo(device);
      navigation.navigate('Control', { deviceName: device.name } );
      }
    } catch (e) {
      console.warn('Error al conectar:', e);
    } finally {
      setConnectingId(null);
    }
  };

const renderDevice = ({ item }: { item: Device }) => (
  <Surface style={styles.itemContainer}>
    <Image
      source={require('../assets/bl.png')}
      style={{ width: 25, height: 25, alignSelf: 'flex-start', paddingTop: 40 }}
      resizeMode="contain"
    />
    <View style={styles.iconAndText}>
      <View>
        <Text variant="titleMedium" style={styles.deviceTitle}>{item.name}</Text>
        <Text variant="bodyMedium" style={{ color: colors.text, fontSize: 13 }}>
          Dispositivo Bluetooth
        </Text>
      </View>
    </View>
    <Button
      icon="link"
      mode="contained-tonal"
      onPress={() => connectToDevice(item)}
      style={styles.button}
      disabled={!!connectingId}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
        {connectingId === item.id ? 'Vinculando...' : 'Vincular'}
      </Text>
    </Button>
  </Surface>
);
  return (
    <View style={styles.container}>
      <TouchableOpacity
      key={'Regresar a la pantalla de inicio'}
      onPress={() => navigation.navigate('Home')}
      accessibilityLabel='Regresar a la pantalla principal' 
      >
         <Image
              source={require('../assets/back.png')}
              style={{ width: 30, height: 30}}
              resizeMode="contain"
          />
      </TouchableOpacity>
      <Text style={styles.title}>Selecciona un dispositivo</Text>
      <View style={{ alignItems: 'center', marginBottom: 25 }}>
      </View>
      <View style={styles.iconAndText}>
      <Button 
        style={styles.scanButton} 
        onPress={startScan} 
        disabled={scanning}
        mode="contained-tonal"
        buttonColor={scanning ? colors.primary : '#617AFA'}
      >
      <Text style={[styles.scanButton]}>
          {scanning ? 'Buscando...' : 'Buscar Dispositivos'}
      </Text>
      </Button>
      <Button
        style={styles.stopScanButton}
        disabled={!scanning}
        mode="contained-tonal"
        onPress={stopScan}
        buttonColor={scanning ? colors.primary: '#6200ee'}
        accessibilityLabel='Detener búsqueda de dispositivos' 
        >
          <Image
              source={require('../assets/stop-button.png')}
              style={{ width: 35, height: 35, alignSelf: 'center', paddingTop: 10 }}
              resizeMode="center"
          />
      </Button>
      </View>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
      />

            <Portal>
               <Dialog visible={showTalkBackDialog} dismissable={false} style={{backgroundColor: colors.background}}>
                <Dialog.Title style={{color: 'white'}}>Confirmación para Talkback</Dialog.Title>
                <Dialog.Content>
                  <Text style={{ color: colors.text }}>
                    ¿Usted hará uso de Talkback?
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                <Button onPress={confirmTalkBack}>Sí</Button>
                <Button onPress={hideTalkBackConfirmationDialog}>No</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Portal>
               <Dialog visible={showBluetoothDialog} onDismiss={hideBluetoothDialog} style={{backgroundColor: colors.background}}>
                <Dialog.Title>Activación de Bluetooth Necesaria</Dialog.Title>
                <Dialog.Content>
                  <Text style={{ color: colors.text }}>
                    Para continuar, es necesario activar el Bluetooth en su dispositivo.
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                <Button onPress={hideBluetoothDialog}>Entendido</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,

  },
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deviceTitle: {
  color: '#FFFFFF', 
  fontWeight: "bold",
  fontSize: 14,
  },
  scanButton: {
    textAlign: 'center',
    width: 240,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: '#617AFA',
    color: 'white'
  },
  stopScanButton: {
    backgroundColor: colors.background,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  itemContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1c1c1e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  iconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingLeft: 20
  },
  button: {
    alignSelf: 'center',
  },
});

export default ConnectScreen;