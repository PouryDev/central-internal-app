import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { toast } from '../utils/toast';
import { toEnglishNumber, toPersianNumber } from '../utils/toPersian';
import { MenuItemCard } from '../components/MenuItemCard';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { FAB } from '../components/FAB';
import { MenuIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { MenuItem } from '../types';

const MODAL_MAX_WIDTH = 480;
const MENU_PAGE_SIZE = 15;

export const MenuScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { isTablet, numColumns } = useResponsive();
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  const { menuItems, categories, sessions, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>();
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const getItemsByCategory = useCallback(
    (categoryId: string) => menuItems.filter((item) => item.category === categoryId),
    [menuItems]
  );

  const allEntries = useMemo(() => {
    const entries: { category: (typeof categories)[0]; item: MenuItem }[] = [];
    for (const cat of categories) {
      const items = menuItems.filter((item) => item.category === cat.id);
      for (const item of items) entries.push({ category: cat, item });
    }
    return entries;
  }, [categories, menuItems]);

  const totalItems = allEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / MENU_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * MENU_PAGE_SIZE;
  const pageEntries = allEntries.slice(start, start + MENU_PAGE_SIZE);

  const pageEntriesByCategory = useMemo(() => {
    const map = new Map<string, { category: (typeof categories)[0]; items: MenuItem[] }>();
    for (const { category: cat, item } of pageEntries) {
      const existing = map.get(cat.id);
      if (existing) existing.items.push(item);
      else map.set(cat.id, { category: cat, items: [item] });
    }
    return Array.from(map.values());
  }, [pageEntries, categories]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);
  const goNext = useCallback(() => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const handleAddItem = () => {
    if (categories.length === 0) {
      toast.error('ابتدا از تب «دسته» یک دسته‌بندی اضافه کنید.');
      return;
    }
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory(undefined);
    setDescription('');
    setModalVisible(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setDescription(item.description ?? '');
    setModalVisible(true);
  };

  const isMenuItemInUse = (itemId: string) => {
    return (sessions ?? []).some((s) =>
      s.players.some((p) => p.orders.some((o) => o.id === itemId))
    );
  };

  const handleDeleteItem = async (item: MenuItem) => {
    const inUse = (sessions ?? []).some((s) =>
      s.players.some((p) => p.orders.some((o) => o.id === item.id))
    );
    if (inUse) {
      toast.error('این آیتم در سفارش‌ها استفاده شده و قابل حذف نیست.');
      return;
    }
    setDeletingItemId(item.id);
    try {
      await deleteMenuItem(item.id);
      toast.success('آیتم منو حذف شد.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const priceNum = parseInt(toEnglishNumber(price), 10);
    if (!trimmedName) {
      toast.error('نام آیتم را وارد کنید.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('قیمت معتبر وارد کنید.');
      return;
    }
    if (!category) {
      toast.error('دسته‌بندی را انتخاب کنید.');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: trimmedName,
          price: priceNum,
          category,
          description: description.trim() || undefined,
        });
        toast.success('آیتم منو با موفقیت ویرایش شد.');
      } else {
        const menuItem: MenuItem = {
          id: Date.now().toString(),
          name: trimmedName,
          price: priceNum,
          category,
          description: description.trim() || undefined,
        };
        await addMenuItem(menuItem);
        toast.success('آیتم منو با موفقیت اضافه شد.');
      }
      setEditingItem(null);
      setName('');
      setPrice('');
      setCategory(undefined);
      setDescription('');
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {menuItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <MenuIcon size={64} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>
            {categories.length === 0
              ? 'ابتدا دسته‌بندی اضافه کنید'
              : 'آیتمی در منو وجود ندارد'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {categories.length === 0
              ? 'برای افزودن آیتم منو، ابتدا از تب «دسته» یک دسته‌بندی اضافه کنید.'
              : 'با زدن دکمه + اولین آیتم را اضافه کنید.'}
          </Text>
        </View>
      ) : (
        <>
          {pageEntriesByCategory.map(({ category: cat, items }) => (
            <View key={cat.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{cat.name}</Text>
              <View style={[styles.itemsContainer, numColumns > 1 && styles.itemsContainerGrid]}>
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={numColumns > 1 ? [styles.menuGridItem, { width: `${100 / numColumns}%` }] : undefined}
                  >
                    <MenuItemCard
                      item={item}
                      actions={
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.itemActionBtn}
                            onPress={() => handleEditItem(item)}
                          >
                            <Text style={styles.itemActionText}>ویرایش</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.itemActionBtn, styles.itemDeleteBtn]}
                            onPress={() => handleDeleteItem(item)}
                            disabled={deletingItemId === item.id || isMenuItemInUse(item.id)}
                          >
                            {deletingItemId === item.id ? (
                              <ActivityIndicator size="small" color={theme.colors.error} />
                            ) : (
                              <Text
                                style={[
                                  styles.itemActionText,
                                  styles.itemDeleteText,
                                  isMenuItemInUse(item.id) && styles.disabledText,
                                ]}
                              >
                                حذف
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationLabel}>
                صفحه {toPersianNumber(currentPage + 1)} از {toPersianNumber(totalPages)}
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[styles.paginationBtn, currentPage === 0 && styles.paginationBtnDisabled]}
                  onPress={goPrev}
                  disabled={currentPage === 0}
                >
                  <Text style={[styles.paginationBtnText, currentPage === 0 && styles.paginationBtnTextDisabled]}>
                    قبلی
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paginationBtn,
                    currentPage >= totalPages - 1 && styles.paginationBtnDisabled,
                  ]}
                  onPress={goNext}
                  disabled={currentPage >= totalPages - 1}
                >
                  <Text
                    style={[
                      styles.paginationBtnText,
                      currentPage >= totalPages - 1 && styles.paginationBtnTextDisabled,
                    ]}
                  >
                    بعدی
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
      </ScrollView>

      <FAB onPress={handleAddItem} />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, isTablet && styles.modalOverlayTablet]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              { width: sheetWidth },
              isTablet && styles.modalSheetTablet,
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingItem ? 'ویرایش آیتم منو' : 'افزودن آیتم منو'}
            </Text>
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
                options={categories.map((c) => ({ id: c.id, label: c.name }))}
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
                variant="secondary"
              />
              <Button title="ذخیره" onPress={handleSave} loading={saving} style={styles.saveButton} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIconWrap: {
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  itemsContainer: {},
  itemsContainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  menuGridItem: {
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  categoryTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  itemActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  itemActionBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemDeleteBtn: {
    borderColor: theme.colors.error,
  },
  itemActionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  itemDeleteText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  paginationLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paginationBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paginationBtnDisabled: {
    opacity: 0.5,
  },
  paginationBtnText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  paginationBtnTextDisabled: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 24,
  },
  modalSheetTablet: {
    borderRadius: theme.borderRadius.xl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
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
    ...theme.inputOutline,
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
  saveButton: {
    flex: 1,
  },
});

