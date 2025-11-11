import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import BleManager from '../services/BleManager';

type Props = {
  label: string;
  pin: number;
};

const LedButtonTalback: React.FC<Props> = ({ label, pin }) => {
  const [isPressed, setIsPressed] = React.useState(false);
    const [ledStates, setLedStates]=useState([false, false, false]);

  const handlePressIn = () => {
    BleManager.sendCommand(`1${pin}`); 
    setLedStates((prev) => prev.map((on, idx) => idx === 1 ? true : false));
    setIsPressed(true);
    setTimeout(() => {
    BleManager.sendCommand(`0${pin}`);
    setLedStates((prev) => prev.map((on, idx) => idx === 1 ? false : on));
    setIsPressed(false);
    }, 5000);
  };

/*   const handlePressOut = () => {
    BleManager.sendCommand(`0${pin}`);
    setIsPressed(false);
  }; */

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
    width: 60,
    height: 60,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  green: {
    color: '#00FF00',
    position: 'absolute',
    width: 100,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 255, 0, 0.9)', 
    zIndex: 0,
  },
  buttonTalback: {
    width: 100,
    height: 30,
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