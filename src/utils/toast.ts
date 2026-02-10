import { toast as rnToast } from '@backpackapp-io/react-native-toast';
import { theme } from '../constants/theme';

const DEFAULT_SUCCESS_DURATION = 3500;
const DEFAULT_ERROR_DURATION = 4000;

export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    rnToast.success(message, {
      duration: options?.duration ?? DEFAULT_SUCCESS_DURATION,
      styles: {
        view: {
          borderRightWidth: 4,
          borderRightColor: theme.colors.success,
        },
        text: {
          fontFamily: 'Vazirmatn-Regular',
          color: theme.colors.text,
          ...theme.typography.body,
        },
        indicator: {
          backgroundColor: theme.colors.success,
        },
      },
    });
  },
  error: (message: string, options?: { duration?: number }) => {
    rnToast.error(message, {
      duration: options?.duration ?? DEFAULT_ERROR_DURATION,
      styles: {
        view: {
          borderRightWidth: 4,
          borderRightColor: theme.colors.error,
        },
        text: {
          fontFamily: 'Vazirmatn-Regular',
          color: theme.colors.text,
          ...theme.typography.body,
        },
        indicator: {
          backgroundColor: theme.colors.error,
        },
      },
    });
  },
};
