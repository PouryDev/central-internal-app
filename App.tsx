import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  BackHandler,
} from 'react-native';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts, ToastPosition } from '@backpackapp-io/react-native-toast';
import { Easing } from 'react-native-reanimated';
import { loadFonts } from './src/utils/fonts';
import { DataProvider, useData } from './src/context/DataContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionCreateScreen } from './src/screens/SessionCreateScreen';
import { CashierPanelScreen } from './src/screens/CashierPanelScreen';
import { SessionDetailsScreen } from './src/screens/SessionDetailsScreen';
import { SessionEditScreen } from './src/screens/SessionEditScreen';
import { AdminPanelScreen } from './src/screens/AdminPanelScreen';
import { theme } from './src/constants/theme';
import { toast } from './src/utils/toast';
import type { Session } from './src/types';

type Screen =
  | 'home'
  | 'session-create'
  | 'cashier-panel'
  | 'session-details'
  | 'session-edit'
  | 'admin-panel';

function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [refreshSessionDetailsKey, setRefreshSessionDetailsKey] = useState(0);
  const { addSession, updateSessionStatus } = useData();

  useEffect(() => {
    // Enable RTL
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);

    // RTL for web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'fa';
      // Remove outline from all inputs on focus
      const style = document.createElement('style');
      style.textContent = 'input, textarea:focus { outline: none !important; }';
      document.head.appendChild(style);
    }

    // Load fonts
    loadFonts()
      .then(() => setFontsLoaded(true))
      .catch((err) => {
        console.error('Error loading fonts:', err);
        setFontsLoaded(true); // Continue even if fonts fail
      });
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('home');
    setSelectedSessionId('');
  }, []);

  const handleBackFromSessionDetails = useCallback(() => {
    setCurrentScreen('cashier-panel');
    setSelectedSessionId('');
  }, []);

  // Android hardware back button: navigate back or prevent exit
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (currentScreen === 'session-edit') {
        handleBackFromSessionEdit();
        return true;
      }
      if (currentScreen === 'session-details') {
        handleBackFromSessionDetails();
        return true;
      }
      if (currentScreen !== 'home') {
        handleBack();
        return true; // Handled - don't exit app
      }
      // On home screen: prevent exit
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentScreen, handleBack, handleBackFromSessionDetails, handleBackFromSessionEdit]);

  const handleNavigateToSessionCreate = () => {
    setCurrentScreen('session-create');
  };

  const handleNavigateToCashierPanel = () => {
    setCurrentScreen('cashier-panel');
  };

  const handleNavigateToAdminPanel = () => {
    setCurrentScreen('admin-panel');
  };

  const handleSessionPress = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentScreen('session-details');
  };

  const handleEditSession = useCallback(() => {
    setCurrentScreen('session-edit');
  }, []);

  const handleBackFromSessionEdit = useCallback(() => {
    setCurrentScreen('session-details');
  }, []);

  const handleSavedFromSessionEdit = useCallback(() => {
    setRefreshSessionDetailsKey((k) => k + 1);
    setCurrentScreen('session-details');
  }, []);

  const handleSubmitSession = async (session: Session) => {
    await addSession(session);
    toast.success('سانس با موفقیت ثبت شد.');
    handleBack();
  };

  const handleMarkAsPaid = async () => {
    await updateSessionStatus(selectedSessionId, 'paid');
    toast.success('تسویه با موفقیت انجام شد.');
    handleBackFromSessionDetails();
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
          key={refreshSessionDetailsKey}
          sessionId={selectedSessionId}
          onBack={handleBackFromSessionDetails}
          onMarkAsPaid={handleMarkAsPaid}
          onEditSession={handleEditSession}
        />
      )}
      {currentScreen === 'session-edit' && (
        <SessionEditScreen
          sessionId={selectedSessionId}
          onBack={handleBackFromSessionEdit}
          onSaved={handleSavedFromSessionEdit}
        />
      )}
      {currentScreen === 'admin-panel' && (
        <AdminPanelScreen onBack={handleBack} />
      )}
    </View>
  );
}

const toastStyle = {
  pressable: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  view: {
    flexDirection: 'row' as const,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  text: {
    fontFamily: 'Vazirmatn-Regular',
    color: theme.colors.text,
    ...theme.typography.body,
  },
  indicator: {
    backgroundColor: theme.colors.success,
  },
};

function ToastPortal() {
  return (
    <Toasts
      overrideDarkMode={true}
      defaultPosition={ToastPosition.TOP}
      defaultDuration={3500}
      globalAnimationType="spring"
      globalAnimationConfig={{ duration: 280, easing: Easing.out(Easing.cubic) }}
      defaultStyle={toastStyle}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DataProvider>
          <AppContent />
          <ToastPortal />
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    writingDirection: 'rtl',
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

