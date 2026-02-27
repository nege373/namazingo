import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Contribution } from '@/models/campaign';

interface CountContributionRowProps {
  contribution: Contribution;
}

export function CountContributionRow({ contribution }: CountContributionRowProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');

  const dateStr = new Date(contribution.at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.row}>
      <Text style={[styles.name, { color: textColor }]}>{contribution.name}</Text>
      <View style={styles.right}>
        <Text style={[styles.count, { color: textColor }]}>
          +{contribution.count}
        </Text>
        <Text style={[styles.date, { color: secondaryColor }]}>{dateStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
  },
});
