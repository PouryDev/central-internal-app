import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedId?: string;
  onSelect: (chipId: string) => void;
  compact?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selectedId,
  onSelect,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              compact && styles.chipCompact,
              isSelected && styles.selectedChip,
            ]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.selectedChipText,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  containerCompact: {
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipCompact: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  selectedChipText: {
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
});
