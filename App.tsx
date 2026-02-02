import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { I18nManager } from 'react-native';
import { loadFonts } from './src/utils/fonts.native';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionCreateScreen } from './src/screens/SessionCreateScreen';
import { CashierPanelScreen } from './src/screens/CashierPanelScreen';
import { SessionDetailsScreen } from './src/screens/SessionDetailsScreen';
import { AdminPanelScreen } from './src/screens/AdminPanelScreen';
import { theme } from './src/constants/theme';

type Screen =
  | 'home'
  | 'session-create'
  | 'cashier-panel'
  | 'session-details'
  | 'admin-panel';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    // Enable RTL
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);

    // Load fonts
    loadFonts()
      .then(() => setFontsLoaded(true))
      .catch((err) => {
        console.error('Error loading fonts:', err);
        setFontsLoaded(true); // Continue even if fonts fail
      });
  }, []);

  const handleNavigateToSessionCreate = () => {
    setCurrentScreen('session-create');
  };

  const handleNavigateToCashierPanel = () => {
    setCurrentScreen('cashier-panel');
  };

  const handleNavigateToAdminPanel = () => {
    setCurrentScreen('admin-panel');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedSessionId('');
  };

  const handleSessionPress = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentScreen('session-details');
  };

  const handleSubmitSession = () => {
    // Placeholder function
    console.log('Session submitted');
    handleBack();
  };

  const handleMarkAsPaid = () => {
    // Placeholder function
    console.log('Marked as paid');
    handleBack();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToSessionCreate={handleNavigateToSessionCreate}
          onNavigateToCashierPanel={handleNavigateToCashierPanel}
          onNavigateToAdminPanel={handleNavigateToAdminPanel}
        />
      )}
      {currentScreen === 'session-create' && (
        <SessionCreateScreen
          onBack={handleBack}
          onSubmitSession={handleSubmitSession}
        />
      )}
      {currentScreen === 'cashier-panel' && (
        <CashierPanelScreen
          onBack={handleBack}
          onSessionPress={handleSessionPress}
        />
      )}
      {currentScreen === 'session-details' && (
        <SessionDetailsScreen
          sessionId={selectedSessionId}
          onBack={handleBack}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
      {currentScreen === 'admin-panel' && (
        <AdminPanelScreen onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    marginTop: theme.spacing.md,
  },
});

