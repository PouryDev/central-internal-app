import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Button } from './Button';
import { theme } from '../constants/theme';
import { toast } from '../utils/toast';
import { useData, type ExportDataOptions } from '../context/DataContext';
import { useResponsive } from '../utils/responsive';

const EXPORT_IMPORT_PASSWORD = '56332154';
const MODAL_MAX_WIDTH = 480;
const DEFAULT_EXPORT_OPTIONS: Required<ExportDataOptions> = {
  includeSessions: true,
  includeMenu: true,
  includeFacilitators: true,
  includeHalls: true,
};
const EXPORT_OPTION_ITEMS: Array<{
  key: keyof typeof DEFAULT_EXPORT_OPTIONS;
  faLabel: string;
  enLabel: string;
}> = [
  { key: 'includeSessions', faLabel: 'سانس', enLabel: 'Sessions' },
  {
    key: 'includeMenu',
    faLabel: 'منو (آیتم‌ها و دسته‌ها)',
    enLabel: 'Menu (Items and categories)',
  },
  { key: 'includeFacilitators', faLabel: 'گرداننده', enLabel: 'Game Masters' },
  { key: 'includeHalls', faLabel: 'سالن', enLabel: 'Halls' },
];

interface ExportImportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  visible,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const { isTablet } = useResponsive();
  const sheetHeight = Math.min(height * 0.85, 500);
  const sheetWidth = isTablet ? Math.min(width * 0.9, MODAL_MAX_WIDTH) : width;

  const { exportData, importData } = useData();
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [exportImportText, setExportImportText] = useState('');
  const [exportOptions, setExportOptions] = useState(DEFAULT_EXPORT_OPTIONS);

  useEffect(() => {
    if (visible) {
      setPassword('');
      setUnlocked(false);
      setExportImportText('');
      setExportOptions(DEFAULT_EXPORT_OPTIONS);
    }
  }, [visible]);

  const handleUnlock = useCallback(() => {
    if (password === EXPORT_IMPORT_PASSWORD) {
      setUnlocked(true);
    } else {
      toast.error('رمز اشتباه است.');
    }
  }, [password]);

  const handleExport = useCallback(async () => {
    const data = await exportData(exportOptions);
    setExportImportText(data);
  }, [exportData, exportOptions]);

  const handleImport = useCallback(async () => {
    const ok = await importData(exportImportText);
    if (ok) {
      toast.success('داده‌ها با موفقیت وارد شدند.');
      onClose();
    } else {
      toast.error('فرمت JSON نامعتبر است.');
    }
  }, [importData, exportImportText, onClose]);

  const handleBack = useCallback(() => {
    setUnlocked(false);
    setPassword('');
    setExportImportText('');
    setExportOptions(DEFAULT_EXPORT_OPTIONS);
  }, []);

  const toggleExportOption = useCallback((key: keyof typeof DEFAULT_EXPORT_OPTIONS) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

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
              height: isTablet ? Math.min(height * 0.9, 500) : sheetHeight,
            },
            isTablet && styles.sheetTablet,
          ]}
        >
          <View style={styles.handle} />

          {!unlocked ? (
            <>
              <Text style={styles.title}>ورود رمز</Text>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="رمز را وارد کنید"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.buttons}>
                <Button title="لغو" onPress={onClose} variant="secondary" />
                <Button title="تأیید" onPress={handleUnlock} />
              </View>
            </>
          ) : (
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>خروجی / ورودی داده</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>بازگشت</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.optionsCard}>
                <Text style={styles.optionsTitle}>داده‌های خروجی</Text>
                {EXPORT_OPTION_ITEMS.map((option) => {
                  const checked = exportOptions[option.key];
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={styles.optionRow}
                      onPress={() => toggleExportOption(option.key)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.optionLabelWrap}>
                        <Text style={styles.optionFaLabel}>{option.faLabel}</Text>
                        <Text style={styles.optionEnLabel}>{option.enLabel}</Text>
                      </View>
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked ? <View style={styles.checkboxInner} /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput
                style={styles.textArea}
                value={exportImportText}
                onChangeText={setExportImportText}
                placeholder="JSON داده‌ها..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={8}
              />
              <View style={styles.buttons}>
                <Button
                  title="Export"
                  onPress={handleExport}
                  variant="secondary"
                  style={styles.flexBtn}
                />
                <Button
                  title="Import"
                  onPress={handleImport}
                  style={styles.flexBtn}
                />
              </View>
            </ScrollView>
          )}
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl + 24,
  },
  sheetTablet: {
    borderRadius: theme.borderRadius.xl,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.md,
  },
  passwordInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.inputOutline,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  backBtnText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: 'Vazirmatn-Bold',
  },
  optionsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  optionsTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '66',
  },
  optionLabelWrap: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  optionFaLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  optionEnLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'Vazirmatn-Regular',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  checkboxChecked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: theme.colors.text,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
    ...theme.inputOutline,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
});
