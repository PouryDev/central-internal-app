import * as Font from 'expo-font';

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Vazirmatn-Regular': require('../../assets/fonts/Vazirmatn-Regular.ttf'),
      'Vazirmatn-Bold': require('../../assets/fonts/Vazirmatn-Bold.ttf'),
      'Estedad-Regular': require('../../assets/fonts/Estedad-Regular.ttf'),
      'Estedad-Bold': require('../../assets/fonts/Estedad-Bold.ttf'),
    });
  } catch (error) {
    console.warn('Fonts not found, using system fonts:', error);
    // Fonts will fall back to system fonts
  }
};

