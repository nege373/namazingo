import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApp } from '@/context/AppContext';

export default function LeaderboardScreen() {
  const { leaderboardDemo } = useApp();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard (Demo)</Text>
      <FlatList
        data={leaderboardDemo}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.pos}>{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.xp}>{item.xp} XP</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: '#FAFAFA', paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 },
  pos: { width: 24, fontWeight: '700' },
  name: { flex: 1, marginLeft: 8, fontWeight: '600' },
  xp: { fontWeight: '700' },
});

