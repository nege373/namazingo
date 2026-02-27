import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';

import DashboardScreen from '@/screens/DashboardScreen';
import StatsScreen from '@/screens/StatsScreen';
import ProfileScreen from '@/screens/ProfileScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Günlük Namaz' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'İstatistikler' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      </Stack.Navigator>
    </ThemeProvider>
  );
}
