import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';

const actions = [
  { key: 'duaCount', label: 'Dua okudum', xp: 5 },
  { key: 'nafileCount', label: 'Nafile namaz kıldım', xp: 15 },
  { key: 'quranMinutes', label: 'Kur\'an okudum (dakika gir)', xp: 2 },
  { key: 'salawatCount', label: 'Salavat (adet gir)', xp: 0 },
];

export default function ActionsScreen() {
  const { performAction } = useApp();

  const onQuick = async (key: any) => {
    if (key === 'quranMinutes') {
      // for MVP add 5 minutes
      await performAction(new Date().toISOString().slice(0, 10), 'quranMinutes', 5);
      Alert.alert('+10 XP', 'Kur\'an için +10 XP eklendi');
    } else if (key === 'salawatCount') {
      await performAction(new Date().toISOString().slice(0, 10), 'salawatCount', 100);
      Alert.alert('+10 XP', '100 salavat eklendi');
    } else {
      await performAction(new Date().toISOString().slice(0, 10), key, 1);
      Alert.alert('+XP', 'Tebrikler!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ek İbadetler</Text>
      <View style={styles.grid}>
        {actions.map((a) => (
          <TouchableOpacity key={a.key} style={styles.card} onPress={() => onQuick(a.key)}>
            <Text style={styles.cardText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', padding: 16, borderRadius: 12, backgroundColor: '#FAFAFA', marginBottom: 12 },
  cardText: { fontSize: 16, fontWeight: '600' },
});

