import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/theme';
import LedButton from '../components/LedButton';
import { useRoute } from '@react-navigation/native';

const ControlScreen = () => {
  const route = useRoute();
  const { deviceName } = route.params as { deviceName: string };

  return (
    <View style={styles.container}>
      <Text style={styles.deviceName}>Conectado a: {deviceName}</Text>

      <View style={styles.ledRow}>
        <LedButton label="L1" pin={1} />
        <View style={{ width: 60 }} />
        <LedButton label="L2" pin={2} />
      </View>
      <View style={styles.ledRow}>
        <LedButton label="L3" pin={3} />
      </View>
      <View style={styles.ledRow}>
        <LedButton label="L4" pin={4} />
        <View style={{ width: 60 }} />
        <LedButton label="L5" pin={5} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Desvincular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
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
  deviceName: {
    color: colors.primary,
    fontSize: 18,
    marginBottom: 30,
  },
  ledRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  actions: {
    marginTop: 40,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ControlScreen;