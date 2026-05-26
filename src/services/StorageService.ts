import AsyncStorage from '@react-native-async-storage/async-storage';

const WALKTHROUGH_COMPLETED_KEY = 'walkthrough_completed';

/**
 * Verifica si el usuario ya ha completado el walkthrough
 */
export const hasCompletedWalkthrough = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(WALKTHROUGH_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error al verificar walkthrough:', error);
    return false;
  }
};

/**
 * Marca el walkthrough como completado
 */
export const markWalkthroughCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WALKTHROUGH_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error al guardar walkthrough completado:', error);
  }
};

/**
 * Reinicia el estado del walkthrough (para testing)
 */
export const resetWalkthrough = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WALKTHROUGH_COMPLETED_KEY);
  } catch (error) {
    console.error('Error al reiniciar walkthrough:', error);
  }
};
