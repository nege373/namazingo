import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Campaign } from '@/models/campaign';

const STORAGE_KEY = '@hatimapp_campaigns';

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveCampaigns(campaigns: Campaign[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export async function addCampaign(campaign: Campaign): Promise<void> {
  const campaigns = await getCampaigns();
  campaigns.push(campaign);
  await saveCampaigns(campaigns);
}

export async function updateCampaign(
  id: string,
  updater: (c: Campaign) => Campaign
): Promise<void> {
  const campaigns = await getCampaigns();
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx >= 0) {
    campaigns[idx] = updater(campaigns[idx]);
    await saveCampaigns(campaigns);
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const campaigns = await getCampaigns();
  return campaigns.find((c) => c.id === id) ?? null;
}

export async function getCampaignByShareCode(
  shareCode: string
): Promise<Campaign | null> {
  const campaigns = await getCampaigns();
  return (
    campaigns.find((c) => c.shareCode.toUpperCase() === shareCode.toUpperCase()) ??
    null
  );
}
