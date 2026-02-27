import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressBarProps {
  taken: number;
  total: number;
  height?: number;
}

export function ProgressBar({ taken, total, height = 8 }: ProgressBarProps) {
  const backgroundColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const percent = total > 0 ? Math.min(100, (taken / total) * 100) : 0;

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: backgroundColor + '40' },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${percent}%`,
            height,
            backgroundColor: tintColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});
