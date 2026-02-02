import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SessionCard } from '../components/SessionCard';
import { FilterChips } from '../components/FilterChips';
import { theme } from '../constants/theme';
import { sessions } from '../data/mockData';

interface CashierPanelScreenProps {
  onBack: () => void;
  onSessionPress: (sessionId: string) => void;
}

export const CashierPanelScreen: React.FC<CashierPanelScreenProps> = ({
  onBack,
  onSessionPress,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filterChips = [
    { id: 'all', label: 'همه سانس‌ها' },
    { id: 'pending', label: 'فقط ثبت نشده' },
    { id: 'paid', label: 'فقط تسویه شده' },
  ];

  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return session.status === 'pending';
    if (statusFilter === 'paid') return session.status === 'paid';
    return true;
  });

  const onStatusFilterChange = () => {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.title}>پنل صندوق‌دار</Text>
      </View>

      <FilterChips
        chips={filterChips}
        selectedId={statusFilter}
        onSelect={(id) => {
          setStatusFilter(id);
          onStatusFilterChange();
        }}
      />

      <View style={styles.sessionsList}>
        {filteredSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => onSessionPress(session.id)}
          />
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
  },
  header: {
    marginBottom: theme.spacing.lg,
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
  sessionsList: {
    marginTop: theme.spacing.md,
  },
});

