import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackButton } from '../components/BackButton';
import { FacilitatorsScreen } from './FacilitatorsScreen';
import { MenuScreen } from './MenuScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { theme } from '../constants/theme';

interface AdminPanelScreenProps {
  onBack: () => void;
}

type Tab = 'facilitators' | 'menu' | 'statistics';

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('facilitators');

  const tabs = [
    { id: 'facilitators' as Tab, label: 'گرداننده‌ها' },
    { id: 'menu' as Tab, label: 'منو' },
    { id: 'statistics' as Tab, label: 'آمار' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <BackButton onPress={onBack} />
        </View>
        <Text style={styles.title}>پنل مدیریت</Text>
      </View>

      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'facilitators' && <FacilitatorsScreen />}
        {activeTab === 'menu' && <MenuScreen />}
        {activeTab === 'statistics' && <StatisticsScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  tabsWrapper: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  activeTabText: {
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  content: {
    flex: 1,
  },
});
