import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.title}>پنل مدیریت</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
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
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Regular',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginLeft: theme.spacing.sm,
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

