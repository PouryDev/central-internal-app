import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from '../utils/toast';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { AddPlayerModal } from '../components/AddPlayerModal';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { UserIcon, BuildingIcon, ClockIcon, ClipboardIcon, ChevronIcon, UsersIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { toPersianNumber } from '../utils/toPersian';
import { formatDateForDisplay } from '../utils/date';
import { getPlayerCounts } from '../utils/sessionNormalize';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { Player, Session } from '../types';

const PLAYERS_PAGE_SIZE = 15;

interface SessionDetailsScreenProps {
  sessionId: string;
  onBack: () => void;
  onMarkAsPaid: () => void;
  onEditSession?: () => void;
}

export const SessionDetailsScreen: React.FC<SessionDetailsScreenProps> = ({
  sessionId,
  onBack,
  onMarkAsPaid,
  onEditSession,
}) => {
  const { contentMaxWidth, isTablet } = useResponsive();
  const {
    getSessionById,
    updateSession,
    menuItems,
    categories,
    loading,
  } = useData();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PLAYERS_PAGE_SIZE);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const canEditPlayers = Boolean(onEditSession);

  useEffect(() => {
    setVisibleCount(PLAYERS_PAGE_SIZE);
    setSessionLoading(true);
    getSessionById(sessionId).then((s) => {
      setSession(s);
      setSessionLoading(false);
    });
  }, [sessionId, getSessionById]);

  const displayedPlayers = session ? session.players.slice(0, visibleCount) : [];
  const hasMore = session ? visibleCount < session.players.length : false;

  const handleLoadMore = useCallback(() => {
    if (session && visibleCount < session.players.length) {
      setVisibleCount((prev) =>
        Math.min(prev + PLAYERS_PAGE_SIZE, session.players.length)
      );
    }
  }, [session, visibleCount]);

  const handleMarkAsPaid = useCallback(async () => {
    setMarkingPaid(true);
    try {
      await onMarkAsPaid();
    } finally {
      setMarkingPaid(false);
    }
  }, [onMarkAsPaid]);

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setPlayerModalVisible(true);
  }, []);

  const handleAddPlayer = useCallback(() => {
    setEditingPlayer(null);
    setPlayerModalVisible(true);
  }, []);

  const handleSavePlayer = useCallback(
    (player: Player) => {
      if (!session) return;
      let nextPlayers: Player[];
      if (editingPlayer) {
        nextPlayers = session.players.map((p) =>
          p.id === player.id ? player : p
        );
      } else {
        nextPlayers = [...session.players, player];
        setVisibleCount((prev) => Math.max(prev, session.players.length + 1));
      }
      const updated: Session = { ...session, players: nextPlayers };
      updateSession(updated).then(() => {
        setSession(updated);
        setEditingPlayer(null);
        setPlayerModalVisible(false);
        toast.success(editingPlayer ? 'بازیکن ویرایش شد.' : 'بازیکن اضافه شد.');
      });
    },
    [session, editingPlayer, updateSession]
  );

  const handleDeletePlayer = useCallback(
    (playerId: string) => {
      if (!session) return;
      const nextPlayers = session.players.filter((p) => p.id !== playerId);
      const updated: Session = { ...session, players: nextPlayers };
      updateSession(updated).then(() => {
        setSession(updated);
        toast.success('بازیکن حذف شد.');
      });
    },
    [session, updateSession]
  );

  const handleUpdatePlayerGuest = useCallback(
    (id: string, isGuest: boolean) => {
      if (!session) return;
      const nextPlayers = session.players.map((p) =>
        p.id === id ? { ...p, isGuest } : p
      );
      const updated: Session = { ...session, players: nextPlayers };
      updateSession(updated).then(() => setSession(updated));
    },
    [session, updateSession]
  );

  const renderItem: ListRenderItem<Player> = useCallback(
    ({ item: player }) => (
      <PlayerCard
        player={player}
        showToggle={canEditPlayers}
        onGuestToggle={
          canEditPlayers
            ? (isGuest) => handleUpdatePlayerGuest(player.id, isGuest)
            : undefined
        }
        onEdit={canEditPlayers ? () => handleEditPlayer(player) : undefined}
        onDelete={
          canEditPlayers ? () => handleDeletePlayer(player.id) : undefined
        }
      />
    ),
    [
      canEditPlayers,
      handleEditPlayer,
      handleDeletePlayer,
      handleUpdatePlayerGuest,
    ]
  );

  const renderListHeader = useCallback(
    () =>
      session ? (
        <>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>سانس {toPersianNumber(session.id)}</Text>
                <StatusBadge status={session.status} />
              </View>
            </View>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <UserIcon size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoValue}>{session.facilitator.name}</Text>
              </View>
              <View style={styles.infoItem}>
                <BuildingIcon size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoValue}>{session.hall}</Text>
              </View>
              <View style={styles.infoItem}>
                <ClockIcon size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoValue}>
                  {toPersianNumber(formatDateForDisplay(session.date))} • {toPersianNumber(session.time)}
                </Text>
              </View>
              {(session.shift === 'day' || session.shift === 'night') && (
                <View style={styles.infoItem}>
                  <ClipboardIcon size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.infoValue}>
                    {session.shift === 'day' ? 'سانس روز' : 'سانس شب'}
                  </Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <UsersIcon size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoValue}>
                  یوزر: {toPersianNumber(getPlayerCounts(session.players).userCount)} • مهمان: {toPersianNumber(getPlayerCounts(session.players).guestCount)}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.playersSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>بازیکنان</Text>
              {canEditPlayers && (
                <TouchableOpacity
                  style={styles.addPlayerButton}
                  onPress={handleAddPlayer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addPlayerButtonText}>+ افزودن بازیکن</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      ) : null,
    [session, canEditPlayers, handleAddPlayer]
  );

  const renderListFooter = useCallback(
    () =>
      session ? (
        <>
          {hasMore ? (
            <View style={styles.loadMoreFooter}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null}
          <View style={styles.footerActions}>
            {onEditSession && (
              <Button
                title="ویرایش سانس"
                onPress={onEditSession}
                variant="secondary"
                style={styles.editButton}
              />
            )}
            {session.status === 'pending' && (
              <Button
                title="تسویه شد"
                onPress={handleMarkAsPaid}
                loading={markingPaid}
                style={styles.payButton}
              />
            )}
          </View>
        </>
      ) : null,
    [session, hasMore, handleMarkAsPaid, markingPaid, onEditSession]
  );

  if (loading || sessionLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>سانس یافت نشد</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
              <Text style={styles.title}>جزئیات سانس</Text>
              <Text style={styles.subtitle}>
                سانس {toPersianNumber(session.id)} • {session.facilitator.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
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
        <FlatList
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isTablet && {
              maxWidth: contentMaxWidth,
              alignSelf: 'center' as const,
            },
          ]}
          data={displayedPlayers}
          keyExtractor={(item, index) => item.id || `player_${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
        />
        {canEditPlayers && (
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  infoGrid: {
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  playersSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  addPlayerButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addPlayerButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  editButton: {
    flex: 1,
  },
  payButton: {
    flex: 1,
  },
  loadMoreFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});

