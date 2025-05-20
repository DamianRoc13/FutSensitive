import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
    width: 60,
    height: 60,
    borderRadius: 30, 
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 4,
  },
  label: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LedButton;
