import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ModernTabBar } from '../components/ModernTabBar';
import {
  UserIcon,
  MenuIcon,
  FolderIcon,
  BuildingIcon,
  ChartIcon,
  LayoutGridIcon,
  ChevronIcon,
} from '../components/Icons';
import { FacilitatorsScreen } from './FacilitatorsScreen';
import { MenuScreen } from './MenuScreen';
import { CategoriesScreen } from './CategoriesScreen';
import { HallsScreen } from './HallsScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { theme } from '../constants/theme';
import { useResponsive } from '../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  facilitators: UserIcon,
  menu: MenuIcon,
  categories: FolderIcon,
  halls: BuildingIcon,
  statistics: ChartIcon,
};

interface AdminPanelScreenProps {
  onBack: () => void;
}

type Tab = 'facilitators' | 'menu' | 'categories' | 'halls' | 'statistics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'facilitators', label: 'گرداننده' },
  { id: 'menu', label: 'منو' },
  { id: 'categories', label: 'دسته' },
  { id: 'halls', label: 'سالن' },
  { id: 'statistics', label: 'آمار' },
];

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  onBack,
}) => {
  const { contentMaxWidth, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState<Tab>('facilitators');

  const tabItems = TABS.map((t) => ({
    ...t,
    Icon: TAB_ICONS[t.id],
  }));

  const handleTabChange = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setActiveTab(id as Tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'facilitators':
        return <FacilitatorsScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'halls':
        return <HallsScreen />;
      case 'statistics':
        return <StatisticsScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.cardElevated, theme.colors.card]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <LayoutGridIcon size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>پنل مدیریت</Text>
              <Text style={styles.subtitle}>گرداننده‌ها، منو، سالن و آمار</Text>
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

      <Animated.View
        key={activeTab}
        style={[
          styles.content,
          isTablet && {
            maxWidth: contentMaxWidth,
            alignSelf: 'center' as const,
            width: '100%',
          },
        ]}
        entering={FadeIn.duration(220)}
      >
        {renderContent()}
      </Animated.View>

      <View style={styles.tabBarWrapper}>
        <ModernTabBar
          tabs={tabItems}
          activeId={activeTab}
          onSelect={handleTabChange}
        />
      </View>
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
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  tabBarWrapper: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
