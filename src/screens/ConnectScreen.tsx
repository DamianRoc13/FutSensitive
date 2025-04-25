import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BleManager from '../services/BleManager';
import { Device } from 'react-native-ble-plx';
import { colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const ConnectScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const navigation = useNavigation();

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
    }, 10000);
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
    <TouchableOpacity
      style={styles.device}
      onPress={() => connectToDevice(item)}
      disabled={!!connectingId}
    >
      <Text style={styles.deviceName}>{item.name || 'Dispositivo sin nombre'}</Text>
      {connectingId === item.id && <ActivityIndicator color={colors.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un dispositivo</Text>
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={startScan} 
        disabled={scanning}
      >
        <Text style={styles.scanText}>
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
    fontSize: 22,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
  },
  list: {
    paddingBottom: 100,
  },
  device: {
    backgroundColor: colors.secondary,
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    color: colors.text,
    fontSize: 16,
  },
});

export default ConnectScreen;