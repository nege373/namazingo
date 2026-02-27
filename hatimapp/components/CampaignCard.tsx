import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProgressBar } from './ProgressBar';
import { CAMPAIGN_TYPE_CONFIG } from '@/models/campaign';
import type { Campaign, CampaignType } from '@/models/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
  style?: ViewStyle;
}

export function CampaignCard({ campaign, onPress, style }: CampaignCardProps) {
  const backgroundColor = useThemeColor(
    { light: '#f5f5f5', dark: '#252528' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');

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
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {campaign.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: secondaryColor + '30' }]}>
          <Text style={[styles.badgeText, { color: secondaryColor }]}>
            {config?.label ?? campaign.type}
          </Text>
        </View>
      </View>
      {campaign.intention ? (
        <Text
          style={[styles.intention, { color: secondaryColor }]}
          numberOfLines={1}
        >
          {campaign.intention}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={[styles.dueDate, { color: secondaryColor }]}>
          {dueDateStr}
        </Text>
        <Text style={[styles.progress, { color: textColor }]}>
          {taken} / {total}
        </Text>
      </View>
      <ProgressBar taken={taken} total={total} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  intention: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 13,
  },
  progress: {
    fontSize: 14,
    fontWeight: '600',
  },
});
