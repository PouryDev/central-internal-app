import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { CoffeeIcon, DrinkIcon, SnackIcon } from './Icons';
import { theme } from '../constants/theme';
import { toPersianWithSeparator } from '../utils/toPersian';
import type { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  actions?: React.ReactNode;
}

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'hot-drink': CoffeeIcon,
  'cold-drink': DrinkIcon,
  snack: SnackIcon,
};

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ item, actions }) => {
  const IconComponent = CATEGORY_ICONS[item.category] ?? SnackIcon;

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <IconComponent size={28} color={theme.colors.textSecondary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? (
            <Text
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.price}>
            {toPersianWithSeparator(item.price)} تومان
          </Text>
        </View>
      </View>
      {actions ? (
        <View style={styles.actionsWrap}>
          {actions}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  price: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  actionsWrap: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export const MenuItemCard = React.memo(MenuItemCardComponent);
