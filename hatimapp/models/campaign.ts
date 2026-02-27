/**
 * Campaign data model - Firebase'e kolay geçiş için düz yapı
 */

export type CampaignType = 'QURAN' | 'YASIN' | 'FATIHA' | 'SALAVAT';

export interface Slot {
  index: number;
  takenByName: string;
  takenAt: string; // ISO date string
}

export interface Contribution {
  name: string;
  count: number;
  at: string; // ISO date string
}

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  intention?: string;
  dueDate: string; // ISO date string
  shareCode: string;
  shareLink?: string;
  createdAt: string; // ISO date string

  // Slot-based (QURAN, YASIN)
  slotTotal?: number;
  slots?: Slot[];

  // Count-based (FATIHA, SALAVAT)
  targetCount?: number;
  currentCount?: number;
  contributions?: Contribution[];
}

export const CAMPAIGN_TYPE_CONFIG: Record<
  CampaignType,
  { label: string; slotTotal?: number; isSlotBased: boolean }
> = {
  QURAN: { label: 'Kuran Hatmi', slotTotal: 30, isSlotBased: true },
  YASIN: { label: 'Yasin Hatmi', slotTotal: 41, isSlotBased: true },
  FATIHA: { label: 'Fatiha', slotTotal: undefined, isSlotBased: false },
  SALAVAT: { label: 'Salavat', slotTotal: undefined, isSlotBased: false },
};
