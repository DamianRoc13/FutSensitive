import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import BleManager from '../services/BleManager';

type Props = {
  label: string;
  pin: number;
};

const LedButton: React.FC<Props> = ({ label, pin }) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    BleManager.sendCommand(`0${pin}`);
    BleManager.sendCommand(`1${pin}`);
    setIsPressed(true);
  };

  const handlePressOut = () => {
    BleManager.sendCommand(`0${pin}`);
    setIsPressed(false);
  };

  return (
    <View style={styles.container}>
      {isPressed && <View style={styles.greenShadow} />}
      <TouchableOpacity
        style={styles.button}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenShadow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 255, 0, 0.9)', 
    zIndex: 0,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
  },
  label: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LedButton;
