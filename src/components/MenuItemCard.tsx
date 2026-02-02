import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from './Card';
import { theme } from '../constants/theme';
import { MenuItem } from '../data/mockData';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>📷</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
          <Text style={styles.price}>
            {item.price.toLocaleString()} تومان
          </Text>
        </View>
      </View>
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
    width: 80,
    height: 80,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  imageText: {
    fontSize: 32,
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
    marginBottom: theme.spacing.sm,
  },
  price: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
});

