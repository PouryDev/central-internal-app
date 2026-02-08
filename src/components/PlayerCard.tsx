import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { ToggleSwitch } from './ToggleSwitch';
import { theme } from '../constants/theme';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onGuestToggle?: (isGuest: boolean) => void;
  showToggle?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onGuestToggle,
  showToggle = true,
}) => {
  const totalPrice = player.orders.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.playerName}>{player.name}</Text>
          {player.isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestText}>مهمان</Text>
            </View>
          )}
        </View>
        {showToggle && onGuestToggle && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>مهمان</Text>
            <ToggleSwitch
              value={player.isGuest}
              onValueChange={onGuestToggle}
            />
          </View>
        )}
      </View>
      <View style={styles.ordersSection}>
        <Text style={styles.ordersTitle}>سفارشات:</Text>
        {player.orders.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderPrice}>
              {order.price.toLocaleString()} تومان
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>جمع کل:</Text>
        <Text style={styles.totalPrice}>
          {totalPrice.toLocaleString()} تومان
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginRight: theme.spacing.sm,
  },
  guestBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  guestText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Regular',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginLeft: theme.spacing.sm,
  },
  ordersSection: {
    marginBottom: theme.spacing.md,
  },
  ordersTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
  },
  orderName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  orderPrice: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  totalPrice: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
});

