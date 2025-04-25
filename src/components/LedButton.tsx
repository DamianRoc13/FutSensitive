import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';
import BleManager from '../services/BleManager';

type Props = {
  label: string;
  pin: number;
};

const LedButton: React.FC<Props> = ({ label, pin }) => {
  const handlePressIn = () => {
    BleManager.sendCommand(`1${pin}`);
  };

  const handlePressOut = () => {
    BleManager.sendCommand(`0${pin}`);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.6}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 30,
    minWidth: 70,
    alignItems: 'center',
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});

export default LedButton;
