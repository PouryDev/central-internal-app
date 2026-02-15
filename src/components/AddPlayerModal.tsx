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
import { normalizePlayer } from '../utils/sessionNormalize';
import type { Player, MenuItem, OrderLine } from '../types';

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
  const [count, setCount] = useState(1);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
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
        const normalized = normalizePlayer(editingPlayer);
        setName(normalized.name);
        setIsGuest(normalized.isGuest);
        setCount(normalized.count ?? 1);
        setOrderLines([...normalized.orders]);
      } else {
        setName('');
        setIsGuest(false);
        setCount(1);
        setOrderLines([]);
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

  const handleAddOrIncrementItem = useCallback((item: MenuItem) => {
    setOrderLines((prev) => {
      const existing = prev.find((o) => o.menuItemId === item.id);
      if (existing) {
        return prev.map((o) =>
          o.menuItemId === item.id ? { ...o, quantity: o.quantity + 1 } : o
        );
      }
      const line: OrderLine = {
        id: `line_${Date.now()}_${item.id}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      };
      return [...prev, line];
    });
  }, []);

  const handleIncrementLine = useCallback((lineId: string) => {
    setOrderLines((prev) =>
      prev.map((o) => (o.id === lineId ? { ...o, quantity: o.quantity + 1 } : o))
    );
  }, []);

  const handleDecrementLine = useCallback((lineId: string) => {
    setOrderLines((prev) => {
      const line = prev.find((o) => o.id === lineId);
      if (!line) return prev;
      if (line.quantity <= 1) return prev.filter((o) => o.id !== lineId);
      return prev.map((o) =>
        o.id === lineId ? { ...o, quantity: o.quantity - 1 } : o
      );
    });
  }, []);

  const renderMenuItem: ListRenderItem<MenuItem> = useCallback(
    ({ item }) => {
      const line = orderLines.find((o) => o.menuItemId === item.id);
      const qty = line?.quantity ?? 0;
      return (
        <TouchableOpacity
          onPress={() => handleAddOrIncrementItem(item)}
          activeOpacity={0.7}
          style={[
            styles.menuRow,
            qty > 0 && styles.menuRowSelected,
          ]}
        >
          <Text
            style={[
              styles.menuRowName,
              qty > 0 && styles.menuRowNameSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.menuRowPrice}>
            {toPersianWithSeparator(item.price)} تومان
            {qty > 0 ? ` • ${qty}` : ''}
          </Text>
          {qty > 0 && (
            <View style={styles.checkDot} />
          )}
        </TouchableOpacity>
      );
    },
    [orderLines, handleAddOrIncrementItem]
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
    const personCount = count >= 1 ? count : 1;
    const player: Player = {
      id: editingPlayer?.id ?? Date.now().toString(),
      name: trimmedName,
      isGuest,
      count: personCount,
      orders: orderLines.filter((l) => l.quantity >= 1),
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
            <View style={styles.countCell}>
              <Text style={styles.countLabel}>تعداد نفر</Text>
              <View style={styles.countStepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCount((c) => (c > 1 ? c - 1 : 1))}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.countValue}>{count}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCount((c) => c + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.guestCell}>
              <Text style={styles.guestLabel}>مهمان</Text>
              <ToggleSwitch value={isGuest} onValueChange={setIsGuest} />
            </View>
          </View>

          {orderLines.length > 0 ? (
            <View style={styles.selectedOrdersSection}>
              <Text style={styles.selectedOrdersTitle}>سفارش‌های انتخاب‌شده</Text>
              {orderLines.map((line) => (
                <View key={line.id} style={styles.orderLineRow}>
                  <Text style={styles.orderLineName} numberOfLines={1}>
                    {line.name}
                  </Text>
                  <View style={styles.orderLineQty}>
                    <TouchableOpacity
                      style={styles.stepperBtnSmall}
                      onPress={() => handleDecrementLine(line.id)}
                    >
                      <Text style={styles.stepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.orderLineQtyText}>{line.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtnSmall}
                      onPress={() => handleIncrementLine(line.id)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.orderLinePrice}>
                    {toPersianWithSeparator(line.price * line.quantity)} تومان
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

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
  countCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  countLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  countStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepperBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 36,
    alignItems: 'center',
  },
  stepperBtnSmall: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  countValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    minWidth: 24,
    textAlign: 'center',
  },
  selectedOrdersSection: {
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedOrdersTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.xs,
  },
  orderLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  orderLineName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  orderLineQty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderLineQtyText: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    minWidth: 20,
    textAlign: 'center',
  },
  orderLinePrice: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
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
