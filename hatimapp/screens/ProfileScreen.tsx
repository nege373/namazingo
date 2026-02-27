import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import { getUser } from '@/storage/userStorage';

export default function ProfileScreen() {
  const { totalCompleted, dailyRecords } = useApp() as any;
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) setUserName(`${u.firstName} ${u.lastName}`);
    })();
  }, []);

  const daysWithFull = (dailyRecords || []).filter((r: any) => Object.values(r.prayers).every(Boolean)).length;

  const level =
    daysWithFull >= 90 ? 'İstikamet' : daysWithFull >= 30 ? 'Devamlılık' : daysWithFull >= 7 ? 'İstikrar Başladı' : 'Başlangıç';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kullanıcı</Text>
        <Text style={styles.big}>{userName ?? 'Misafir'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Toplam Tamamlanan Vakit</Text>
        <Text style={styles.big}>{totalCompleted}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seviye</Text>
        <Text style={styles.big}>{level}</Text>
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
  big: { fontSize: 22, fontWeight: '800', marginTop: 8 },
});

