import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../styles/theme';
import LedButton from '../components/LedButton';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Card, Button, Portal, Dialog} from 'react-native-paper';
import BleManager from '../services/BleManager';
import { DeviceId } from 'react-native-ble-plx';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Control'>;

const ControlScreen = () => {
  const route = useRoute();
  const { deviceName } = route.params as { deviceName: string };
   const navigation = useNavigation<NavigationProp>();
  const [visible, setVisible] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  return (
    <View style={styles.container}>
      <Card style={styles.deviceCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <Text style={styles.title}>Dispositivo Seleccionado</Text>
          <TouchableOpacity onPress={showDialog}>
          <Image source={require('../assets/info.png')} style={{ width: 15, height: 15, margin: 20 }} />
          </TouchableOpacity>
        </View>
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.deviceName}>{deviceName}</Text>
            <Button
            mode="contained-tonal"
            style={[styles.buttonText, { marginVertical: 0 }]}
            onPress={() => navigation.navigate('Connect')}
            >
            <Text style={styles.buttonText}>Desvincular</Text>
          </Button>
        </Card.Content>
        </Card>
      <View style={styles.firstledRow}>
        <LedButton label="TR" pin={1} />
        <LedButton label="TM" pin={2} />
        <LedButton label="TD" pin={3} />
      </View>
        <View style={styles.secondledRow}>
          <LedButton label="R1" pin={4} />
          <Image source={require('../assets/logo.png')} style={styles.logo}/>
          <LedButton label="L1" pin={5} />
        </View>
      <View style={styles.lastLedRow}>
          <LedButton label="R2" pin={6} />
        <View style={{ width: 60 }} /> 
          <LedButton label="L2" pin={7} />
        </View>

      <Portal>
         <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Información</Dialog.Title>
          <Dialog.Content>
           <Text style={{ color: colors.text }}>
            Este es un dispositivo de control de luces LED. Puedes encender y apagar los LEDs presionando los botones correspondientes. 
            <Text style={{ fontWeight: 'bold' }}> Para desvincular el dispositivo, presiona el botón "Desvincular".</Text>
          </Text>
          </Dialog.Content>
          <Dialog.Actions>
          <Button onPress={hideDialog}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.actions}>
        <Button 
        mode="contained-tonal"
        style={styles.buttonText}
        onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
  width: 70,
  height: 70,
  resizeMode: 'contain'
},
  deviceCard: {
  backgroundColor: '#1c1c1e',
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
    marginVertical: 10,
    gap: 25,
  },
  secondledRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 31,
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

export default ControlScreen;