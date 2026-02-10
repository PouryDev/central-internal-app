import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FAB } from '../components/FAB';
import { FolderIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import { toast } from '../utils/toast';
import { useResponsive } from '../utils/responsive';
import type { Category } from '../types';

const MODAL_MAX_WIDTH = 480;

const PAGE_SIZE = 15;

export const CategoriesScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { isTablet, numColumns } = useResponsive();
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  const { categories, menuItems, addCategory, updateCategory, deleteCategory } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setIcon('');
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon ?? '');
    setModalVisible(true);
  };

  const isCategoryInUse = (categoryId: string) => {
    return menuItems.some((item) => item.category === categoryId);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('نام دسته‌بندی را وارد کنید.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { name: trimmed, icon: icon.trim() || undefined });
        toast.success('دسته‌بندی با موفقیت ویرایش شد.');
      } else {
        const id = `cat-${Date.now()}`;
        await addCategory({ id, name: trimmed, icon: icon.trim() || undefined });
        toast.success('دسته‌بندی با موفقیت اضافه شد.');
      }
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (isCategoryInUse(cat.id)) {
      toast.error('این دسته‌بندی در آیتم‌های منو استفاده شده و قابل حذف نیست.');
      return;
    }
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id);
      toast.success('دسته‌بندی حذف شد.');
    } finally {
      setDeletingId(null);
    }
  };

  const displayedCategories = categories.slice(0, visibleCount);
  const hasMore = visibleCount < categories.length;

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, categories.length)
      );
    }
  }, [hasMore, categories.length]);

  const renderItem: ListRenderItem<Category> = useCallback(
    ({ item: cat }) => {
      const inUse = isCategoryInUse(cat.id);
      return (
        <View style={numColumns > 1 ? styles.gridItem : undefined}>
        <Card style={styles.categoryCard} elevated>
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={styles.categoryIcon}>{cat.icon || '📁'}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(cat)}
              >
                <Text style={styles.actionText}>ویرایش</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(cat)}
                disabled={deletingId === cat.id || inUse}
              >
                {deletingId === cat.id ? (
                  <ActivityIndicator size="small" color={theme.colors.error} />
                ) : (
                  <Text
                    style={[
                      styles.actionText,
                      styles.deleteText,
                      inUse && styles.disabledText,
                    ]}
                  >
                    حذف
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Card>
        </View>
      );
    },
    [deletingId, numColumns],
  );

  const renderListEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <FolderIcon size={64} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>دسته‌بندی وجود ندارد</Text>
        <Text style={styles.emptySubtitle}>
          با زدن دکمه + اولین دسته را اضافه کنید
        </Text>
      </View>
    ),
    []
  );

  const renderListFooter = useCallback(
    () =>
      hasMore ? (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : null,
    [hasMore]
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          categories.length === 0 && styles.contentEmpty,
        ]}
        data={displayedCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={categories.length > 0 ? renderListFooter : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      />

      <FAB onPress={openAddModal} />

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
              {editingId ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="نام دسته‌بندی"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={icon}
              onChangeText={setIcon}
              placeholder="آیکون (اختیاری، مثلاً ☕)"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <Button
                title="لغو"
                onPress={() => setModalVisible(false)}
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
  contentEmpty: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  loadMoreFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyIconWrap: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
  },
  list: {
    gap: theme.spacing.sm,
  },
  categoryCard: {
    padding: theme.spacing.md,
    minHeight: 56,
    marginBottom: theme.spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginLeft: theme.spacing.md,
  },
  categoryName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  deleteText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
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
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
  },
});
