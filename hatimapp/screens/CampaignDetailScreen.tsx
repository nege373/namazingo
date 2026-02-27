import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { ProgressBar } from '@/components/ProgressBar';
import { SlotRow } from '@/components/SlotRow';
import { CountContributionRow } from '@/components/CountContributionRow';
import { NamePromptModal } from '@/components/NamePromptModal';
import { CountAddModal } from '@/components/CountAddModal';

import {
  getCampaignById,
  updateCampaign,
} from '@/storage/campaignStorage';
import { CAMPAIGN_TYPE_CONFIG } from '@/models/campaign';
import type { Campaign, CampaignType, Slot } from '@/models/campaign';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useThemeColor } from '@/hooks/use-theme-color';

type Route = RouteProp<RootStackParamList, 'CampaignDetail'>;

export default function CampaignDetailScreen() {
  const route = useRoute<Route>();
  const { campaignId } = route.params;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);

  const loadCampaign = useCallback(async () => {
    const c = await getCampaignById(campaignId);
    setCampaign(c);
  }, [campaignId]);

  useFocusEffect(
    useCallback(() => {
      loadCampaign();
    }, [loadCampaign])
  );

  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  if (!campaign) {
    return (
      <View style={styles.center}>
        <Text style={{ color: textColor }}>Yükleniyor...</Text>
      </View>
    );
  }

  const config = CAMPAIGN_TYPE_CONFIG[campaign.type as CampaignType];
  const isSlotBased = config?.isSlotBased ?? false;

  const taken = isSlotBased
    ? (campaign.slots?.filter((s) => s.takenByName).length ?? 0)
    : (campaign.currentCount ?? 0);
  const total = isSlotBased
    ? (campaign.slotTotal ?? 0)
    : (campaign.targetCount ?? 0);

  const dueDateStr = campaign.dueDate
    ? new Date(campaign.dueDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleTakeSlot = (index: number) => {
    setPendingSlotIndex(index);
    setNameModalVisible(true);
  };

  const handleNameConfirm = async (name: string) => {
    if (pendingSlotIndex === null || !campaign.slots) return;

    const updatedSlots = campaign.slots.map((s) =>
      s.index === pendingSlotIndex
        ? {
            ...s,
            takenByName: name,
            takenAt: new Date().toISOString(),
          }
        : s
    );

    await updateCampaign(campaignId, (c) => ({
      ...c,
      slots: updatedSlots,
    }));
    setCampaign({ ...campaign, slots: updatedSlots });
    setNameModalVisible(false);
    setPendingSlotIndex(null);
  };

  const handleAddCount = async (name: string, count: number) => {
    const newContributions = [
      ...(campaign.contributions ?? []),
      { name, count, at: new Date().toISOString() },
    ];
    const newCurrentCount = (campaign.currentCount ?? 0) + count;

    await updateCampaign(campaignId, (c) => ({
      ...c,
      contributions: newContributions,
      currentCount: newCurrentCount,
    }));
    setCampaign({
      ...campaign,
      contributions: newContributions,
      currentCount: newCurrentCount,
    });
    setCountModalVisible(false);
  };

  const slots = campaign.slots ?? [];
  const slotLabel = (index: number) =>
    campaign.type === 'QURAN' ? `Cüz ${index}` : `Sayfa ${index}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{campaign.title}</Text>
        <View style={[styles.badge, { backgroundColor: secondaryColor + '30' }]}>
          <Text style={[styles.badgeText, { color: secondaryColor }]}>
            {config?.label ?? campaign.type}
          </Text>
        </View>
      </View>

      {campaign.intention ? (
        <Text style={[styles.intention, { color: secondaryColor }]}>
          {campaign.intention}
        </Text>
      ) : null}

      <Text style={[styles.dueDate, { color: secondaryColor }]}>
        Bitiş: {dueDateStr}
      </Text>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: textColor }]}>
            İlerleme
          </Text>
          <Text style={[styles.progressText, { color: textColor }]}>
            {taken} / {total}
          </Text>
        </View>
        <ProgressBar taken={taken} total={total} height={10} />
      </View>

      {isSlotBased ? (
        <View style={styles.slotsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Slotlar
          </Text>
          {slots.map((slot: Slot) => (
            <SlotRow
              key={slot.index}
              slot={slot}
              label={slotLabel(slot.index)}
              onTake={!slot.takenByName ? () => handleTakeSlot(slot.index) : undefined}
            />
          ))}
        </View>
      ) : (
        <View style={styles.countSection}>
          <View style={styles.countHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Katkılar
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: tintColor }]}
              onPress={() => setCountModalVisible(true)}
            >
              <Text style={styles.addBtnText}>+ Adet Ekle</Text>
            </TouchableOpacity>
          </View>
          {(campaign.contributions ?? []).map((c, i) => (
            <CountContributionRow key={i} contribution={c} />
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: tintColor }]}
        onPress={() => {
          const link = campaign.shareLink ?? `hatimapp://join?code=${campaign.shareCode}`;
          // copy link
          // using expo-clipboard directly
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Clipboard = require('expo-clipboard');
          Clipboard.setStringAsync(link);
          Alert.alert('Kopyalandı', 'Paylaşım linki panoya kopyalandı.');
        }}
      >
        <Text style={styles.shareBtnText}>Hatimi Paylaş</Text>
      </TouchableOpacity>

      <NamePromptModal
        visible={nameModalVisible}
        title="Slot almak için adınızı girin"
        placeholder="Adınız"
        onConfirm={handleNameConfirm}
        onCancel={() => {
          setNameModalVisible(false);
          setPendingSlotIndex(null);
        }}
      />

      <CountAddModal
        visible={countModalVisible}
        title="Kaç adet ekleyeceksiniz?"
        onConfirm={handleAddCount}
        onCancel={() => setCountModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  intention: {
    fontSize: 16,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotsSection: {
    marginBottom: 24,
  },
  countSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  countHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
