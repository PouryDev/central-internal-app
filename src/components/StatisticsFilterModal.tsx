import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Button } from './Button';
import { PersianDatePicker } from './PersianDatePicker';
import { theme } from '../constants/theme';
import { getDateRangeForPreset } from '../utils/date';
import { useResponsive } from '../utils/responsive';
import type { Facilitator, Hall } from '../types';

const MODAL_MAX_WIDTH = 480;

export interface StatisticsFilters {
  dateFrom: string | null;
  dateTo: string | null;
  facilitatorId: string;
  hallId: string;
  status: string;
  guestType: string;
}

interface StatisticsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: StatisticsFilters) => void;
  filters: StatisticsFilters;
  facilitators: Facilitator[];
  halls: Hall[];
}

const defaultFilters: StatisticsFilters = {
  dateFrom: null,
  dateTo: null,
  facilitatorId: 'all',
  hallId: 'all',
  status: 'all',
  guestType: 'all',
};

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

const SelectOption: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.option, selected && styles.optionSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const StatisticsFilterModal: React.FC<StatisticsFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  filters,
  facilitators,
  halls,
}) => {
  const { width, height } = useWindowDimensions();
  const { isTablet } = useResponsive();
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  const [localFilters, setLocalFilters] = useState<StatisticsFilters>(filters);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      if (filters.dateFrom && filters.dateTo) {
        const { from: todayFrom, to: todayTo } = getDateRangeForPreset('today');
        const { from: weekFrom, to: weekTo } = getDateRangeForPreset('this_week');
        const { from: monthFrom, to: monthTo } = getDateRangeForPreset('this_month');
        if (filters.dateFrom === todayFrom && filters.dateTo === todayTo) {
          setDatePreset('today');
          setShowCustomDate(false);
        } else if (filters.dateFrom === weekFrom && filters.dateTo === weekTo) {
          setDatePreset('this_week');
          setShowCustomDate(false);
        } else if (filters.dateFrom === monthFrom && filters.dateTo === monthTo) {
          setDatePreset('this_month');
          setShowCustomDate(false);
        } else {
          setDatePreset('custom');
          setShowCustomDate(true);
        }
      } else {
        setShowCustomDate(false);
        setDatePreset('all');
      }
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters(defaultFilters);
    setDatePreset('all');
    setShowCustomDate(false);
  };

  const handleDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === 'all') {
      setLocalFilters((prev) => ({ ...prev, dateFrom: null, dateTo: null }));
      setShowCustomDate(false);
    } else if (preset === 'custom') {
      setShowCustomDate(true);
    } else {
      const { from, to } = getDateRangeForPreset(preset);
      setLocalFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
      setShowCustomDate(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.overlay, isTablet && styles.overlayTablet]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              width: sheetWidth,
              maxHeight: isTablet ? height * 0.9 : undefined,
            },
            isTablet && styles.sheetTablet,
          ]}
        >
          <View style={styles.handle} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>بگرد و پیدا کن</Text>
            <Text style={styles.subtitle}>
              می‌تونی بر اساس تاریخ، گرداننده، سالن و وضعیت فیلتر کنی
            </Text>

            {/* زمان */}
            <View style={styles.card}>
              <Text style={styles.question}>کدوم روزها؟</Text>
              <View style={styles.optionsRow}>
                <SelectOption
                  label="همه"
                  selected={datePreset === 'all'}
                  onPress={() => handleDatePreset('all')}
                />
                <SelectOption
                  label="امروز"
                  selected={datePreset === 'today'}
                  onPress={() => handleDatePreset('today')}
                />
                <SelectOption
                  label="این هفته"
                  selected={datePreset === 'this_week'}
                  onPress={() => handleDatePreset('this_week')}
                />
                <SelectOption
                  label="این ماه"
                  selected={datePreset === 'this_month'}
                  onPress={() => handleDatePreset('this_month')}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.customDateTrigger,
                  datePreset === 'custom' && styles.customDateTriggerActive,
                ]}
                onPress={() => handleDatePreset('custom')}
              >
                <Text
                  style={[
                    styles.customDateText,
                    datePreset === 'custom' && styles.customDateTextActive,
                  ]}
                >
                  انتخاب تاریخ دقیق
                </Text>
              </TouchableOpacity>
              {showCustomDate && (
                <View style={styles.datePickers}>
                  <View style={styles.dateField}>
                    <Text style={styles.dateLabel}>از</Text>
                    <PersianDatePicker
                      value={localFilters.dateFrom ?? ''}
                      onChange={(v) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          dateFrom: v || null,
                        }))
                      }
                      placeholder="انتخاب"
                      compact
                    />
                  </View>
                  <View style={styles.dateField}>
                    <Text style={styles.dateLabel}>تا</Text>
                    <PersianDatePicker
                      value={localFilters.dateTo ?? ''}
                      onChange={(v) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          dateTo: v || null,
                        }))
                      }
                      placeholder="انتخاب"
                      compact
                    />
                  </View>
                </View>
              )}
            </View>

            {/* گرداننده */}
            <View style={styles.card}>
              <Text style={styles.question}>کدوم گرداننده؟</Text>
              <View style={styles.optionsGrid}>
                <SelectOption
                  label="همه"
                  selected={localFilters.facilitatorId === 'all'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, facilitatorId: 'all' }))
                  }
                />
                {facilitators.map((f) => (
                  <SelectOption
                    key={f.id}
                    label={f.name}
                    selected={localFilters.facilitatorId === f.id}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        facilitatorId: f.id,
                      }))
                    }
                  />
                ))}
              </View>
            </View>

            {/* سالن */}
            <View style={styles.card}>
              <Text style={styles.question}>کدوم سالن؟</Text>
              <View style={styles.optionsGrid}>
                <SelectOption
                  label="همه"
                  selected={localFilters.hallId === 'all'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, hallId: 'all' }))
                  }
                />
                {halls.map((h) => (
                  <SelectOption
                    key={h.id}
                    label={h.name}
                    selected={localFilters.hallId === h.id}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, hallId: h.id }))
                    }
                  />
                ))}
              </View>
            </View>

            {/* وضعیت */}
            <View style={styles.card}>
              <Text style={styles.question}>تسویه شده یا نه؟</Text>
              <View style={styles.optionsRow}>
                <SelectOption
                  label="همه"
                  selected={localFilters.status === 'all'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, status: 'all' }))
                  }
                />
                <SelectOption
                  label="ثبت نشده"
                  selected={localFilters.status === 'pending'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, status: 'pending' }))
                  }
                />
                <SelectOption
                  label="تسویه شده"
                  selected={localFilters.status === 'paid'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, status: 'paid' }))
                  }
                />
              </View>
            </View>

            {/* نوع بازیکن */}
            <View style={styles.card}>
              <Text style={styles.question}>مهمان یا عضو؟</Text>
              <View style={styles.optionsRow}>
                <SelectOption
                  label="همه"
                  selected={localFilters.guestType === 'all'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, guestType: 'all' }))
                  }
                />
                <SelectOption
                  label="مهمان"
                  selected={localFilters.guestType === 'guests'}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, guestType: 'guests' }))
                  }
                />
                <SelectOption
                  label="عضو"
                  selected={localFilters.guestType === 'non-guests'}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      guestType: 'non-guests',
                    }))
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>پاک کن</Text>
            </TouchableOpacity>

            <Button
              title="اعمال فیلتر"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
  },
  sheetTablet: {
    borderRadius: theme.borderRadius.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  scroll: {},
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + 32,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  question: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  option: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  optionTextSelected: {
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  customDateTrigger: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  customDateTriggerActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  customDateText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  customDateTextActive: {
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  datePickers: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    marginBottom: theme.spacing.xs,
  },
  clearButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Bold',
  },
  applyButton: {
    marginTop: theme.spacing.lg,
  },
});
