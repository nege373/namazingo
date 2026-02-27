import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Slot } from '@/models/campaign';

interface SlotRowProps {
  slot: Slot;
  label: string;
  onTake?: () => void;
}

export function SlotRow({ slot, label, onTake }: SlotRowProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const isTaken = !!slot.takenByName;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {isTaken ? (
          <Text style={[styles.takenBy, { color: secondaryColor }]}>
            Taken by {slot.takenByName}
          </Text>
        ) : null}
      </View>
      {!isTaken && onTake ? (
        <TouchableOpacity
          style={[styles.takeBtn, { backgroundColor: tintColor }]}
          onPress={onTake}
        >
          <Text style={styles.takeBtnText}>Take</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  takenBy: {
    fontSize: 13,
    marginTop: 2,
  },
  takeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
