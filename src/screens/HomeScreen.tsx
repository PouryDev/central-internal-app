import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import {
  ClipboardIcon,
  WalletIcon,
  LayoutGridIcon,
  ChevronIcon,
  DiceIcon,
  FolderIcon,
  SettingsIcon,
  CodeIcon,
} from '../components/Icons';
import { ExportImportModal } from '../components/ExportImportModal';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';
import { toPersianNumber } from '../utils/toPersian';

interface HomeScreenProps {
  onNavigateToSessionCreate: () => void;
  onNavigateToCashierPanel: () => void;
  onNavigateToAdminPanel: () => void;
}

const menuItems = [
  {
    id: 'session-create',
    title: 'ثبت سانس جدید',
    subtitle: 'شروع سانس جدید و ثبت بازیکنان',
    Icon: ClipboardIcon,
    requiresSetup: true,
  },
  {
    id: 'cashier',
    title: 'پنل صندوق‌دار',
    subtitle: 'مدیریت سانس‌ها و تسویه حساب',
    Icon: WalletIcon,
    requiresSetup: true,
  },
  {
    id: 'admin',
    title: 'پنل مدیریت',
    subtitle: 'گرداننده‌ها، منو و آمار',
    Icon: LayoutGridIcon,
    requiresSetup: false,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSessionCreate,
  onNavigateToCashierPanel,
  onNavigateToAdminPanel,
}) => {
  const { width } = useWindowDimensions();
  const { contentMaxWidth, numColumns } = useResponsive();
  const {
    menuItems: menuData,
    facilitators,
    halls,
    loading,
    error,
    refreshData,
    getPendingSessionsCount,
  } = useData();
  const [exportImportModalVisible, setExportImportModalVisible] = useState(false);
  const [pendingSessionsCount, setPendingSessionsCount] = useState(0);
  const containerWidth = Math.min(width - theme.spacing.lg * 2, contentMaxWidth);
  const cardWidth =
    numColumns === 1
      ? Math.min(containerWidth, 400)
      : (containerWidth - (numColumns - 1) * theme.spacing.md) / numColumns;

  const canUseSessionFlow =
    menuData.length > 0 && facilitators.length > 0 && halls.length > 0;

  useEffect(() => {
    getPendingSessionsCount()
      .then(setPendingSessionsCount)
      .catch(() => setPendingSessionsCount(0));
  }, [getPendingSessionsCount]);

  const handlers = [
    onNavigateToSessionCreate,
    onNavigateToCashierPanel,
    onNavigateToAdminPanel,
  ];

  const handlePress = (index: number) => {
    const item = menuItems[index];
    if (item.requiresSetup && !canUseSessionFlow) return;
    handlers[index]();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>خطا در بارگذاری داده‌ها</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshData()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <DiceIcon size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>دن‌کلاب مرکز</Text>
        <Text style={styles.subtitle}>سیستم مدیریت سانس‌ها</Text>
      </View>

      <View
        style={[
          styles.buttonsContainer,
          { width: containerWidth },
          numColumns > 1 && styles.buttonsContainerGrid,
        ]}
      >
        {menuItems.map((item, index) => {
          const isCashierItem = item.id === 'cashier';
          const showBadge = isCashierItem && pendingSessionsCount > 0;
          const isDisabled = item.requiresSetup && !canUseSessionFlow;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handlePress(index)}
              activeOpacity={0.8}
              disabled={isDisabled}
              style={[
                numColumns > 1 && { width: cardWidth },
                isDisabled && styles.menuCardDisabled,
              ]}
            >
              <Card elevated style={styles.menuCard}>
                <View style={styles.menuContent}>
                  <View style={[styles.menuIconContainer, isDisabled && styles.menuIconDisabled]}>
                    {React.createElement(item.Icon, {
                      size: 24,
                      color: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
                    })}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, isDisabled && styles.menuTextDisabled]}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {toPersianNumber(pendingSessionsCount)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.menuChevronWrap}>
                    <ChevronIcon
                      size={20}
                      color={theme.colors.textSecondary}
                      direction={I18nManager.isRTL ? 'left' : 'right'}
                    />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {!canUseSessionFlow && (
          <Card
            style={[
              styles.setupHintCard,
              numColumns > 1 && { width: containerWidth },
            ]}
          >
            <View style={styles.setupHintIconWrap}>
              <SettingsIcon size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.setupHintTitle}>پیش‌نیاز ثبت سانس</Text>
            <Text style={styles.setupHintText}>
              برای ثبت سانس و مدیریت صندوق، ابتدا در پنل مدیریت گرداننده، منو و سالن را تعریف کنید.
            </Text>
            <TouchableOpacity
              style={styles.setupHintButton}
              onPress={onNavigateToAdminPanel}
              activeOpacity={0.8}
            >
              <Text style={styles.setupHintButtonText}>رفتن به پنل مدیریت</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={[styles.developerBadgeWrap, numColumns > 1 && { width: containerWidth }]}>
          <View style={styles.developerBadge}>
            <Text style={styles.developerName}>PK (Pouriya Khazaei)</Text>
            <CodeIcon size={16} color={theme.colors.primary} />
            <Text style={styles.developerLabel}>Developed by</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.exportImportBtn}
        onPress={() => setExportImportModalVisible(true)}
        activeOpacity={0.8}
      >
        <FolderIcon size={20} color={theme.colors.textSecondary} />
        <Text style={styles.exportImportBtnText}>خروجی / ورودی داده</Text>
      </TouchableOpacity>

    </ScrollView>

    <ExportImportModal
      visible={exportImportModalVisible}
      onClose={() => setExportImportModalVisible(false)}
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontFamily: 'Vazirmatn-Bold',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  buttonsContainer: {
    alignSelf: 'center',
    gap: theme.spacing.md,
  },
  buttonsContainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuCard: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuCardDisabled: {
    opacity: theme.opacity.disabled,
  },
  menuIconDisabled: {
    opacity: 0.7,
  },
  menuTextDisabled: {
    color: theme.colors.textSecondary,
  },
  setupHintCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  setupHintIconWrap: {
    marginBottom: theme.spacing.md,
  },
  setupHintTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  setupHintText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  setupHintButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  setupHintButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  menuSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  menuChevronWrap: {
    transform: [{ rotate: '180deg' }],
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: theme.spacing.xs,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.danger ?? '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontFamily: 'Vazirmatn-Bold',
  },
  exportImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center',
  },
  exportImportBtnText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Bold',
  },
  developerBadgeWrap: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    alignSelf: 'center',
  },
  developerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    direction: 'ltr' as const,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  developerLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  developerName: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
    letterSpacing: 0.5,
  },
});
