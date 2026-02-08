import React from 'react';
import { TouchableOpacity, Text, StyleSheet, I18nManager } from 'react-native';
import { theme } from '../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  label = 'بازگشت',
}) => {
  const chevron = I18nManager.isRTL ? '›' : '‹';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chevron}>{chevron}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
    marginLeft: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Regular',
  },
});
