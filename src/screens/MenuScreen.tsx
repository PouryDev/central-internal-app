import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MenuItemCard } from '../components/MenuItemCard';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import type { MenuItem } from '../types';

const categories = [
  { id: 'hot-drink', label: 'نوشیدنی گرم' },
  { id: 'cold-drink', label: 'نوشیدنی سرد' },
  { id: 'snack', label: 'اسنک' },
];

type MenuCategory = 'hot-drink' | 'cold-drink' | 'snack';

export const MenuScreen: React.FC = () => {
  const { menuItems, addMenuItem } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>();
  const [description, setDescription] = useState('');

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category === categoryId);
  };

  const handleAddItem = () => {
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const priceNum = parseInt(price, 10);
    if (!trimmedName) {
      Alert.alert('خطا', 'نام آیتم را وارد کنید.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('خطا', 'قیمت معتبر وارد کنید.');
      return;
    }
    if (!category) {
      Alert.alert('خطا', 'دسته‌بندی را انتخاب کنید.');
      return;
    }
    const menuItem: MenuItem = {
      id: Date.now().toString(),
      name: trimmedName,
      price: priceNum,
      category: category as MenuCategory,
      description: description.trim() || undefined,
    };
    await addMenuItem(menuItem);
    setName('');
    setPrice('');
    setCategory(undefined);
    setDescription('');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="+ افزودن آیتم"
          onPress={handleAddItem}
          style={styles.addButton}
        />
      </View>

      {categories.map((cat) => {
        const items = getItemsByCategory(cat.id);
        if (items.length === 0) return null;

        return (
          <View key={cat.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{cat.label}</Text>
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </View>
        );
      })}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>افزودن آیتم منو</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="نام آیتم"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="قیمت (تومان)"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
            <View style={styles.dropdownWrapper}>
              <Dropdown
                options={categories.map((c) => ({ id: c.id, label: c.label }))}
                selectedId={category}
                onSelect={(opt) => setCategory(opt.id)}
                placeholder="دسته‌بندی"
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="توضیحات (اختیاری)"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button
                title="لغو"
                onPress={() => {
                  setName('');
                  setPrice('');
                  setCategory(undefined);
                  setDescription('');
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              />
              <Button title="ذخیره" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 60,
  },
  dropdownWrapper: {
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.textSecondary,
  },
});

