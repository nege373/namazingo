import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation: any = useNavigation();
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // navigate to the nested Dashboard inside Main tabs
      // replace the stack with Main and set initial nested screen to Dashboard
      navigation.replace('Main', { screen: 'Dashboard' });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, { opacity }]}>
        <Text style={styles.title}>Namaz Duolingo</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  box: { padding: 20, borderRadius: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#0a7ea4' },
});

