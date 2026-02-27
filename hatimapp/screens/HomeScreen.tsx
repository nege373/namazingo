import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CampaignCard } from '@/components/CampaignCard';
import { getCampaigns, saveCampaigns } from '@/storage/campaignStorage';
import type { Campaign } from '@/models/campaign';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LoginModal } from '@/components/LoginModal';
import { getUser } from '@/storage/userStorage';

// Dummy data - ilk yüklemede kullanılır, sonra AsyncStorage'dan gelir
const DUMMY_CAMPAIGNS: Campaign[] = [
  {
    id: 'dummy-1',
    title: 'Dedem için Kuran Hatmi',
    type: 'QURAN',
    intention: 'Dedemin ruhuna',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    shareCode: 'ABC123',
    createdAt: new Date().toISOString(),
    slotTotal: 30,
    slots: Array.from({ length: 30 }, (_, i) => ({
      index: i + 1,
      takenByName: i < 5 ? `Kişi ${i + 1}` : '',
      takenAt: i < 5 ? new Date().toISOString() : '',
    })),
  },
  {
    id: 'dummy-2',
    title: 'Fatiha Kampanyası',
    type: 'FATIHA',
    intention: 'Hayırlı işler',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    shareCode: 'XYZ789',
    createdAt: new Date().toISOString(),
    targetCount: 100,
    currentCount: 23,
    contributions: [
      { name: 'Ahmet', count: 10, at: new Date().toISOString() },
      { name: 'Ayşe', count: 13, at: new Date().toISOString() },
    ],
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    const data = await getCampaigns();
    if (data.length > 0) {
      setCampaigns(data);
    } else if (!initialized) {
      await saveCampaigns(DUMMY_CAMPAIGNS);
      setCampaigns(DUMMY_CAMPAIGNS);
      setInitialized(true);
    }
  }, [initialized]);

  React.useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) {
        setLoginVisible(true);
      } else {
        setUserName(`${u.firstName} ${u.lastName}`);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCampaigns();
    }, [loadCampaigns])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  }, [loadCampaigns]);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: tintColor }]}
          onPress={() => navigation.navigate('CreateCampaign')}
        >
          <Text style={styles.createBtnText}>+ Kampanya Oluştur</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' }]}
          onPress={() => setLoginVisible(true)}
        >
          <Text style={[styles.joinBtnText, { color: tintColor }]}>
            {userName ?? 'Profil'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: textColor }]}>
        Aktif Kampanyalar
      </Text>

      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() =>
              navigation.navigate('CampaignDetail', { campaignId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Henüz kampanya yok. Bir kampanya oluşturun veya koda katılın.
            </Text>
          </View>
        }
      />
    <TouchableOpacity
      style={[styles.startBtn, { backgroundColor: '#fff' }]}
      onPress={() => navigation.navigate('CreateCampaign')}
    >
      <Text style={styles.startBtnText}>+ Hatim Başlat</Text>
    </TouchableOpacity>
    <LoginModal visible={loginVisible} onClose={() => setLoginVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  joinBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  startBtn: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
