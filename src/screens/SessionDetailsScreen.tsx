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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { UserIcon, BuildingIcon, ClockIcon, ClipboardIcon, ChevronIcon, UsersIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { toPersianNumber } from '../utils/toPersian';
import { formatDateForDisplay } from '../utils/date';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { Player, Session } from '../types';

const PLAYERS_PAGE_SIZE = 15;

interface SessionDetailsScreenProps {
  sessionId: string;
  onBack: () => void;
  onMarkAsPaid: () => void;
}

export const SessionDetailsScreen: React.FC<SessionDetailsScreenProps> = ({
  sessionId,
  onBack,
  onMarkAsPaid,
}) => {
  const { contentMaxWidth, isTablet } = useResponsive();
  const { getSessionById, loading } = useData();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PLAYERS_PAGE_SIZE);
  const [markingPaid, setMarkingPaid] = useState(false);

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

  const renderItem: ListRenderItem<Player> = useCallback(
    ({ item: player }) => <PlayerCard player={player} showToggle={false} />,
    []
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
              <View style={styles.infoItem}>
                <UsersIcon size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoValue}>
                  یوزر: {toPersianNumber(session.players.filter((p) => !p.isGuest).length)} • مهمان: {toPersianNumber(session.players.filter((p) => p.isGuest).length)}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>بازیکنان</Text>
          </View>
        </>
      ) : null,
    [session]
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
          {session.status === 'pending' && (
            <Button
              title="تسویه شد"
              onPress={handleMarkAsPaid}
              loading={markingPaid}
              style={styles.payButton}
            />
          )}
        </>
      ) : null,
    [session, hasMore, handleMarkAsPaid, markingPaid]
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
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
  playersSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  payButton: {
    marginTop: theme.spacing.lg,
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

