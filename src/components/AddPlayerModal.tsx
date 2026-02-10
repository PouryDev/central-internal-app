import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from '../utils/toast';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  FlatList,
  ListRenderItem,
  InteractionManager,
  useWindowDimensions,
} from 'react-native';
import { Button } from './Button';
import { ToggleSwitch } from './ToggleSwitch';
import { FilterChips } from './FilterChips';
import { theme } from '../constants/theme';
import { toPersianWithSeparator } from '../utils/toPersian';
import { useResponsive } from '../utils/responsive';
import type { Player, MenuItem } from '../types';

const MODAL_MAX_WIDTH = 480;
const SEARCH_DEBOUNCE_MS = 180;
const MENU_ITEM_HEIGHT = 48;

interface AddPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (player: Player) => void;
  editingPlayer?: Player | null;
  menuItems: MenuItem[];
  categories: { id: string; name: string }[];
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  visible,
  onClose,
  onSave,
  editingPlayer,
  menuItems,
  categories,
}) => {
  const { width, height } = useWindowDimensions();
  const { isTablet } = useResponsive();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const baseSheetHeight = Math.min(height * 0.85, 600);
  const sheetHeight =
    keyboardHeight > 0
      ? Math.min(baseSheetHeight, height - keyboardHeight - 48)
      : baseSheetHeight;
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [name, setName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [orders, setOrders] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [contentReady, setContentReady] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      const task = InteractionManager.runAfterInteractions(() => {
        setContentReady(true);
      });
      return () => {
        task.cancel();
        setContentReady(false);
      };
    }
    setContentReady(false);
  }, [visible]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      searchTimeoutRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  React.useEffect(() => {
    if (visible) {
      if (editingPlayer) {
        setName(editingPlayer.name);
        setIsGuest(editingPlayer.isGuest);
        setOrders([...editingPlayer.orders]);
      } else {
        setName('');
        setIsGuest(false);
        setOrders([]);
      }
      setSearchQuery('');
      setSelectedCategoryId('all');
    }
  }, [visible, editingPlayer]);

  const filteredBySearch = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return menuItems;
    const q = debouncedSearchQuery.trim().toLowerCase();
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [menuItems, debouncedSearchQuery]);

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all') return filteredBySearch;
    return filteredBySearch.filter((item) => item.category === selectedCategoryId);
  }, [filteredBySearch, selectedCategoryId]);

  const categoryChips = useMemo(
    () => [
      { id: 'all', label: 'همه' },
      ...categories.map((c) => ({ id: c.id, label: c.name })),
    ],
    [categories]
  );

  const handleToggleItem = useCallback((item: MenuItem) => {
    setOrders((prev) => {
      const hasItem = prev.some((o) => o.id === item.id);
      return hasItem ? prev.filter((o) => o.id !== item.id) : [...prev, item];
    });
  }, []);

  const renderMenuItem: ListRenderItem<MenuItem> = useCallback(
    ({ item }) => {
      const isSelected = orders.some((o) => o.id === item.id);
      return (
        <TouchableOpacity
          onPress={() => handleToggleItem(item)}
          activeOpacity={0.7}
          style={[
            styles.menuRow,
            isSelected && styles.menuRowSelected,
          ]}
        >
          <Text
            style={[
              styles.menuRowName,
              isSelected && styles.menuRowNameSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.menuRowPrice}>
            {toPersianWithSeparator(item.price)} تومان
          </Text>
          {isSelected && (
            <View style={styles.checkDot} />
          )}
        </TouchableOpacity>
      );
    },
    [orders, handleToggleItem]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: MENU_ITEM_HEIGHT + theme.spacing.xs,
      offset: (MENU_ITEM_HEIGHT + theme.spacing.xs) * index,
      index,
    }),
    []
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyMenu}>
        <Text style={styles.emptyMenuText}>آیتمی یافت نشد</Text>
      </View>
    ),
    []
  );

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('لطفاً نام بازیکن را وارد کنید.');
      return;
    }
    const player: Player = {
      id: editingPlayer?.id ?? Date.now().toString(),
      name: trimmedName,
      isGuest,
      orders,
    };
    onSave(player);
    toast.success(editingPlayer ? 'بازیکن ویرایش شد.' : 'بازیکن اضافه شد.');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={[
          styles.overlay,
          isTablet && styles.overlayTablet,
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              width: sheetWidth,
              height: isTablet ? Math.min(height * 0.9, 600) : sheetHeight,
            },
            isTablet && styles.sheetTablet,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="نام بازیکن"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.guestCell}>
              <Text style={styles.guestLabel}>مهمان</Text>
              <ToggleSwitch value={isGuest} onValueChange={setIsGuest} />
            </View>
          </View>

          <View style={styles.toolbar}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="جستجو..."
              placeholderTextColor={theme.colors.textSecondary}
            />
            <FilterChips
              chips={categoryChips}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              compact
            />
          </View>

          {contentReady ? (
            <FlatList
              style={styles.menuList}
              contentContainerStyle={styles.menuListContent}
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={renderMenuItem}
              ListEmptyComponent={ListEmpty}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              getItemLayout={getItemLayout}
            />
          ) : (
            <View style={styles.menuList} />
          )}

          <View style={styles.buttons}>
            <Button
              title="لغو"
              onPress={onClose}
              variant="secondary"
            />
            <Button title="ذخیره" onPress={handleSave} style={styles.saveBtn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg + 24,
  },
  sheetTablet: {
    borderRadius: theme.borderRadius.xl,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  nameInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.inputOutline,
  },
  guestCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  guestLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  toolbar: {
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
    ...theme.inputOutline,
  },
  menuList: {
    flex: 1,
    minHeight: 0,
  },
  menuListContent: {
    paddingBottom: theme.spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuRowSelected: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary + '60',
  },
  menuRowName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  menuRowNameSelected: {
    fontFamily: 'Vazirmatn-Bold',
    color: theme.colors.text,
  },
  menuRowPrice: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginLeft: theme.spacing.sm,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  emptyMenu: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveBtn: {
    flex: 1,
  },
});
