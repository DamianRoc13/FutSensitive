import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import BleManager from '../services/BleManager';

type Props = {
  label: string;
  pin: number;
};

const LedButtonTalback: React.FC<Props> = ({ pin, label }) => {
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
        style={styles.buttonTalback}
        onPressIn={handlePressIn}
      >
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 50,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  green: {
    position: 'absolute',
    width: 190,
    height: 90,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 0, 0.9)', 
    zIndex: 0,
  },
  buttonTalback: {
    width: 150,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
  },
  label: {
    color: '#000',
    fontSize: 13
  },
});

export default LedButtonTalback;