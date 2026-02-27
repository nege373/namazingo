import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '@/context/AppContext';
import { PrayerCard } from '@/components/PrayerCard';
import { EmptyState } from '@/components/EmptyState';
import { WeeklyBar } from '@/components/WeeklyBar';

const PRAYER_KEYS = [
  { key: 'fajr', label: 'Sabah (Fajr)' },
  { key: 'dhuhr', label: 'Öğle (Dhuhr)' },
  { key: 'asr', label: 'İkindi (Asr)' },
  { key: 'maghrib', label: 'Akşam (Maghrib)' },
  { key: 'isha', label: 'Yatsı (Isha)' },
] as const;

export default function DashboardScreen() {
  const { getDailyPercent, getLast7Percents, togglePrayer, getLast30Percents, dailyRecords, undoPrayer, addQadha } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const percent = getDailyPercent(today);
  const weekly = getLast7Percents();

  const rec = dailyRecords.find((r: any) => r.date === today);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.dateText}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
      <View style={styles.weeklyWrap}>
        <WeeklyBar values={weekly} />
      </View>
      <View style={styles.percentWrap}>
        <Text style={styles.percentText}>{percent}%</Text>
        <Text style={styles.softMessage}>{percent === 100 ? 'Bugün istikrarını korudun.' : 'Yolculuk devam ediyor.'}</Text>
      </View>

      <View style={styles.prayers}>
        {PRAYER_KEYS.map((p) => {
          const checked = rec ? Boolean(rec.prayers[p.key as any]) : false;
          const qadhaCount = rec ? (rec.qadha?.[p.key as any] ?? 0) : 0;
          return (
            <View key={p.key} style={{ marginBottom: 4 }}>
              <PrayerCard
                label={p.label}
                subtitle={qadhaCount > 0 ? `Kaza: ${qadhaCount}` : ''}
                progress={checked ? 100 : 0}
                checked={checked}
                onToggle={async () => {
                  if (!checked) {
                    await togglePrayer(today, p.key as any);
                  }
                }}
                onUndo={async () => {
                  await undoPrayer(today, p.key as any);
                }}
                onAddQadha={async () => {
                  await addQadha(today, p.key as any, 1);
                }}
              />
            </View>
          );
        })}
        {PRAYER_KEYS.length === 0 ? <EmptyState title="Bugün için vakit yok" subtitle="Yarın tekrar kontrol et" /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 120 },
  dateText: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  weeklyWrap: { marginBottom: 12 },
  percentWrap: { alignItems: 'center', marginVertical: 12 },
  percentText: { fontSize: 36, fontWeight: '800' },
  softMessage: { fontSize: 14, color: '#666', marginTop: 6 },
  prayers: { marginTop: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FAFAFA' },
});

