import React, {useState, useRef} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { colors } from '../styles/theme';
import LedButton from '../components/LedButton';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Card, Button, Portal, Dialog} from 'react-native-paper';
import BleManager from '../services/BleManager';
import { useEffect } from 'react';
import { DeviceEventEmitter} from 'react-native';
import LedButtonTalback from '../components/LedButtonTalback';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Talkback'>;

const TalkBackScreen = () => {
  const route = useRoute();
  const { deviceName } = route.params as { deviceName: string };
  const navigation = useNavigation<NavigationProp>();
  const [visible, setVisible] = useState(false);
  const [ledStates, setLedStates]=useState([false, false, false]);
  const { deviceId  } = route.params as { deviceId: string };
   
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [disconnectDialog, setDisconnectDialog] = useState(false);

  const disconnectHandled = useRef(false);

  useEffect(() => {
    const disconnectListener = DeviceEventEmitter.addListener('DeviceDisconnected', () => {
      if (!disconnectHandled.current) {
        setDisconnectDialog(true);
        disconnectHandled.current = true;
      }
    });
    return () => {
      disconnectListener.remove();
      disconnectHandled.current = false;
    };
  }, []);

  const handleDisconnectDialogClose = () => {
    setDisconnectDialog(false);
    navigation.navigate('Connect');
  };

  const confirmButton = async () => {
    await BleManager.disconnect();
    setShowConfirmation(false);
    navigation.navigate('Connect');
  };

  const showConfirmationDialog = () => setShowConfirmation(true);
  const hideConfirmationDialog = () => setShowConfirmation(false);
  

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false)


 const handleSecuentialButton = async () => {
  for (let i = 0; i < ledStates.length; i++) {
    BleManager.sendCommand(`1${i + 1}`);
    setLedStates((prev) => prev.map((on, idx) => idx === i ? true : false));
    await new Promise((resolve) => setTimeout(resolve, 2000)); 
    BleManager.sendCommand(`0${i + 1}`);
  }
  setLedStates([false, false, false]); 
};

  return (
    <View style={styles.container}>
      <Card style={styles.deviceCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <Text style={styles.title}>Dispositivo Seleccionado</Text>
          <Button onPress={showDialog} style={{paddingBottom: 25}} accessibilityLabel='Botón de Información' >
            <Image 
              source={require('../assets/info.png')} 
              style={{ width: 20, height: 20, margin: 20 }}
            />
          </Button>
        </View>
        <Card.Content style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.deviceName}>{deviceName}</Text>
        </Card.Content>
        </Card>
          <View >
            <LedButtonTalback label="Poste medio" pin={2} />
          </View>
            <View >
            <LedButtonTalback label="Poste derecho" pin={1} />
            <LedButtonTalback label="Poste izquiero" pin={3} />
          </View>
      <View>
      </View>
      <View
      style={{paddingTop: 20}}
      >
        <Button 
        onPress={handleSecuentialButton}
        mode="contained-tonal"
        style={styles.buttonText}
        accessibilityLabel='Botón para activar el modo secuencial' 
        >
          Secuencial
        </Button>
      </View>
      <Portal>
         <Dialog visible={showConfirmation} onDismiss={hideConfirmationDialog} style={{backgroundColor: colors.background}}>
          <Dialog.Title>¿Estás seguro de que quieres desvincular el dispositivo?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.text }}>
              Al desvincular el dispositivo, se perderá la conexión actual y no podrás controlarlo hasta que lo vuelvas a vincular.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
          <Button onPress={confirmButton}>Sí</Button>
          <Button onPress={hideConfirmationDialog}>No</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

        <Portal>
         <Dialog visible={visible} onDismiss={hideDialog} style={{backgroundColor: colors.background}}>
          <Dialog.Title>Información</Dialog.Title>
          <Dialog.Content>
           <Text style={{ color: colors.text }}>
            Este es un dispositivo de control de parlantes. Puedes encender y apagar los parlantes presionando los botones correspondientes según su ubicación. 
            <Text style={{ fontWeight: 'bold' }}> Para desvincular el dispositivo, presiona el botón "Desvincular Dispositivo".</Text>
          </Text>
          </Dialog.Content>
          <Dialog.Actions>
          <Button onPress={hideDialog}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
          <Portal>
      <Dialog visible={disconnectDialog} dismissable={false} style={{backgroundColor: colors.background}}>
        <Dialog.Title>Desconectado</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: colors.text }}>
            El dispositivo se ha desconectado. Por favor, vuelve a conectarlo.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDisconnectDialogClose}>Aceptar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>

      {/* <View style={styles.actions}>
        <Button 
        mode="contained-tonal"
        style={styles.buttonText}
        onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </Button>
      </View> */}
      <View>
         <Button
            mode="contained-tonal"
            style={[styles.buttonText, { marginVertical: 30 }]}
            buttonColor="#D32F2F"
            onPress={showConfirmationDialog}
            >
            <Text style={styles.buttonText}>Desvincular Dispositivo</Text>
          </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  goalBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCard: {
  backgroundColor: 'rgb(24, 24, 24)',
  borderRadius: 12,
  padding: 12,
  width: '100%',
  marginBottom: 40,
  elevation: 4,
},
  deviceName: {
  color: colors.text,
  fontSize: 18,
},
  firstledRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
   secondledRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 100,
    gap: 200,
  },
  lastLedRow:{
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 37,
  },
  actions: {
    marginTop: 40,
  },
 buttonText: {
    alignSelf: 'center',
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
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  iconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default TalkBackScreen;