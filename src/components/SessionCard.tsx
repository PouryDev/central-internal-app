import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { theme } from '../constants/theme';
import type { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

const INFO_ICONS = {
  facilitator: '👤',
  hall: '🏛',
  time: '🕐',
  players: '👥',
};

export const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>سانس {session.id}</Text>
          <StatusBadge status={session.status} />
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>{INFO_ICONS.facilitator}</Text>
            <Text style={styles.label}>گرداننده</Text>
            <Text style={styles.value}>{session.facilitator.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>{INFO_ICONS.hall}</Text>
            <Text style={styles.label}>سالن</Text>
            <Text style={styles.value}>{session.hall}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>{INFO_ICONS.time}</Text>
            <Text style={styles.label}>زمان</Text>
            <Text style={styles.value}>
              {session.date} • {session.time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>{INFO_ICONS.players}</Text>
            <Text style={styles.label}>بازیکن</Text>
            <Text style={styles.value}>{session.players.length} نفر</Text>
          </View>
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
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  infoGrid: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    width: 24,
    textAlign: 'center',
    marginLeft: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    width: 70,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    fontWeight: '600',
    flex: 1,
  },
});
