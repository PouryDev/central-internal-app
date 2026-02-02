import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { PlayerCard } from '../components/PlayerCard';
import { Card } from '../components/Card';
import { theme } from '../constants/theme';
import {
  facilitators,
  halls,
  menuItems,
  type Player,
  type MenuItem,
} from '../data/mockData';

interface SessionCreateScreenProps {
  onBack: () => void;
  onSubmitSession: () => void;
}

export const SessionCreateScreen: React.FC<SessionCreateScreenProps> = ({
  onBack,
  onSubmitSession,
}) => {
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>();
  const [selectedHall, setSelectedHall] = useState<string>();
  const [time, setTime] = useState('20:00');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: '',
      isGuest: false,
      orders: [],
    },
  ]);

  const handleAddPlayer = () => {
    setPlayers([
      ...players,
      {
        id: Date.now().toString(),
        name: '',
        isGuest: false,
        orders: [],
      },
    ]);
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(
      players.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleToggleMenuItem = (playerId: string, item: MenuItem) => {
    setPlayers(
      players.map((p) => {
        if (p.id !== playerId) return p;
        const hasItem = p.orders.some((o) => o.id === item.id);
        return {
          ...p,
          orders: hasItem
            ? p.orders.filter((o) => o.id !== item.id)
            : [...p.orders, item],
        };
      })
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ثبت سانس جدید</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.formRow}>
          <Text style={styles.label}>گرداننده:</Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              options={facilitators.map((f) => ({
                id: f.id,
                label: f.name,
              }))}
              selectedId={selectedFacilitator}
              onSelect={(opt) => setSelectedFacilitator(opt.id)}
              placeholder="انتخاب گرداننده"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>سالن:</Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              options={halls.map((h) => ({
                id: h.id,
                label: h.name,
              }))}
              selectedId={selectedHall}
              onSelect={(opt) => setSelectedHall(opt.id)}
              placeholder="انتخاب سالن"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>زمان:</Text>
          <TextInput
            style={styles.timeInput}
            value={time}
            onChangeText={setTime}
            placeholder="20:00"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </Card>

      <View style={styles.playersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>بازیکنان</Text>
          <TouchableOpacity onPress={handleAddPlayer}>
            <Text style={styles.addButton}>+ افزودن بازیکن</Text>
          </TouchableOpacity>
        </View>

        {players.map((player, index) => (
          <Card key={player.id} style={styles.playerCard}>
            <TextInput
              style={styles.playerNameInput}
              value={player.name}
              onChangeText={(name) =>
                handleUpdatePlayer(player.id, { name })
              }
              placeholder="نام بازیکن"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <PlayerCard
              player={player}
              showToggle={true}
              onGuestToggle={(isGuest) =>
                handleUpdatePlayer(player.id, { isGuest })
              }
            />
            <View style={styles.menuSection}>
              <Text style={styles.menuTitle}>منوی سفارش:</Text>
              {menuItems.map((item) => {
                const isSelected = player.orders.some((o) => o.id === item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      isSelected && styles.selectedMenuItem,
                    ]}
                    onPress={() => handleToggleMenuItem(player.id, item)}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        isSelected && styles.selectedMenuItemText,
                      ]}
                    >
                      {item.name} - {item.price.toLocaleString()} تومان
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        ))}
      </View>

      <Button
        title="ثبت سانس"
        onPress={onSubmitSession}
        style={styles.submitButton}
      />
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
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  formRow: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.sm,
  },
  dropdownContainer: {
    width: '100%',
  },
  timeInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playersSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  addButton: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Regular',
  },
  playerCard: {
    marginBottom: theme.spacing.md,
  },
  playerNameInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  menuSection: {
    marginTop: theme.spacing.md,
  },
  menuTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedMenuItem: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  menuItemText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  selectedMenuItemText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
});

