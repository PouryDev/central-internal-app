import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Card } from '../components/Card';
import { theme } from '../constants/theme';

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
    icon: '📝',
  },
  {
    id: 'cashier',
    title: 'پنل صندوق‌دار',
    subtitle: 'مدیریت سانس‌ها و تسویه حساب',
    icon: '💰',
  },
  {
    id: 'admin',
    title: 'پنل مدیریت',
    subtitle: 'گرداننده‌ها، منو و آمار',
    icon: '⚙️',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSessionCreate,
  onNavigateToCashierPanel,
  onNavigateToAdminPanel,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - theme.spacing.lg * 2, 400);

  const handlers = [
    onNavigateToSessionCreate,
    onNavigateToCashierPanel,
    onNavigateToAdminPanel,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎲</Text>
        </View>
        <Text style={styles.title}>کافه مافیا</Text>
        <Text style={styles.subtitle}>سیستم مدیریت سانس‌ها</Text>
      </View>

      <View style={[styles.buttonsContainer, { width: cardWidth }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={handlers[index]}
            activeOpacity={0.8}
          >
            <Card elevated style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuChevron}>
                  {I18nManager.isRTL ? '‹' : '›'}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  menuCard: {
    overflow: 'hidden',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
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
  menuChevron: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
});
