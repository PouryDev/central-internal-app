import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../components/Card';
import { FilterChips } from '../components/FilterChips';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';

export const StatisticsScreen: React.FC = () => {
  const { facilitators, sessions, loading } = useData();
  const [guestFilter, setGuestFilter] = useState<string>('all');
  const [sessionFilters, setSessionFilters] = useState({
    facilitator: 'all',
    hall: 'all',
    date: 'all',
    status: 'all',
  });

  const guestFilterChips = [
    { id: 'all', label: 'همه' },
    { id: 'guests', label: 'مهمان‌ها' },
    { id: 'non-guests', label: 'غیرمهمان‌ها' },
  ];

  const onGuestFilterChange = () => {};
  const onSessionFilterChange = () => {};

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getFacilitatorStats = () => {
    return facilitators.map((facilitator) => {
      const facilitatorSessions = sessions.filter(
        (s) => s.facilitator.id === facilitator.id
      );
      let userCount = 0;
      facilitatorSessions.forEach((session) => {
        session.players.forEach((player) => {
          if (guestFilter === 'all') {
            userCount++;
          } else if (guestFilter === 'guests' && player.isGuest) {
            userCount++;
          } else if (guestFilter === 'non-guests' && !player.isGuest) {
            userCount++;
          }
        });
      });
      return { facilitator, count: userCount };
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>آمار گرداننده‌ها</Text>
        <FilterChips
          chips={guestFilterChips}
          selectedId={guestFilter}
          onSelect={(id) => {
            setGuestFilter(id);
            onGuestFilterChange();
          }}
        />
        <View style={styles.statsList}>
          {getFacilitatorStats().map((stat) => (
            <Card key={stat.facilitator.id} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.facilitator.name}</Text>
              <Text style={styles.statValue}>
                {stat.count} کاربر ثبت‌نام شده
              </Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>لیست سانس‌ها</Text>
        <View style={styles.filtersNote}>
          <Text style={styles.noteText}>
            فیلترها: گرداننده، سالن، تاریخ، وضعیت
          </Text>
        </View>
        <View style={styles.sessionsList}>
          {sessions.map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>گرداننده:</Text>
                <Text style={styles.sessionValue}>
                  {session.facilitator.name}
                </Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>سالن:</Text>
                <Text style={styles.sessionValue}>{session.hall}</Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>تاریخ:</Text>
                <Text style={styles.sessionValue}>{session.date}</Text>
              </View>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>وضعیت:</Text>
                <Text style={styles.sessionValue}>
                  {session.status === 'pending' ? 'ثبت نشده' : 'تسویه شده'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  statsList: {
    marginTop: theme.spacing.md,
  },
  statCard: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  statValue: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  filtersNote: {
    marginBottom: theme.spacing.md,
  },
  noteText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  sessionsList: {
    marginTop: theme.spacing.md,
  },
  sessionCard: {
    marginBottom: theme.spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sessionLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  sessionValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    fontWeight: '600',
  },
});

