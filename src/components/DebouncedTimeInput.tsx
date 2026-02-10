import React, { useState, useEffect, useRef } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

const DEBOUNCE_MS = 300;

interface DebouncedTimeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Called on every keystroke - use for ref storage when submitting before debounce fires */
  onValueRef?: (text: string) => void;
  placeholder?: string;
  style?: object;
}

/**
 * Time input that debounces parent updates to avoid re-renders on every keystroke.
 * Uses local state for immediate display, syncs to parent after debounce delay.
 * Use onValueRef to keep a ref updated for form submission.
 */
export const DebouncedTimeInput: React.FC<DebouncedTimeInputProps> = ({
  value,
  onChangeText,
  onValueRef,
  placeholder = '۲۰:۰۰',
  style,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onValueRef?.(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChangeText(text);
      timeoutRef.current = null;
    }, DEBOUNCE_MS);
  };

  const handleBlur = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      onChangeText(localValue);
      timeoutRef.current = null;
    }
  };

  return (
    <TextInput
      style={[styles.input, style]}
      value={localValue}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.inputOutline,
  },
});
