import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';

interface SessionDetailsScreenProps {
  sessionId: string;
  onBack: () => void;
  onMarkAsPaid: () => void;
}

export const SessionDetailsScreen: React.FC<SessionDetailsScreenProps> = ({
  sessionId,
  onBack,
  onMarkAsPaid,
}) => {
  const { sessions, loading } = useData();
  const session = sessions.find((s) => s.id === sessionId);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>سانس یافت نشد</Text>
      </View>
    );
  }

  const calculatePayableAmount = (player: typeof session.players[0]) => {
    const total = player.orders.reduce((sum, item) => sum + item.price, 0);
    return player.isGuest ? Math.max(0, total - 80000) : total;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <BackButton onPress={onBack} />
        </View>
        <Text style={styles.title}>جزئیات سانس</Text>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>سانس {session.id}</Text>
          <StatusBadge status={session.status} />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>گرداننده:</Text>
          <Text style={styles.infoValue}>{session.facilitator.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>سالن:</Text>
          <Text style={styles.infoValue}>{session.hall}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاریخ:</Text>
          <Text style={styles.infoValue}>{session.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>زمان:</Text>
          <Text style={styles.infoValue}>{session.time}</Text>
        </View>
      </Card>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>بازیکنان</Text>
        {session.players.map((player) => {
          const payableAmount = calculatePayableAmount(player);
          return (
            <Card key={player.id} style={styles.playerCard}>
              <PlayerCard player={player} showToggle={false} />
              <View style={styles.payableRow}>
                <Text style={styles.payableLabel}>مبلغ قابل پرداخت:</Text>
                <Text style={styles.payableAmount}>
                  {payableAmount.toLocaleString()} تومان
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      {session.status === 'pending' && (
        <Button
          title="تسویه شد"
          onPress={onMarkAsPaid}
          style={styles.payButton}
        />
      )}
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
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    fontWeight: '600',
  },
  playersSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  playerCard: {
    marginBottom: theme.spacing.md,
  },
  payableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  payableLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  payableAmount: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  payButton: {
    marginTop: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontFamily: 'Vazirmatn-Regular',
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});

