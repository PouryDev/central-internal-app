import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  I18nManager,
  View,
  Platform,
} from 'react-native';
import { theme } from '../constants/theme';
import { PlusIcon } from './Icons';
import { useResponsive } from '../utils/responsive';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ onPress, style }) => {
  const isRTL = I18nManager.isRTL;
  const { isTablet } = useResponsive();
  const fabMargin = isTablet ? theme.spacing.xxl : theme.spacing.xl;
  const fabStyle = [
    styles.fab,
    { [isRTL ? 'right' : 'left']: fabMargin },
    style,
  ];

  return (
    <TouchableOpacity
      style={fabStyle}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.fabSurface}>
        <PlusIcon size={28} color={theme.colors.text} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  fabSurface: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
    }),
  },
});
