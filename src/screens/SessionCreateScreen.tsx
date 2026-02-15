import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ListRenderItem,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from '../utils/toast';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { DebouncedTimeInput } from '../components/DebouncedTimeInput';
import { PlayerCard } from '../components/PlayerCard';
import { AddPlayerModal } from '../components/AddPlayerModal';
import { Card } from '../components/Card';
import { theme } from '../constants/theme';
import { UsersIcon, ClipboardIcon, ChevronIcon } from '../components/Icons';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import { getTodayJalali } from '../utils/date';
import type { Player, Session } from '../types';

const PLAYERS_PAGE_SIZE = 15;

interface SessionCreateScreenProps {
  onBack: () => void;
  onSubmitSession: (session: Session) => void | Promise<void>;
}

export const SessionCreateScreen: React.FC<SessionCreateScreenProps> = ({
  onBack,
  onSubmitSession,
}) => {
  const { isTablet } = useResponsive();
  const { facilitators, halls, menuItems, categories, getMaxSessionNumericId } = useData();

  const getNextSessionId = async (): Promise<string> => {
    const max = await getMaxSessionNumericId();
    return String(max + 1);
  };
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>();
  const [selectedHall, setSelectedHall] = useState<string>();
  const [sessionShift, setSessionShift] = useState<'day' | 'night'>('night');
  const [time, setTime] = useState('20:00');
  const timeRef = useRef('20:00');
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [visibleCount, setVisibleCount] = useState(PLAYERS_PAGE_SIZE);

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerModalVisible(true);
  };

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setPlayerModalVisible(true);
  }, []);

  const handleSavePlayer = (player: Player) => {
    if (editingPlayer) {
      setPlayers(
        players.map((p) => (p.id === player.id ? player : p))
      );
    } else {
      setPlayers([...players, player]);
      setVisibleCount((prev) => Math.max(prev, players.length + 1));
    }
    setEditingPlayer(null);
    setPlayerModalVisible(false);
  };

  const handleDeletePlayer = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    toast.success('بازیکن حذف شد.');
  }, []);

  const handleUpdatePlayerGuest = useCallback(
    (id: string, isGuest: boolean) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isGuest } : p))
      );
    },
    []
  );

  const goToStep2 = () => {
    if (!selectedFacilitator || !selectedHall) {
      toast.error('لطفاً گرداننده و سالن را انتخاب کنید.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    const facilitator = facilitators.find(
      (f) => String(f.id) === String(selectedFacilitator)
    );
    const hall = halls.find(
      (h) => String(h.id) === String(selectedHall)
    );
    if (!facilitator || !hall) {
      toast.error('لطفاً گرداننده و سالن را انتخاب کنید.');
      return;
    }
    const validPlayers = players.filter((p) => p.name.trim());
    if (validPlayers.length === 0) {
      toast.error('حداقل یک بازیکن با نام وارد کنید.');
      return;
    }
    const currentTime = timeRef.current || time;
    setSubmitting(true);
    try {
      const session: Session = {
        id: await getNextSessionId(),
        facilitator,
        hall: hall.name,
        time: currentTime,
        date: getTodayJalali(),
        players: validPlayers,
        status: 'pending',
        shift: sessionShift,
      };
      await onSubmitSession(session);
    } finally {
      setSubmitting(false);
    }
  };

  const displayedPlayers = players.slice(0, visibleCount);
  const hasMore = visibleCount < players.length;

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) =>
        Math.min(prev + PLAYERS_PAGE_SIZE, players.length)
      );
    }
  }, [hasMore, players.length]);

  const renderItem: ListRenderItem<Player> = useCallback(
    ({ item: player }) => (
      <PlayerCard
        player={player}
        showToggle={true}
        onGuestToggle={(isGuest) =>
          handleUpdatePlayerGuest(player.id, isGuest)
        }
        onEdit={() => handleEditPlayer(player)}
        onDelete={() => handleDeletePlayer(player.id)}
      />
    ),
    [handleUpdatePlayerGuest, handleEditPlayer, handleDeletePlayer]
  );

  /** Step 1: session info form (outside FlatList so time input is not remounted — fixes Android keyboard). */
  const step1Form = (
    <View style={styles.formSection}>
      <Card style={styles.formCard}>
        <View style={[styles.formRowsContainer, isTablet && styles.formRowsTablet]}>
          <View style={[styles.formRow, isTablet && styles.formRowTablet]}>
            <Text style={styles.label}>گرداننده</Text>
            <Dropdown
              options={facilitators.map((f) => ({
                id: f.id,
                label: f.name,
              }))}
              selectedId={selectedFacilitator}
              onSelect={(opt) => setSelectedFacilitator(opt.id)}
              placeholder="انتخاب گرداننده"
            />
          </View>

          <View style={[styles.formRow, isTablet && styles.formRowTablet]}>
            <Text style={styles.label}>سالن</Text>
            <Dropdown
              options={halls.map((h) => ({
                id: h.id,
                label: h.name,
              }))}
              selectedId={selectedHall}
              onSelect={(opt) => setSelectedHall(opt.id)}
              placeholder="انتخاب سالن"
            />
          </View>

          <View style={[styles.formRow, isTablet && styles.formRowTablet]}>
            <Text style={styles.label}>نوع سانس</Text>
            <View style={styles.shiftRow}>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  sessionShift === 'day' && styles.shiftButtonSelected,
                ]}
                onPress={() => setSessionShift('day')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.shiftButtonText,
                    sessionShift === 'day' && styles.shiftButtonTextSelected,
                  ]}
                >
                  سانس روز
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  sessionShift === 'night' && styles.shiftButtonSelected,
                ]}
                onPress={() => setSessionShift('night')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.shiftButtonText,
                    sessionShift === 'night' && styles.shiftButtonTextSelected,
                  ]}
                >
                  سانس شب
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.formRow, isTablet && styles.formRowTablet]}>
            <Text style={styles.label}>زمان</Text>
            <DebouncedTimeInput
              value={time}
              onChangeText={setTime}
              onValueRef={(t) => {
                timeRef.current = t;
              }}
              placeholder="۲۰:۰۰"
              style={styles.timeInput}
            />
          </View>
        </View>
      </Card>
      <Button
        title="ادامه"
        onPress={goToStep2}
        style={styles.continueButton}
      />
    </View>
  );

  const renderListEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <UsersIcon size={64} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>هنوز بازیکنی اضافه نکرده‌اید</Text>
        <Text style={styles.emptySubtitle}>
          برای شروع روی افزودن بازیکن بزنید.
        </Text>
      </View>
    ),
    []
  );

  const renderListFooter = useCallback(
    () => (
      <>
        {hasMore ? (
          <View style={styles.loadMoreFooter}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null}
        <Button
          title="ثبت سانس"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={submitting}
        />
      </>
    ),
    [hasMore, submitting, handleSubmit]
  );

  /** Step 2: quick back action + players list. */
  const step2Content = (
    <View style={styles.listWrapper}>
      <View style={styles.formSection}>
        <TouchableOpacity
          style={styles.previousStepCard}
          onPress={() => setStep(1)}
          activeOpacity={0.8}
        >
          <View style={styles.previousStepRow}>
            <View style={styles.previousStepTextWrap}>
              <Text style={styles.previousStepTitle}>بازگشت به مرحله قبل</Text>
            </View>
            <ChevronIcon
              size={20}
              color={theme.colors.primary}
              direction={I18nManager.isRTL ? 'right' : 'left'}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.playersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>بازیکنان</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPlayer}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ افزودن بازیکن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={displayedPlayers}
        keyExtractor={(item, index) => item.id || `player_${index}`}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.cardElevated, theme.colors.card]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <ClipboardIcon size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>ثبت سانس</Text>
              <Text style={styles.subtitle}>
                {step === 1 ? 'مرحله ۱ از ۲ — اطلاعات سانس' : 'مرحله ۲ از ۲ — بازیکنان'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={step === 1 ? onBack : () => setStep(1)}
            activeOpacity={0.7}
          >
            <ChevronIcon
              size={22}
              color={theme.colors.primary}
              direction={I18nManager.isRTL ? 'right' : 'left'}
            />
            <Text style={styles.backLabel}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 1 ? step1Form : step2Content}

        <AddPlayerModal
          visible={playerModalVisible}
          onClose={() => {
            setPlayerModalVisible(false);
            setEditingPlayer(null);
          }}
          onSave={handleSavePlayer}
          editingPlayer={editingPlayer}
          menuItems={menuItems}
          categories={categories}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  formSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  list: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backLabel: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
    marginHorizontal: theme.spacing.xs,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  continueButton: {
    marginTop: theme.spacing.md,
  },
  previousStepCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  previousStepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousStepTextWrap: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  previousStepTitle: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  formRowsContainer: {},
  formRowsTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  formRow: {
    marginBottom: theme.spacing.lg,
  },
  formRowTablet: {
    flex: 1,
    minWidth: 180,
    marginBottom: 0,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.sm,
  },
  timeInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.inputOutline,
  },
  shiftRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  shiftButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  shiftButtonTextSelected: {
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  playersSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  addButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    marginBottom: theme.spacing.lg,
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
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  loadMoreFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
