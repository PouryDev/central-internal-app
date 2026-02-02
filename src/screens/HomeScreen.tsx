import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';

interface HomeScreenProps {
  onNavigateToSessionCreate: () => void;
  onNavigateToCashierPanel: () => void;
  onNavigateToAdminPanel: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSessionCreate,
  onNavigateToCashierPanel,
  onNavigateToAdminPanel,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>کافه مافیا 🎲</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          title="ثبت سانس جدید"
          onPress={onNavigateToSessionCreate}
          style={styles.button}
        />
        <Button
          title="پنل صندوق‌دار"
          onPress={onNavigateToCashierPanel}
          style={styles.button}
        />
        <Button
          title="پنل مدیریت"
          onPress={onNavigateToAdminPanel}
          style={styles.button}
        />
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
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  buttonsContainer: {
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});

