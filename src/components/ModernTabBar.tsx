import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { theme } from '../constants/theme';
import { useResponsive } from '../utils/responsive';

const TAB_BAR_MAX_WIDTH = 600;
const TAB_BAR_HEIGHT = 72;

interface TabItem {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}

interface ModernTabBarProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ModernTabBar: React.FC<ModernTabBarProps> = ({
  tabs,
  activeId,
  onSelect,
}) => {
  const { width, isTablet } = useResponsive();
  const tabBarMaxWidth = isTablet ? Math.min(width - theme.spacing.lg * 2, TAB_BAR_MAX_WIDTH) : undefined;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Platform.OS === 'ios' ? 24 : 16 },
        isTablet && styles.containerTablet,
      ]}
    >
      <View
        style={[
          styles.tabBar,
          tabBarMaxWidth !== undefined && { maxWidth: tabBarMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, { flex: 1 }]}
              onPress={() => onSelect(tab.id)}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconActive]}>
                {React.createElement(tab.Icon, {
                  size: 22,
                  color: isActive ? theme.colors.text : theme.colors.textSecondary,
                })}
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  containerTablet: {
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    backgroundColor: theme.colors.cardElevated,
    borderRadius: 28,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'visible' as const,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    overflow: 'hidden' as const,
  },
  tabIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  tabLabelActive: {
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
});
