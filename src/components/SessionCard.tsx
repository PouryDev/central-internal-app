import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { theme } from '../constants/theme';
import { Session } from '../data/mockData';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>سانس {session.id}</Text>
          <StatusBadge status={session.status} />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>گرداننده:</Text>
          <Text style={styles.value}>{session.facilitator.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>سالن:</Text>
          <Text style={styles.value}>{session.hall}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>زمان:</Text>
          <Text style={styles.value}>
            {session.date} - {session.time}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>تعداد بازیکن:</Text>
          <Text style={styles.value}>{session.players.length} نفر</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    fontWeight: '600',
  },
});

