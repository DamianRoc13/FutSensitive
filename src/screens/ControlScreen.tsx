import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { colors } from '../styles/theme';
import LedButton from '../components/LedButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Button, Portal, Dialog, IconButton, Surface } from 'react-native-paper';
import BleManager from '../services/BleManager';
import { DeviceEventEmitter } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Control'>;
const { width, height } = Dimensions.get('window');

const ControlScreen = () => {
  const route = useRoute();
  const { deviceName } = route.params as { deviceName: string };
  const navigation = useNavigation<NavigationProp>();
  const [visible, setVisible] = useState(false);
  const [ledStates, setLedStates] = useState([false, false, false]);
  
  const [batteryLevel, setBatteryLevel] = useState(85); 

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
  const hideDialog = () => setVisible(false);

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.headerContainer}>
        <Surface style={styles.dashboardCard} elevation={5}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>PANEL DE CONTROL</Text>
                <TouchableOpacity onPress={showDialog} style={styles.infoIconTouch}>
                    <IconButton icon="dots-horizontal" iconColor="rgba(255,255,255,0.6)" size={20} style={{margin:0}}/>
                </TouchableOpacity>
            </View>
            <View style={styles.cardMainRow}>
                <IconButton icon="bluetooth" iconColor="#00ac9b" size={24} style={{margin:0, marginLeft: -8}} />
                <Text style={styles.deviceName} numberOfLines={1} adjustsFontSizeToFit>{deviceName}</Text>
            </View>
            <View style={styles.cardFooterRow}>
                {/* Estado Conexión */}
                <View style={styles.statusChip}>
                    <View style={styles.activeDot} />
                    <Text style={styles.statusText}>Conectado</Text>
                </View>
                <View style={styles.batteryChip}>
                    <Text style={[styles.batteryText, { color: batteryLevel < 20 ? '#FF5252' : '#fff' }]}>
                        {batteryLevel}%
                    </Text>
                    <IconButton 
                        icon={batteryLevel > 20 ? "battery-70" : "battery-alert"} 
                        iconColor={batteryLevel < 20 ? '#FF5252' : '#00E676'} 
                        size={20} 
                        style={{margin:0, marginRight: -5}}
                    />
                </View>
            </View>
        </Surface>
      </View>
      <View style={styles.mainContent}>
          <ImageBackground
            source={require('../assets/arco.png')}
            style={styles.goalImage}
            resizeMode="contain"
          >
            <View style={styles.ledOverlay}>
               <View style={styles.ledTopWrapper}>
                  <LedButton label="Centro" pin={2} />
               </View>
               <View style={styles.ledBottomWrapper}>
                  <LedButton label="Izq" pin={1} />
                  <LedButton label="Der" pin={3} />
               </View>
            </View>
          </ImageBackground>
      </View>
      <View style={styles.bottomPanel}>
        <Button
            mode="contained"
            onPress={handleSecuentialButton}
            style={styles.mainActionButton}
            contentStyle={styles.mainActionContent}
            labelStyle={styles.mainActionLabel}
            icon="play-circle"
            buttonColor="#00ac9b"
        >
            Iniciar Secuencia
        </Button>
        <TouchableOpacity onPress={showConfirmationDialog} style={styles.disconnectLink}>
          <Text style={styles.disconnectText}>Desvincular Dispositivo</Text>
        </TouchableOpacity>
      </View>

      <Portal>
         <Dialog visible={showConfirmation} onDismiss={hideConfirmationDialog} style={styles.dialogCard}>
            <Dialog.Title style={styles.dialogTitle}>¿Desconectar?</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>Se perderá la conexión con el módulo ESP32.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideConfirmationDialog} textColor="gray">Cancelar</Button>
              <Button onPress={confirmButton} mode="contained" buttonColor="#D32F2F" style={{borderRadius: 8}}>Desconectar</Button>
            </Dialog.Actions>
         </Dialog>

         <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialogCard}>
            <Dialog.Title style={styles.dialogTitle}>Información</Dialog.Title>
            <Dialog.Content>
                <Text style={styles.dialogText}>• Panel de control para el sistema de orientación auditiva.</Text>
                <Text style={styles.dialogText}>• Batería: Muestra el nivel de carga del dispositivo.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog} textColor="#00ac9b">Cerrar</Button>
            </Dialog.Actions>
         </Dialog>
         
         <Dialog visible={disconnectDialog} dismissable={false} style={styles.dialogCard}>
            <Dialog.Title style={styles.dialogTitle}>Desconectado</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>Conexión perdida.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleDisconnectDialogClose} mode="contained" buttonColor="#00ac9b">Reconectar</Button>
            </Dialog.Actions>
         </Dialog>
      </Portal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  dashboardCard: {
    backgroundColor: '#1E1E1E', 
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoIconTouch: {
    padding: 4,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deviceName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 5,
    flex: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 172, 155, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ac9b',
    marginRight: 8,
  },
  statusText: {
    color: '#00ac9b',
    fontSize: 12,
    fontWeight: '700',
  },
  batteryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalImage: {
    width: width * 0.9,
    height: 250,
    justifyContent: 'center',
  },
  ledOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ledTopWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20, 
  },
  ledBottomWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30, 
    paddingBottom: 20, 
  },
  bottomPanel: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  mainActionButton: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  mainActionContent: {
    height: 56,
  },
  mainActionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  disconnectLink: {
    alignItems: 'center',
    padding: 10,
  },
  disconnectText: {
    color: '#D32F2F', 
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
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

export default ControlScreen;