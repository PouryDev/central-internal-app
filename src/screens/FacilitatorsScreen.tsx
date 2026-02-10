import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { toast } from '../utils/toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FAB } from '../components/FAB';
import { UserIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { Facilitator } from '../types';

const MODAL_MAX_WIDTH = 480;

const PAGE_SIZE = 15;

export const FacilitatorsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { isTablet, numColumns } = useResponsive();
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  const { facilitators, sessions, addFacilitator, updateFacilitator, deleteFacilitator } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (f: Facilitator) => {
    setEditingId(f.id);
    setName(f.name);
    setModalVisible(true);
  };

  const isFacilitatorInUse = (facilitatorId: string) => {
    return (sessions ?? []).some((s) => s.facilitator.id === facilitatorId);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('نام گرداننده را وارد کنید.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateFacilitator(editingId, { name: trimmed });
        toast.success('گرداننده با موفقیت ویرایش شد.');
      } else {
        await addFacilitator({
          id: Date.now().toString(),
          name: trimmed,
        });
        toast.success('گرداننده با موفقیت اضافه شد.');
      }
      setName('');
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: Facilitator) => {
    if (isFacilitatorInUse(f.id)) {
      toast.error('این گرداننده در سانس‌ها استفاده شده و قابل حذف نیست.');
      return;
    }
    setDeletingId(f.id);
    try {
      await deleteFacilitator(f.id);
      toast.success('گرداننده حذف شد.');
    } finally {
      setDeletingId(null);
    }
  };

  const displayedFacilitators = facilitators.slice(0, visibleCount);
  const hasMore = visibleCount < facilitators.length;

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, facilitators.length)
      );
    }
  }, [hasMore, facilitators.length]);

  const renderItem: ListRenderItem<Facilitator> = useCallback(
    ({ item: facilitator }) => {
      const inUse = isFacilitatorInUse(facilitator.id);
      return (
        <View style={numColumns > 1 ? styles.gridItem : undefined}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openEditModal(facilitator)}
        >
          <Card style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {facilitator.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemTitle}>{facilitator.name}</Text>
                {inUse && <Text style={styles.listItemBadge}></Text>}
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    openEditModal(facilitator);
                  }}
                >
                  <Text style={styles.actionBtnText}>ویرایش</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(facilitator);
                  }}
                  disabled={deletingId === facilitator.id || inUse}
                >
                  {deletingId === facilitator.id ? (
                    <ActivityIndicator size="small" color={theme.colors.error} />
                  ) : (
                    <Text
                      style={[
                        styles.actionBtnText,
                        styles.actionBtnDangerText,
                        inUse && styles.actionBtnDisabled,
                      ]}
                    >
                      حذف
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
        </View>
      );
    },
    [deletingId, numColumns],
  );

  const renderListEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <UserIcon size={64} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>گرداننده‌ای ثبت نشده</Text>
        <Text style={styles.emptySubtitle}>
          با زدن دکمه + اولین گرداننده را اضافه کنید
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
          facilitators.length === 0 && styles.contentEmpty,
        ]}
        data={displayedFacilitators}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={facilitators.length > 0 ? renderListFooter : null}
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
              {editingId ? 'ویرایش گرداننده' : 'افزودن گرداننده'}
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="نام گرداننده"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="لغو"
                onPress={() => {
                  setName('');
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
  listItem: {
    padding: theme.spacing.md,
    minHeight: 56,
    marginBottom: theme.spacing.sm,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  listItemBadge: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginTop: 2,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnDanger: {
    borderColor: theme.colors.error,
  },
  actionBtnText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  actionBtnDangerText: {
    color: theme.colors.error,
  },
  actionBtnDisabled: {
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
    marginBottom: theme.spacing.lg,
    ...theme.inputOutline,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
  },
});
