import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { ClockIcon } from './Icons';
import { theme } from '../constants/theme';
import { toPersianNumber } from '../utils/toPersian';
import { formatDateForDisplay } from '../utils/date';
import type { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

const SessionCardComponent: React.FC<SessionCardProps> = ({ session, onPress }) => {
  const persianId = toPersianNumber(session.id);
  const persianDate = toPersianNumber(formatDateForDisplay(session.date));
  const persianTime = toPersianNumber(session.time);
  const userCount = session.players.filter((p) => !p.isGuest).length;
  const guestCount = session.players.filter((p) => p.isGuest).length;
  const persianUser = toPersianNumber(userCount);
  const persianGuest = toPersianNumber(guestCount);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <ClockIcon size={20} color={theme.colors.text} />
          </View>
          <View style={styles.info}>
            <View style={styles.header}>
              <Text style={styles.title}>سانس {persianId}</Text>
              <StatusBadge status={session.status} />
            </View>
            <Text style={styles.subtitle}>
              {session.facilitator.name} • {session.hall}
            </Text>
            <Text style={styles.meta}>
              یوزر: {persianUser} • مهمان: {persianGuest} • {persianDate} {persianTime}
            </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: 2,
  },
  meta: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
});

export const SessionCard = React.memo(SessionCardComponent);
