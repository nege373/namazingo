import React from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import RootNavigator from '@/navigation/RootNavigator';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

function AppInner() {
  const { theme } = useTheme();
  const paperTheme = theme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return (
    <PaperProvider theme={paperTheme}>
      <AppProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
