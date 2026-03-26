import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import BleManager from '../services/BleManager';

type Props = {
  label: string;
  pin: number;
};

const LedButton: React.FC<Props> = ({ pin, label }) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    BleManager.sendCommand(`${pin}1`); 
    setIsPressed(true);
    setTimeout(() => {
      BleManager.sendCommand(`${pin}0`);
      setIsPressed(false);
    }, 5000);
  };
  
  return (
    <View style={styles.container}>
      {isPressed && <View style={styles.green} />}
      <TouchableOpacity
        style={styles.button}
        onPressIn={handlePressIn}
        accessibilityLabel={`Botón de poste ${label}`}
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
  green: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(0, 255, 0, 0.9)', 
    zIndex: 0,
  },
  button: {
    color: 'rgba(0, 255, 0, 0.9)',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 1,
  },
  buttonTalback: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
  },
  label: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LedButton;
