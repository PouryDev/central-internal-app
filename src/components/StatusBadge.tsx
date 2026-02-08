import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface StatusBadgeProps {
  status: 'pending' | 'paid';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isPending = status === 'pending';
  return (
    <View
      style={[
        styles.badge,
        isPending ? styles.pendingBadge : styles.paidBadge,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isPending ? styles.pendingText : styles.paidText,
        ]}
      >
        {isPending ? 'ثبت نشده' : 'تسویه شده'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning + '25',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  paidBadge: {
    backgroundColor: theme.colors.success + '25',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeText: {
    ...theme.typography.caption,
    fontFamily: 'Vazirmatn-Regular',
    fontSize: 12,
  },
  pendingText: {
    color: theme.colors.warning,
  },
  paidText: {
    color: theme.colors.success,
  },
});
