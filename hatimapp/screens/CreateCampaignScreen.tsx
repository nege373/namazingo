import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';

import { addCampaign } from '@/storage/campaignStorage';
import { CAMPAIGN_TYPE_CONFIG } from '@/models/campaign';
import type { Campaign, CampaignType } from '@/models/campaign';
import { useThemeColor } from '@/hooks/use-theme-color';

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function CreateCampaignScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CampaignType>('QURAN');
  const [intention, setIntention] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [targetCount, setTargetCount] = useState('100');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [createdShareCode, setCreatedShareCode] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const config = CAMPAIGN_TYPE_CONFIG[type];
  const isSlotBased = config?.isSlotBased ?? false;

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Hata', 'Başlık girin.');
      return;
    }

    const shareCode = generateShareCode();
    const id = generateId();
    const now = new Date().toISOString();

    const shareLink = `hatimapp://join?code=${shareCode}`;
    const campaign: Campaign = {
      id,
      title: trimmedTitle,
      type,
      intention: intention.trim() || undefined,
      dueDate: dueDate.toISOString(),
      shareCode,
      shareLink,
      createdAt: now,
    };

    if (isSlotBased && config.slotTotal) {
      campaign.slotTotal = config.slotTotal;
      campaign.slots = Array.from({ length: config.slotTotal }, (_, i) => ({
        index: i + 1,
        takenByName: '',
        takenAt: '',
      }));
    } else {
      const count = parseInt(targetCount, 10);
      if (isNaN(count) || count < 1) {
        Alert.alert('Hata', 'Geçerli bir hedef adet girin.');
        return;
      }
      campaign.targetCount = count;
      campaign.currentCount = 0;
      campaign.contributions = [];
    }

    await addCampaign(campaign);
    setCreatedShareCode(shareCode);
  };

  const handleCopyCode = async () => {
    if (createdShareCode) {
      await Clipboard.setStringAsync(createdShareCode);
      Alert.alert('Kopyalandı', 'Paylaşım kodu panoya kopyalandı.');
    }
  };

  const handleDone = () => {
    setCreatedShareCode(null);
    navigation.goBack();
  };

  if (createdShareCode) {
    return (
      <View style={styles.container}>
        <View style={[styles.successCard, { backgroundColor: tintColor + '20' }]}>
          <Text style={[styles.successTitle, { color: textColor }]}>
            Kampanya oluşturuldu!
          </Text>
          <Text style={[styles.shareLabel, { color: secondaryColor }]}>
            Paylaşım kodu:
          </Text>
          <Text style={[styles.shareCode, { color: tintColor }]}>
            {createdShareCode}
          </Text>
          <TouchableOpacity style={[styles.copyBtn, { backgroundColor: tintColor }]} onPress={handleCopyCode}>
            <Text style={styles.copyBtnText}>Kodu Kopyala</Text>
          </TouchableOpacity>
          {/** show link copy if available */ }
          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: tintColor }]}
            onPress={() => {
              const link = `hatimapp://join?code=${createdShareCode}`;
              Clipboard.setStringAsync(link);
              Alert.alert('Kopyalandı', 'Paylaşım linki panoya kopyalandı.');
            }}
          >
            <Text style={styles.copyBtnText}>Linki Kopyala</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, { borderColor: tintColor }]}
            onPress={handleDone}
          >
            <Text style={[styles.doneBtnText, { color: tintColor }]}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: textColor }]}>Başlık *</Text>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: secondaryColor + '50' }]}
        placeholder="Kampanya başlığı"
        placeholderTextColor={secondaryColor}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: textColor }]}>Tür</Text>
      <View style={styles.typeRow}>
        {(['QURAN', 'YASIN', 'FATIHA', 'SALAVAT'] as CampaignType[]).map(
          (t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeBtn,
                type === t && { backgroundColor: tintColor },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: type === t ? '#fff' : textColor },
                ]}
              >
                {CAMPAIGN_TYPE_CONFIG[t].label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {!isSlotBased && (
        <>
          <Text style={[styles.label, { color: textColor }]}>Hedef adet</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: secondaryColor + '50' }]}
            placeholder="100"
            placeholderTextColor={secondaryColor}
            value={targetCount}
            onChangeText={setTargetCount}
            keyboardType="number-pad"
          />
        </>
      )}

      <Text style={[styles.label, { color: textColor }]}>Niyet (opsiyonel)</Text>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: secondaryColor + '50' }]}
        placeholder="Örn: Dedemin ruhuna"
        placeholderTextColor={secondaryColor}
        value={intention}
        onChangeText={setIntention}
      />

      <Text style={[styles.label, { color: textColor }]}>Bitiş tarihi</Text>
      <TouchableOpacity
        style={[styles.dateBtn, { borderColor: secondaryColor + '50' }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: textColor }}>
          {dueDate.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setDueDate(date);
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: tintColor }]}
        onPress={handleCreate}
      >
        <Text style={styles.createBtnText}>Oluştur</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  successCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  shareLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  shareCode: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 24,
  },
  copyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
