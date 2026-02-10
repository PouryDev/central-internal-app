import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import moment from 'moment-jalaali';
import { theme } from '../constants/theme';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });
import { toPersianNumber } from '../utils/toPersian';

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

interface DayInfo {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled?: boolean;
}

interface PersianDatePickerProps {
  value?: string;
  onChange: (gregorianDate: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string | null;
  compact?: boolean;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'تاریخ را انتخاب کنید',
  disabled = false,
  min = null,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [currentYear, setCurrentYear] = useState(() => moment().jYear());
  const [currentMonth, setCurrentMonth] = useState(() => moment().jMonth() + 1);

  useEffect(() => {
    if (value) {
      const m = moment(value);
      setDisplayValue(
        `${m.jYear()}/${String(m.jMonth() + 1).padStart(2, '0')}/${String(m.jDate()).padStart(2, '0')}`
      );
      setCurrentYear(m.jYear());
      setCurrentMonth(m.jMonth() + 1);
    } else {
      setDisplayValue('');
      const now = moment();
      setCurrentYear(now.jYear());
      setCurrentMonth(now.jMonth() + 1);
    }
  }, [value]);

  const getCalendarDays = (): DayInfo[] => {
    const monthLength = moment.jDaysInMonth(currentYear, currentMonth - 1);
    const firstDayOfMonth = moment(
      `${currentYear}/${currentMonth}/1`,
      'jYYYY/jM/jD'
    );
    const gregorianDayOfWeek = firstDayOfMonth.day();
    const firstDayOfWeek = (gregorianDayOfWeek + 1) % 7;

    const days: DayInfo[] = [];
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonthLength = moment.jDaysInMonth(prevYear, prevMonth - 1);

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLength - i;
      const persianDate = moment(
        `${prevYear}/${prevMonth}/${day}`,
        'jYYYY/jM/jD'
      );
      days.push({
        day,
        date: persianDate.toDate(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    const today = moment();
    for (let day = 1; day <= monthLength; day++) {
      const persianDate = moment(
        `${currentYear}/${currentMonth}/${day}`,
        'jYYYY/jM/jD'
      );
      const date = persianDate.toDate();
      let isDisabled = false;
      if (min) {
        const minDate = moment(min).startOf('day');
        isDisabled = moment(date).isBefore(minDate);
      }
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday:
          today.jYear() === currentYear &&
          today.jMonth() + 1 === currentMonth &&
          today.jDate() === day,
        isSelected:
          !!value &&
          moment(value).format('YYYY-MM-DD') ===
            moment(date).format('YYYY-MM-DD'),
        isDisabled,
      });
    }

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const persianDate = moment(
        `${nextYear}/${nextMonth}/${day}`,
        'jYYYY/jM/jD'
      );
      days.push({
        day,
        date: persianDate.toDate(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }
    return days;
  };

  const handleDateSelect = (dayInfo: DayInfo) => {
    if (dayInfo.isDisabled) return;
    const d = dayInfo.date;
    const gregorian =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const m = moment(d);
    setDisplayValue(
      `${m.jYear()}/${String(m.jMonth() + 1).padStart(2, '0')}/${String(m.jDate()).padStart(2, '0')}`
    );
    setIsOpen(false);
    onChange(gregorian);
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleToday = () => {
    const today = moment();
    setCurrentYear(today.jYear());
    setCurrentMonth(today.jMonth() + 1);
    const d = today.toDate();
    const gregorian =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDisplayValue(
      `${today.jYear()}/${String(today.jMonth() + 1).padStart(2, '0')}/${String(today.jDate()).padStart(2, '0')}`
    );
    setIsOpen(false);
    onChange(gregorian);
  };

  const handleClear = () => {
    setDisplayValue('');
    setIsOpen(false);
    onChange('');
  };

  const days = getCalendarDays();

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[
          styles.trigger,
          compact && styles.triggerCompact,
          disabled && styles.triggerDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            compact && styles.triggerTextCompact,
            !displayValue && styles.triggerPlaceholder,
          ]}
        >
          {displayValue ? toPersianNumber(displayValue) : placeholder}
        </Text>
        <Text style={styles.chevron}>{isOpen ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigateMonth(1)}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <View style={styles.monthYear}>
                <Text style={styles.monthText}>
                  {PERSIAN_MONTHS[currentMonth - 1]}
                </Text>
                <Text style={styles.yearText}>
                  {toPersianNumber(String(currentYear))}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigateMonth(-1)}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Week days */}
            <View style={styles.weekRow}>
              {PERSIAN_WEEK_DAYS.map((d, i) => (
                <Text key={i} style={styles.weekDay}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.daysGrid}>
              {days.map((dayInfo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDateSelect(dayInfo)}
                  disabled={dayInfo.isDisabled}
                  style={[
                    styles.dayCell,
                    dayInfo.isCurrentMonth && styles.dayCellCurrent,
                    dayInfo.isToday && styles.dayCellToday,
                    dayInfo.isSelected && styles.dayCellSelected,
                    dayInfo.isDisabled && styles.dayCellDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      dayInfo.isSelected && styles.dayTextSelected,
                      dayInfo.isToday && !dayInfo.isSelected && styles.dayTextToday,
                    ]}
                  >
                    {toPersianNumber(String(dayInfo.day))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleToday}
                style={styles.footerButtonToday}
              >
                <Text style={styles.footerButtonTodayText}>امروز</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClear}
                style={styles.footerButtonClear}
              >
                <Text style={styles.footerButtonClearText}>پاک کردن</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary + '4D',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerCompact: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  triggerTextCompact: {
    ...theme.typography.small,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
  },
  triggerPlaceholder: {
    color: theme.colors.textSecondary,
  },
  chevron: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  navButtonText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  monthYear: {
    alignItems: 'center',
  },
  monthText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  yearText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
  },
  weekDay: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: theme.spacing.sm,
    width: 308,
    alignSelf: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  dayCellCurrent: {},
  dayCellToday: {
    backgroundColor: theme.colors.primary + '33',
    borderRadius: theme.borderRadius.sm,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  dayCellDisabled: {
    opacity: 0.4,
  },
  dayText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  dayTextSelected: {
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  dayTextToday: {
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButtonToday: {
    flex: 1,
    backgroundColor: theme.colors.primary + '33',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  footerButtonTodayText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  footerButtonClear: {
    flex: 1,
    backgroundColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  footerButtonClearText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
});
