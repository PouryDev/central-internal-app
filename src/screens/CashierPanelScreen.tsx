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
import { SessionCard } from '../components/SessionCard';
import { FilterChips } from '../components/FilterChips';
import { Card } from '../components/Card';
import { WalletIcon, ChevronIcon } from '../components/Icons';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import type { Session } from '../types';

const SESSIONS_PAGE_SIZE = 15;

interface CashierPanelScreenProps {
  onBack: () => void;
  onSessionPress: (sessionId: string) => void;
}

export const CashierPanelScreen: React.FC<CashierPanelScreenProps> = ({
  onBack,
  onSessionPress,
}) => {
  const { numColumns } = useResponsive();
  const { getSessionsPage, loading } = useData();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const filterChips = [
    { id: 'all', label: 'همه سانس‌ها' },
    { id: 'pending', label: 'ثبت نشده' },
    { id: 'paid', label: 'تسویه شده' },
  ];

  const loadPage = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setLoadingMore(true);
      try {
        const status =
          statusFilter === 'all'
            ? undefined
            : (statusFilter as 'pending' | 'paid');
        const result = await getSessionsPage(offset, SESSIONS_PAGE_SIZE, {
          status: status ?? 'all',
        });
        if (append) {
          setSessions((prev) => [...prev, ...result.sessions]);
        } else {
          setSessions(result.sessions);
        }
        setTotal(result.total);
      } finally {
        if (append) setLoadingMore(false);
      }
    },
    [getSessionsPage, statusFilter]
  );

  useEffect(() => {
    loadPage(0, false);
  }, [loadPage]);

  const handleLoadMore = useCallback(() => {
    if (sessions.length >= total || loadingMore) return;
    loadPage(sessions.length, true);
  }, [sessions.length, total, loadingMore, loadPage]);

  const handleFilterChange = useCallback((id: string) => {
    setStatusFilter(id);
  }, []);

  const renderSessionItem: ListRenderItem<Session> = useCallback(
    ({ item: session }) => (
      <View style={numColumns > 1 ? styles.gridItem : undefined}>
        <SessionCard
          session={session}
          onPress={() => onSessionPress(session.id)}
        />
      </View>
    ),
    [onSessionPress, numColumns]
  );

  const renderListHeader = useCallback(
    () => (
      <FilterChips
        chips={filterChips}
        selectedId={statusFilter}
        onSelect={handleFilterChange}
      />
    ),
    [filterChips, statusFilter, handleFilterChange]
  );

  const hasMore = sessions.length < total;

  const renderListFooter = useCallback(
    () =>
      hasMore ? (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : null,
    [hasMore]
  );

  const renderListEmpty = useCallback(
    () => (
      <Card style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <WalletIcon size={64} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>هنوز سانسی ثبت نشده است</Text>
        <Text style={styles.emptySubtitle}>
          برای ثبت سانس جدید به صفحه اصلی برگردید و گزینه «ثبت سانس جدید» را انتخاب کنید.
        </Text>
      </Card>
    ),
    []
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.cardElevated, theme.colors.card]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <WalletIcon size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>پنل صندوق‌دار</Text>
              <Text style={styles.subtitle}>
                مدیریت سانس‌ها و تسویه حساب
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
        style={styles.list}
        contentContainerStyle={styles.content}
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
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
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  backLabel: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  list: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  gridItem: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  columnWrapper: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loadMoreFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyState: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyIconWrap: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
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
});
