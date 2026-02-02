import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MenuItemCard } from '../components/MenuItemCard';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { menuItems } from '../data/mockData';

export const MenuScreen: React.FC = () => {
  const categories = [
    { id: 'hot-drink', label: 'نوشیدنی گرم' },
    { id: 'cold-drink', label: 'نوشیدنی سرد' },
    { id: 'snack', label: 'اسنک' },
  ];

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category === categoryId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="+ افزودن آیتم"
          onPress={() => {}}
          style={styles.addButton}
        />
      </View>

      {categories.map((category) => {
        const items = getItemsByCategory(category.id);
        if (items.length === 0) return null;

        return (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
});

