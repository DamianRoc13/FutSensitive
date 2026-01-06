import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform, Image,
  AccessibilityInfo,
} from 'react-native';
import BleManager from '../services/BleManager';
import { Device } from 'react-native-ble-plx';
import { colors } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Surface, Text, Button, Dialog, Portal } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";
import { ActivityIndicator } from "react-native-paper";

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
  const [isTalkBackEnabled, setIsTalkBackEnabled] = useState<boolean | null>(null);

  useEffect(()=>{
    AccessibilityInfo.isScreenReaderEnabled().then(setIsTalkBackEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled)=>setIsTalkBackEnabled(enabled));
    return()=> {
      if(sub?.remove) sub.remove
    }
  }, []);

  
  //const showTalbackConfirmationDialog = () => setShowTalkBack(true);

  const hideBluetoothDialog = () => setShowBluetoothDialog(false);
 // const hideTalkBackConfirmationDialog = () => setShowTalkBack(false);


const requestPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 31) {
      // Android 12+
      const perms = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(perms).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      // Android <= 11
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

/*   const talbackState = async () => {
    try {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      if (!enabled) {
        Alert.alert(
          'TalkBack no activado',
          'La función TalkBack no está activada en su dispositivo.'
        );
        setShowTalkBack(false)
        setTalkbackMode(false)
      }
      else{
        Alert.alert(
          'Talback Activado'
        )
        setTalkbackMode(true)
      };
    } catch (e) {
      console.warn('Error checking screen reader status:', e);
      return false;
    }
  }; */

  const handleNavigate = async()=>{
    navigation.navigate('Talkback', {deviceName: 'JuanitoAlimaña'})
  }

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
      if(enabled){
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
        <Text variant="titleMedium" allowFontScaling maxFontSizeMultiplier={2} style={styles.deviceTitle}>{item.name}</Text>
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
  return (
    <>
      <View style={{backgroundColor: colors.background, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 30}}>
        <TouchableOpacity
        key={'Regresar a la pantalla de inicio'}
        onPress={() => navigation.navigate('Home')}
        accessibilityLabel='Regresar a la pantalla principal' 
        >
          <Icon name="chevron-back" size={24} color="#fafafaff" accessibilityLabel='Información general de GITAF'/>
        </TouchableOpacity>
        <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.title}>Selecciona un dispositivo</Text>
        <TouchableOpacity>
          <Icon name="information-circle" size={24} color="#fdfdfdff" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
      <View style={styles.iconAndText}>
        {scanning ? (
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={{
                width: 200,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                marginBottom: 0,
                backgroundColor: '#415ff8ff',
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
              disabled={true}
            >
              <Text allowFontScaling maxFontSizeMultiplier={2}style={{ color: "white", fontSize: 16 }}>
                Buscando...
              </Text>

              <ActivityIndicator animating={true} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
              style={{
                width: 200,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                marginBottom: 0,
                backgroundColor: '#1a40fcff',
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            onPress={startScan}
          >
            <Text   
              allowFontScaling
              maxFontSizeMultiplier={2}
              style={{ fontSize: 16, color: "white" }}>
              Buscar Dispositivos
            </Text>
          </TouchableOpacity>
        )}
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
                style={{ width: 35, height: 35, alignSelf: 'center' }}
                resizeMode="center"
            />
        </Button>
{/*             <TouchableOpacity
            onPress={handleNavigate}
            >
              <Text>
                hi
              </Text>
            </TouchableOpacity> */}
      </View>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
      />

{/*             <Portal>
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
            </Portal> */}
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
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 ,
    backgroundColor: colors.background,
    padding: 24,

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
  scanButton: {
    textAlign: 'center',
    width: 200,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: '#1a40fcff',
    color: 'white',
    fontFamily: 'serif',
    fontWeight: 'bold'
  },
  stopScanButton: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    display: 'flex'
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
    gap: 3,
    justifyContent: 'center'
  },
  button: {
    alignSelf: 'center',
  },
});

export default ConnectScreen;