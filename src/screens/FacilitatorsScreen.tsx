import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { facilitators } from '../data/mockData';

export const FacilitatorsScreen: React.FC = () => {
  const onAddFacilitator = () => {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="+ افزودن گرداننده"
          onPress={onAddFacilitator}
          style={styles.addButton}
        />
      </View>

      <View style={styles.list}>
        {facilitators.map((facilitator) => (
          <Card key={facilitator.id} style={styles.facilitatorCard}>
            <Text style={styles.facilitatorName}>{facilitator.name}</Text>
          </Card>
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
    marginBottom: theme.spacing.md,
  },
  addButton: {
    width: '100%',
  },
  list: {
    gap: theme.spacing.md,
  },
  facilitatorCard: {
    padding: theme.spacing.lg,
  },
  facilitatorName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
});

