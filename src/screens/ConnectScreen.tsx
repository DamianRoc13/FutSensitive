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
import { Surface, Text, Button } from 'react-native-paper';

type RootStackParamList = {
  Home: undefined;
  Connect: undefined;
  Control: { deviceName: string | null };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Connect'>;

const ConnectScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } else {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
    }
    return true;
  };

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Permisos no concedidos');
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

  const connectToDevice = async (device: Device) => {
    setConnectingId(device.id);
    try {
      await BleManager.connectTo(device);
      navigation.navigate('Control', { deviceName: device.name } );
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
              style={{ width: 30, height: 30, alignSelf: 'flex-start'}}
              resizeMode="contain"
            />
      <View style={styles.iconAndText}>
        <View>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodyMedium" style={{ color: colors.text }}>
            Dispositivo Bluetooth
          </Text>
        </View>
      </View>
      <Button
        mode="contained-tonal"
        onPress={() => connectToDevice(item)}
        style={styles.button}
      >
        Vincular
      </Button>
    </Surface>
        
  );
  return (
    <View style={styles.container}>
      <TouchableOpacity
      onPress={() => navigation.navigate('Home')}
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
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={startScan} 
        disabled={scanning}
      >
      <Text style={styles.scanButton}>
          {scanning ? 'Buscando...' : 'Buscar Dispositivos'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
      />
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
  scanButton: {
    backgroundColor: '#617AFA',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
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
    gap: 8,
  },
  button: {
    alignSelf: 'center',
  },
});

export default ConnectScreen;