import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getCampaignByShareCode, getCampaigns, saveCampaigns } from '@/storage/campaignStorage';
import type { Campaign } from '@/models/campaign';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useThemeColor } from '@/hooks/use-theme-color';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinByCode'>;

export default function JoinByCodeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('Hata', 'Paylaşım kodu girin.');
      return;
    }

    setLoading(true);
    try {
      const campaign = await getCampaignByShareCode(trimmed);
      if (!campaign) {
        Alert.alert('Bulunamadı', 'Bu koda ait kampanya bulunamadı.');
        setLoading(false);
        return;
      }

      const campaigns = await getCampaigns();
      const exists = campaigns.some((c) => c.id === campaign.id);
      if (exists) {
        Alert.alert('Zaten var', 'Bu kampanya listenizde zaten mevcut.');
        setLoading(false);
        return;
      }

      campaigns.push(campaign);
      await saveCampaigns(campaigns);

      Alert.alert(
        'Katıldınız!',
        `"${campaign.title}" kampanyası listenize eklendi.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setCode('');
              navigation.navigate('Home');
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.label, { color: textColor }]}>
        Paylaşım kodunu girin
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: secondaryColor + '50',
          },
        ]}
        placeholder="Örn: ABC123"
        placeholderTextColor={secondaryColor}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />
      <TouchableOpacity
        style={[
          styles.joinBtn,
          { backgroundColor: tintColor },
          loading && styles.disabled,
        ]}
        onPress={handleJoin}
        disabled={loading}
      >
        <Text style={styles.joinBtnText}>
          {loading ? 'Kontrol ediliyor...' : 'Katıl'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 2,
  },
  joinBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
