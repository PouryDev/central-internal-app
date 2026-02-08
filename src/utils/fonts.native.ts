import * as Font from 'expo-font';

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Vazirmatn-Regular': require('../../assets/fonts/Vazir.ttf'),
      'Vazirmatn-Bold': require('../../assets/fonts/Vazir-Bold.ttf'),
      'Estedad-Regular': require('../../assets/fonts/Vazir.ttf'),
      'Estedad-Bold': require('../../assets/fonts/Vazir-Bold.ttf'),
    });
  } catch (error) {
    console.warn('Fonts not found, using system fonts:', error);
    // Fonts will fall back to system fonts
  }
};

