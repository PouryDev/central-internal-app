import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import {
  ClockIcon,
  BuildingIcon,
  UsersIcon,
} from './Icons';
import { theme } from '../constants/theme';
import { toPersianNumber } from '../utils/toPersian';
import { formatDateForDisplay } from '../utils/date';
import type { Session } from '../types';

interface StatisticsSessionCardProps {
  session: Session;
  onPress?: () => void;
}

export const StatisticsSessionCard: React.FC<StatisticsSessionCardProps> = ({
  session,
  onPress,
}) => {
  const persianId = toPersianNumber(session.id);
  const persianDate = toPersianNumber(formatDateForDisplay(session.date));
  const persianTime = toPersianNumber(session.time);
  const userCount = session.players.filter((p) => !p.isGuest).length;
  const guestCount = session.players.filter((p) => p.isGuest).length;
  const persianUser = toPersianNumber(userCount);
  const persianGuest = toPersianNumber(guestCount);

  const content = (
    <Card style={styles.card} elevated>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <ClockIcon size={22} color={theme.colors.text} />
        </View>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.title}>سانس {persianId}</Text>
            <StatusBadge status={session.status} />
          </View>
          <Text style={styles.subtitle}>
            {session.facilitator.name} • {session.hall}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <BuildingIcon size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{session.hall}</Text>
            </View>
            <View style={styles.metaItem}>
              <ClockIcon size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                {persianDate} {persianTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <UsersIcon size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>یوزر: {persianUser}</Text>
            </View>
            <View style={styles.metaItem}>
              <UsersIcon size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>مهمان: {persianGuest}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
});
