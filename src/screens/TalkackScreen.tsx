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
  
  // FUNCIONES DEL DIALOG (Aquí estaba el error antes, ahora las usaremos directo en el icono)
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
                <View style={styles.batteryChip} accessibilityLabel={`Batería ${batteryLevel}%`}>
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

      {/* CONTENIDO PRINCIPAL - CORRECCIÓN 2: Distribución Espacial */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.instructionText} accessibilityLabel="Controles de sonido. Distribución espacial.">
          Controles de Sonido
        </Text>

        <View style={styles.spatialContainer}>
            {/* 1. Poste Medio (Arriba y al centro) */}
            <View style={styles.centerRow}>
                 <LedButtonTalback label="Poste Medio" pin={2} />
            </View>

            {/* 2. Postes Laterales (Abajo, Izquierda y Derecha) */}
            <View style={styles.bottomRow}>
                 <View style={styles.sideButtonWrapper}>
                    <LedButtonTalback label="Poste Izquierdo" pin={1} />
                 </View>
                 
                 {/* Espaciador visual para separarlos */}
                 <View style={{width: 20}} />

                 <View style={styles.sideButtonWrapper}>
                    <LedButtonTalback label="Poste Derecho" pin={3} />
                 </View>
            </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomPanel}>
        <Button
            mode="contained"
            onPress={handleSecuentialButton}
            style={styles.mainActionButton}
            contentStyle={styles.mainActionContent}
            labelStyle={styles.mainActionLabel}
            icon="playlist-play"
            buttonColor="#00ac9b"
            accessibilityLabel="Iniciar prueba secuencial de sonido"
        >
            Prueba Secuencial
        </Button>

        <TouchableOpacity 
            onPress={showConfirmationDialog} 
            style={styles.disconnectLink}
            accessibilityLabel="Botón Desvincular Dispositivo"
            accessibilityRole="button"
        >
          <Text style={styles.disconnectText}>Desvincular Dispositivo</Text>
        </TouchableOpacity>
      </View>

      {/* DIALOGS */}
      <Portal>
         <Dialog visible={showConfirmation} onDismiss={hideConfirmationDialog} style={styles.dialogCard}>
          <Dialog.Title style={styles.dialogTitle}>¿Desvincular?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Se perderá la conexión con el sistema.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideConfirmationDialog} textColor="gray">Cancelar</Button>
            <Button onPress={confirmButton} mode="contained" buttonColor="#D32F2F">Sí</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialogo de Información (Ahora sí debería abrir) */}
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialogCard}>
          <Dialog.Title style={styles.dialogTitle}>Ayuda</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              • El primer botón activa el poste central.
              {"\n"}
              • Debajo están el izquierdo y el derecho.
              {"\n"}
              • Use "Prueba Secuencial" para probar todos.
            </Text>
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
  centerRow: {
    marginBottom: 20, // Espacio entre el poste medio y los de abajo
    alignItems: 'center',
    width: '100%',
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
});

export default TalkBackScreen;