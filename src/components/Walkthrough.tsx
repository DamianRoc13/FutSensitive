import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Button, Text, Portal } from 'react-native-paper';
import { colors } from '../styles/theme';

interface WalkthroughProps {
  visible: boolean;
  onDismiss: () => void;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ visible, onDismiss }) => {
  const [stepIndex, setStepIndex] = React.useState(0);

  const steps = [
    {
      title: '¡Bienvenido a GITAF!',
      description: 'Esta aplicación te permite conectar y controlar dispositivos Bluetooth de forma accesible. Presiona siguiente para aprender cómo usarla.',
    },
    {
      title: 'Conectar un dispositivo',
      description: 'Para comenzar, debes conectar un dispositivo Bluetooth desde la pantalla de conexión. Presiona el botón "Conectar a un dispositivo" en la pantalla principal.',
    },
    {
      title: 'Controlar tu dispositivo',
      description: 'Una vez conectado, podrás controlar tu dispositivo desde la pantalla de control. Usa los controles accesibles para interactuar con tu dispositivo.',
    },
    {
      title: '¡Listo para empezar!',
      description: 'Ya sabes todo lo que necesitas. Presiona "Cerrar" para comenzar a usar la aplicación.',
    },
  ];

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleClose = () => {
    setStepIndex(0);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {}}
        style={styles.dialog}
        dismissable={false}
      >
        <Dialog.Title style={styles.dialogTitle}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={2}
            style={styles.titleText}
          >
            {currentStep.title}
          </Text>
        </Dialog.Title>

        <Dialog.Content>
          <ScrollView style={styles.contentScrollView}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={2}
              style={styles.descriptionText}
            >
              {currentStep.description}
            </Text>
          </ScrollView>

          {/* Indicador de progreso */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= stepIndex && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <Button onPress={handleClose} mode="contained" buttonColor="#ff4444">
            <Text style={styles.buttonText}>Cancelar</Text>
          </Button>
          {!isLastStep && (
            <Button
              onPress={handleNext}
              mode="contained"
              buttonColor="#1a40fcff"
              style={styles.nextButton}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </Button>
          )}
          {isLastStep && (
            <Button
              onPress={handleClose}
              mode="contained"
              buttonColor="#1a40fcff"
              style={styles.nextButton}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#252525',
    borderRadius: 20,
    maxHeight: '85%',
  },
  dialogTitle: {
    backgroundColor: '#252525',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  contentScrollView: {
    maxHeight: 300,
  },
  descriptionText: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  progressDotActive: {
    backgroundColor: '#1a40fcff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  nextButton: {
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Walkthrough;
