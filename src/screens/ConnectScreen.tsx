import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform, Image,
  AccessibilityInfo,
  Linking
} from 'react-native';
import BleManager from '../services/BleManager';
import { Device } from 'react-native-ble-plx';
import { colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Surface, Text, Button, Dialog, Portal } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";
import { ActivityIndicator } from "react-native-paper";
import { 
  checkMultiple, 
  requestMultiple, 
  PERMISSIONS, 
  RESULTS 
} from 'react-native-permissions';

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
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [isTalkBackEnabled, setIsTalkBackEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsTalkBackEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => setIsTalkBackEnabled(enabled));
    return () => {
      if (sub?.remove) sub.remove();
    };
  }, []);

const requestBluetoothPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 31) {
        const statuses = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        ]);
        const scanGranted = statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED;
        const connectGranted = statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED;

        return scanGranted && connectGranted;
      } 
      
        const statuses = await requestMultiple([
           PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
           PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
           PERMISSIONS.ANDROID.BLUETOOTH_SCAN
        ]);
        
        const fineGranted= statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED;
        const scanGranted = statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED;
        const connectGranted = statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED;

        return fineGranted &&scanGranted && connectGranted
        
      
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; 
};


  const showInfoDlg = () => setShowInfoDialog(true);
  const hideInfoDialog = () => setShowInfoDialog(false);

  /* const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      if (Platform.Version >= 31) {
        const perms = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(perms).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación necesario',
            message: 'Se necesita permiso de ubicación para encontrar dispositivos Bluetooth.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
        return fine === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (e) {
      console.warn('Error pidiendo permisos:', e);
      return false;
    }
  };
 */
  const startScan = async () => {
    const hasPermissions=await requestBluetoothPermission()
    if (!hasPermissions) {
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
      if (device) {
        setDevices((prev) => {
          if (!prev.some((d) => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
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
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      await BleManager.connectTo(device);
      if (enabled) {
        navigation.navigate('Talkback', { deviceName: device.name });
      } else {
        navigation.navigate('Control', { deviceName: device.name });
      }
    } catch (e) {
      console.warn('Error al conectar:', e);
    } finally {
      setConnectingId(null);
    }
  };

  const renderDevice = ({ item }: { item: Device }) => {
    if (!item.name) return null;
    return (
      <Surface style={styles.itemContainer}>
        <Icon name='bluetooth' style={{ color: 'white' }} size={20} />
        <View style={styles.iconAndText}>
          <View>
            <Text variant="titleMedium" allowFontScaling maxFontSizeMultiplier={2} style={styles.deviceTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.name && item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
            </Text>
            <Text variant="bodyMedium" allowFontScaling maxFontSizeMultiplier={2} style={{ color: colors.text, fontSize: 13 }}>
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
          <Text allowFontScaling maxFontSizeMultiplier={2} style={{ color: '#FFFFFF', fontSize: 12 }}>
            {connectingId === item.id ? 'Vinculando...' : 'Vincular'}
          </Text>
        </Button>
      </Surface>
    );
  };

  return (
    <>
      <View style={{ backgroundColor: colors.background, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 30 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel='Regresar a la pantalla principal'
        >
          <Icon name="chevron-back" size={24} color="#fafafaff" />
        </TouchableOpacity>
        <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.title}>Selecciona un dispositivo</Text>
        <TouchableOpacity
          onPress={showInfoDlg}
          accessibilityLabel='Información de ayuda'
        >
          <Icon name="information-circle" size={24} color="#fdfdfdff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.searchControls}>
          <View style={styles.buttonsRow}>
            {scanning ? (
              <View style={styles.scanButtonContainer}>
                <TouchableOpacity
                  style={[styles.scanButtonBase, { backgroundColor: '#415ff8ff' }]}
                  disabled={true}
                >
                  <Text allowFontScaling maxFontSizeMultiplier={2} style={{ color: "white", fontSize: 16 }}>
                    Buscando...
                  </Text>
                  <ActivityIndicator animating={true} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scanButtonContainer}>
                <TouchableOpacity
                  style={[styles.scanButtonBase, { backgroundColor: '#1a40fcff' }]}
                  onPress={startScan}
                >
                  <Text
                    allowFontScaling
                    maxFontSizeMultiplier={2}
                    style={{ fontSize: 16, color: "white" }}>
                    Buscar Dispositivos
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[styles.stopScanButtonTouchable, scanning ? { opacity: 1 } : { opacity: 0.5 }]}
              disabled={!scanning}
              onPress={stopScan}
              accessibilityLabel='Detener búsqueda de dispositivos'
            >
              <Image
                source={require('../assets/stop-button.png')}
                style={styles.stopButtonImage}
                resizeMode="center"
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={devices.filter(device => device.name)}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          contentContainerStyle={styles.list}
        />

        <Portal>
          <Dialog visible={showInfoDialog} onDismiss={hideInfoDialog} style={styles.dialogCard}>
            <Dialog.Title style={styles.dialogTitle}>
                <Text allowFontScaling maxFontSizeMultiplier={2} style={{color: 'white', fontWeight: 'bold'}}>Información General</Text>
            </Dialog.Title>
            <Dialog.Content>
              <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.dialogText}>
                • Esta pantalla permite conectarse a dispositivos Bluetooth.
              </Text>
              <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.dialogText}>
                • Asegúrate de que el dispositivo esté cerca y con Bluetooth activo.
              </Text>
              <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.dialogText}>
                • Presiona "Buscar Dispositivos" para iniciar el escaneo.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideInfoDialog} mode='contained' buttonColor='#1a40fcff'><Text style={{color: 'white'}}>Entendido</Text></Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  searchControls: {
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  scanButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonBase: {
    width: 200,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  stopScanButtonTouchable: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stopButtonImage: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  deviceTitle: {
    color: '#FFFFFF',
    fontWeight: "bold",
    fontSize: 14,
  },
  stopScanButton: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    display: 'flex'
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
    gap: 3,
    justifyContent: 'center'
  },
  button: {
    alignSelf: 'center',
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

export default ConnectScreen;