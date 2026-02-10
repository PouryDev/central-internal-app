import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/Card';
import { StatisticsFilterModal } from '../components/StatisticsFilterModal';
import type { StatisticsFilters } from '../components/StatisticsFilterModal';
import { StatisticsSessionCard } from '../components/StatisticsSessionCard';
import { UserIcon, FilterIcon, ChartIcon, ClipboardIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { toPersianNumber } from '../utils/toPersian';
import { getDateRangeForPreset } from '../utils/date';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { Session } from '../types';

const SESSIONS_PAGE_SIZE = 15;

function getDefaultFilters(): StatisticsFilters {
  const { from, to } = getDateRangeForPreset('this_month');
  return {
    dateFrom: from,
    dateTo: to,
    facilitatorId: 'all',
    hallId: 'all',
    status: 'all',
    guestType: 'non-guests',
  };
}

function toPageFilters(f: StatisticsFilters) {
  return {
    status: f.status as 'all' | 'pending' | 'paid',
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
    facilitatorId: f.facilitatorId,
    hallId: f.hallId,
    guestType: f.guestType as 'all' | 'guests' | 'non-guests',
  };
}

export const StatisticsScreen: React.FC = () => {
  const { contentMaxWidth, isTablet } = useResponsive();
  const {
    facilitators,
    halls,
    loading,
    getSessionsPage,
    getSessionStats,
  } = useData();
  const [filters, setFilters] = useState<StatisticsFilters>(getDefaultFilters);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalPlayers: number;
    facilitatorStats: { facilitator: { id: string; name: string }; count: number }[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [hasAnySessions, setHasAnySessions] = useState<boolean | null>(null);

  const pageFilters = useMemo(
    () => toPageFilters(filters),
    [
      filters.dateFrom,
      filters.dateTo,
      filters.facilitatorId,
      filters.hallId,
      filters.status,
      filters.guestType,
    ]
  );

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await getSessionStats(pageFilters, facilitators);
      setStats(s);
    } finally {
      setStatsLoading(false);
    }
  }, [getSessionStats, pageFilters, facilitators]);

  const loadSessions = useCallback(
    async (offset: number, append: boolean) => {
      const result = await getSessionsPage(offset, SESSIONS_PAGE_SIZE, pageFilters);
      if (append) {
        setSessions((prev) => [...prev, ...result.sessions]);
      } else {
        setSessions(result.sessions);
      }
      setTotal(result.total);
    },
    [getSessionsPage, pageFilters]
  );

  useEffect(() => {
    loadStats();
    loadSessions(0, false);
  }, [loadStats, loadSessions]);

  useEffect(() => {
    if (hasAnySessions === null && !loading) {
      getSessionsPage(0, 1, {}).then((r) =>
        setHasAnySessions(r.total > 0)
      );
    }
  }, [hasAnySessions, loading, getSessionsPage]);

  const hasMore = sessions.length < total;

  const handleLoadMore = useCallback(() => {
    if (!hasMore) return;
    loadSessions(sessions.length, true);
  }, [hasMore, sessions.length, loadSessions]);

  const renderSessionItem: ListRenderItem<Session> = useCallback(
    ({ item: session }) => <StatisticsSessionCard session={session} />,
    []
  );

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.facilitatorId !== 'all' ||
    filters.hallId !== 'all' ||
    filters.status !== 'all' ||
    filters.guestType !== 'all';

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>آمار</Text>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <FilterIcon size={20} color={hasActiveFilters ? theme.colors.text : theme.colors.textSecondary} />
            <Text
              style={[
                styles.filterButtonText,
                hasActiveFilters && styles.filterButtonTextActive,
              ]}
            >
              فیلتر
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {statsLoading ? '...' : toPersianNumber(stats?.totalSessions ?? 0)}
          </Text>
          <Text style={styles.summaryLabel}>سانس</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {statsLoading ? '...' : toPersianNumber(stats?.totalPlayers ?? 0)}
          </Text>
          <Text style={styles.summaryLabel}>بازیکن</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>گرداننده‌ها</Text>
        <View style={styles.statsList}>
          {(stats?.facilitatorStats ?? []).map((stat) => (
            <Card key={stat.facilitator.id} style={styles.statCard} elevated>
              <View style={styles.statCardContent}>
                <View style={styles.statAvatar}>
                  <UserIcon size={24} color={theme.colors.text} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>{stat.facilitator.name}</Text>
                  <Text style={styles.statValue}>
                    {toPersianNumber(stat.count)} نفر
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>سانس‌ها</Text>
      </View>
    </>
  );

  const renderListFooter = () =>
    hasMore ? (
      <View style={styles.loadMoreFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null;

  const renderListEmpty = () => (
    <Card style={styles.sessionsEmptyCard}>
      <View style={styles.sessionsEmptyIconWrap}>
        <ClipboardIcon size={56} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.sessionsEmptyTitle}>هنوز سانسی ثبت نشده</Text>
      <Text style={styles.sessionsEmptySubtitle}>
        {hasActiveFilters
          ? 'با این فیلترها سانسی یافت نشد. فیلترها را تغییر دهید یا سانس جدید ثبت کنید.'
          : 'برای مشاهده آمار، ابتدا از صفحه اصلی یک سانس ثبت کنید.'}
      </Text>
    </Card>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (hasAnySessions === false) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <ChartIcon size={64} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>داده‌ای برای نمایش آمار وجود ندارد</Text>
          <Text style={styles.emptySubtitle}>
            ابتدا سانس ثبت کنید تا آمار و گزارش‌ها در این بخش نمایش داده شوند.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isTablet && {
            maxWidth: contentMaxWidth,
            alignSelf: 'center' as const,
            width: '100%',
          },
        ]}
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />

      <StatisticsFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={setFilters}
        filters={filters}
        facilitators={facilitators}
        halls={halls}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  filterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginRight: theme.spacing.xs,
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  summaryNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  statsList: {
    gap: theme.spacing.sm,
  },
  statCard: {
    padding: theme.spacing.md,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  statValue: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
    marginTop: 2,
  },
  loadMoreFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionsEmptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
  },
  sessionsEmptyIconWrap: {
    marginBottom: theme.spacing.lg,
  },
  sessionsEmptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
  },
  sessionsEmptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
