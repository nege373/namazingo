import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';

export default function StatsScreen() {
  const { getLast7Percents, getLast30Percents, dailyRecords } = useApp() as any;

  const last7 = getLast7Percents();
  const avg7 = Math.round((last7.reduce((s: number, v: number) => s + v, 0) / last7.length) || 0);
  const last30 = getLast30Percents();
  const avg30 = Math.round((last30.reduce((s: number, v: number) => s + v, 0) / last30.length) || 0);

  // compute most regular and hardest prayer
  const counts: Record<string, { done: number; total: number }> = {};
  (dailyRecords || []).forEach((r: any) => {
    Object.entries(r.prayers).forEach(([k, v]: any) => {
      counts[k] = counts[k] || { done: 0, total: 0 };
      counts[k].total += 1;
      if (v) counts[k].done += 1;
    });
  });
  const rates = Object.entries(counts).map(([k, v]) => ({ key: k, rate: v.total ? v.done / v.total : 0 }));
  rates.sort((a, b) => b.rate - a.rate);
  const best = rates[0]?.key ?? '-';
  const worst = rates[rates.length - 1]?.key ?? '-';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>İstatistikler</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Haftalık Ortalama</Text>
        <Text style={styles.big}>{avg7}%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son 30 gün ortalama</Text>
        <Text style={styles.big}>{avg30}%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>En düzenli vakit</Text>
        <Text style={styles.big}>{best}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>En zor vakit</Text>
        <Text style={styles.big}>{worst}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#FAFAFA', marginBottom: 12 },
  cardTitle: { color: '#666' },
  big: { fontSize: 28, fontWeight: '800', marginTop: 8 },
});

