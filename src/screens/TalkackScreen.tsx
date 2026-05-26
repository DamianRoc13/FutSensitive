import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../styles/theme';
import LedButtonTalback from '../components/LedButtonTalback';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Button, Portal, Dialog, IconButton, Surface } from 'react-native-paper';
import BleManager from '../services/BleManager';
import { DeviceEventEmitter } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Talkback'>;

const TalkBackScreen = () => {
  const route = useRoute();
  const { deviceName } = route.params as { deviceName: string }; // deviceId removido si no se usa explícitamente aquí
  const navigation = useNavigation<NavigationProp>();
  
  const [visible, setVisible] = useState(false);
  const [ledStates, setLedStates] = useState([false, false]);
  const [batteryMaster, setBatteryMaster] = useState(85);
  const [batterySlave1, setBatterySlave1] = useState(0);
  const [batterySlave2, setBatterySlave2] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [disconnectDialog, setDisconnectDialog] = useState(false);
  const [batteryDialog, setBatteryDialog] = useState(false);
  const [isSequenceRunning, setIsSequenceRunning] = useState(false);
  
  const disconnectHandled = useRef(false);
  const sequenceAbortRef = useRef(false);
  const batterySubscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Suscribirse a notificaciones de batería del ESP
    batterySubscriptionRef.current = BleManager.onBatteryNotification((data) => {
      setBatteryMaster(data.master);
      setBatterySlave1(data.slave1);
      setBatterySlave2(data.slave2);
    });

    const disconnectListener = DeviceEventEmitter.addListener('DeviceDisconnected', () => {
      if (!disconnectHandled.current) {
        setDisconnectDialog(true);
        disconnectHandled.current = true;
      }
    });
    return () => {
      if (batterySubscriptionRef.current) {
        batterySubscriptionRef.current.remove();
      }
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
  const showBatteryDialog = () => setBatteryDialog(true);
  const hideBatteryDialog = () => setBatteryDialog(false);

  const handleSecuentialButton = async () => {
    setIsSequenceRunning(true);
    sequenceAbortRef.current = false;
    
    try {
      // Probar solo los pines 1 y 2 (izquierdo y derecho)
      const pins = [1, 2];
      for (let pin of pins) {
        if (sequenceAbortRef.current) break;
        
        BleManager.sendCommand(`${pin}1`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        if (sequenceAbortRef.current) break;
        
        BleManager.sendCommand(`${pin}0`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } finally {
      setLedStates([false, false]);
      setIsSequenceRunning(false);
    }
  };

  const handleStopSequence = () => {
    sequenceAbortRef.current = true;
    setLedStates([false, false]);
    setIsSequenceRunning(false);
    // Apagar todos los LEDs (solo pines 1 y 2)
    BleManager.sendCommand('10');
    BleManager.sendCommand('20');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Surface style={styles.dashboardCard} elevation={5}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel} accessibilityLabel="Encabezado: Panel de Accesibilidad">MODO ACCESIBLE</Text>
                
                {/* CORRECCIÓN 1: IconButton directo con onPress */}
                <IconButton 
                    icon="information-outline" 
                    iconColor="rgba(255,255,255,0.6)" 
                    size={24} 
                    onPress={showDialog}
                    style={{margin: 0}}
                    accessibilityLabel="Información de ayuda"
                />
            </View>
            
            <View style={styles.cardMainRow}>
                <IconButton icon="ear-hearing" iconColor="#00ac9b" size={24} style={{margin:0, marginLeft: -8}} />
                <Text style={styles.deviceName} numberOfLines={1} adjustsFontSizeToFit accessibilityLabel={`Conectado a ${deviceName}`}>
                  {deviceName}
                </Text>
            </View>

            <View style={styles.cardFooterRow}>
                <View style={styles.statusChip} accessibilityLabel="Estado conectado">
                    <View style={styles.activeDot} />
                    <Text style={styles.statusText}>Conectado</Text>
                </View>
                <TouchableOpacity onPress={showBatteryDialog} style={styles.batteryChip}>
                    <Text style={[styles.batteryText, { color: batteryMaster < 20 ? '#FF5252' : '#fff' }]}>
                        {batteryMaster}%
                    </Text>
                    <IconButton 
                        icon={batteryMaster > 20 ? "battery-70" : "battery-alert"} 
                        iconColor={batteryMaster < 20 ? '#FF5252' : '#00E676'} 
                        size={20} 
                        style={{margin:0, marginRight: -5}}
                    />
                </TouchableOpacity>
            </View>
        </Surface>
      </View>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.instructionText} accessibilityLabel="Controles de sonido. Distribución espacial.">
          Controles de Sonido
        </Text>

        <View style={styles.spatialContainer}>
            <View style={styles.bottomRow}>
                 <View style={styles.sideButtonWrapper}>
                    <LedButtonTalback label="Poste Izquierdo" pin={1} />
                 </View>
                 <View style={{width: 20}} />

                 <View style={styles.sideButtonWrapper}>
                    <LedButtonTalback label="Poste Derecho" pin={2} />
                 </View>
            </View>
        </View>
      </ScrollView>
      <View style={styles.bottomPanel}>
        <View style={styles.buttonContainer}>
          {!isSequenceRunning ? (
            <Button
                mode="contained"
                onPress={handleSecuentialButton}
                style={styles.mainActionButton}
                contentStyle={styles.mainActionContent}
                labelStyle={styles.mainActionLabel}
                icon="play-circle"
                buttonColor='rgb(39, 75, 255)' 
                accessibilityLabel='Iniciar Prueba Secuencial'
            >
              <Text style={{color: 'white'}}>
                Iniciar Secuencia
              </Text>
            </Button>
          ) : (
            <Button
                mode="contained"
                onPress={handleStopSequence}
                style={styles.mainActionButton}
                contentStyle={styles.mainActionContent}
                labelStyle={styles.mainActionLabel}
                icon="stop-circle"
                buttonColor='#D32F2F' 
                accessibilityLabel='Detener Prueba Secuencial'
            >
              <Text style={{color: 'white'}}>
                Detener Secuencia
              </Text>
            </Button>
          )}
        </View>
        <TouchableOpacity 
            onPress={showConfirmationDialog} 
            style={styles.disconnectLink}
            accessibilityLabel="Botón Desvincular Dispositivo"
            accessibilityRole="button"
        >
          <Text style={styles.disconnectText}>Desvincular Dispositivo</Text>
        </TouchableOpacity>
      </View>
      <Portal>
         <Dialog visible={showConfirmation} onDismiss={hideConfirmationDialog} style={styles.dialogCard}>
          <Dialog.Title style={styles.dialogTitle}>¿Desvincular?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Se perderá la conexión con el sistema.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideConfirmationDialog} textColor="gray">Cancelar</Button>
            <Button onPress={confirmButton} mode="contained" buttonColor="#D32F2F"><Text style={{color: 'black', fontWeight: 'bold'}}>Desconectar</Text></Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialogCard}>
          <Dialog.Title style={styles.dialogTitle}>Ayuda</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              • El botón izquierdo activa el Poste Izquierdo.
              {"\n"}
              • El botón derecho activa el Poste Derecho.
              {"\n"}
              • Use "Prueba Secuencial" para probar ambos.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} textColor='white' buttonColor='#1a40fcff'>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={disconnectDialog} dismissable={false} style={styles.dialogCard}>
           <Dialog.Title style={styles.dialogTitle}>Desconectado</Dialog.Title>
           <Dialog.Content>
             <Text style={styles.dialogText}>Conexión perdida.</Text>
           </Dialog.Content>
           <Dialog.Actions>
             <Button onPress={handleDisconnectDialogClose} mode="contained" buttonColor='#1a40fcff' >Reconectar</Button>
           </Dialog.Actions>
        </Dialog>

        <Dialog visible={batteryDialog} onDismiss={hideBatteryDialog} style={styles.dialogCard}>
           <Dialog.Title style={styles.dialogTitle}>Estado de Baterías</Dialog.Title>
           <Dialog.Content>
             <View style={styles.batteryGridContainer}>
               {/* Izquierda */}
               <View style={styles.batteryItemCard}>
                 <IconButton 
                   icon="battery-high" 
                   iconColor={batteryMaster > 50 ? '#00E676' : batteryMaster > 20 ? '#FFC107' : '#FF5252'}
                   size={40}
                   style={{margin: 0}}
                 />
                 <Text style={styles.batteryDeviceLabel}>Izquierda</Text>
                 <Text style={[styles.batteryPercentText, { color: batteryMaster > 50 ? '#00E676' : batteryMaster > 20 ? '#FFC107' : '#FF5252' }]}>
                   {batteryMaster}%
                 </Text>
                 <View style={[styles.batteryBar, { width: `${batteryMaster}%`, backgroundColor: batteryMaster > 50 ? '#00E676' : batteryMaster > 20 ? '#FFC107' : '#FF5252' }]} />
               </View>

               {/* Derecha */}
               <View style={styles.batteryItemCard}>
                 <IconButton 
                   icon="battery-high" 
                   iconColor={batterySlave1 > 50 ? '#00E676' : batterySlave1 > 20 ? '#FFC107' : '#FF5252'}
                   size={40}
                   style={{margin: 0}}
                 />
                 <Text style={styles.batteryDeviceLabel}>Derecha</Text>
                 <Text style={[styles.batteryPercentText, { color: batterySlave1 > 50 ? '#00E676' : batterySlave1 > 20 ? '#FFC107' : '#FF5252' }]}>
                   {batterySlave1}%
                 </Text>
                 <View style={[styles.batteryBar, { width: `${batterySlave1}%`, backgroundColor: batterySlave1 > 50 ? '#00E676' : batterySlave1 > 20 ? '#FFC107' : '#FF5252' }]} />
               </View>
             </View>
           </Dialog.Content>
           <Dialog.Actions>
             <Button onPress={hideBatteryDialog} textColor='white' buttonColor='#1a40fcff'>Cerrar</Button>
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
    display: 'flex',
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
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deviceName: {
    color: '#fff',
    fontSize: 24,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
  
  // ESTILOS DE LAYOUT ESPACIAL
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  spatialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Separa izquierda y derecha
    width: '100%',
  },
  sideButtonWrapper: {
    flex: 1, // Para que ocupen espacio equitativo
    alignItems: 'center',
  },

  // FOOTER
  bottomPanel: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    zIndex: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  buttonContainer: {
    minHeight: 56,
    marginBottom: 15,
  },
  mainActionButton: {
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mainActionContent: {
    height: 60,
  },
  mainActionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  disconnectLink: {
    alignItems: 'center',
    padding: 15,
  },
  disconnectText: {
    color: '#D32F2F', 
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },

  // DIALOGS
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  batteryGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: 10,
  },
  batteryItemCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  batteryDeviceLabel: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  batteryPercentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  batteryBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#00E676',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default TalkBackScreen;