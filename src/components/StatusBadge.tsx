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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning + '20',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  paidBadge: {
    backgroundColor: theme.colors.success + '20',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeText: {
    ...theme.typography.caption,
    fontFamily: 'Vazirmatn-Regular',
  },
  pendingText: {
    color: theme.colors.warning,
  },
  paidText: {
    color: theme.colors.success,
  },
});

