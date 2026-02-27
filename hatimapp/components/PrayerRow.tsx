import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export const PrayerRow: React.FC<Props> = ({ label, checked, onToggle }) => {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity style={[styles.check, checked ? styles.checked : styles.unchecked]} onPress={onToggle}>
        {checked ? <Text style={styles.checkText}>✓</Text> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  label: { fontSize: 16 },
  check: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#6FCF97' },
  unchecked: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  checkText: { color: '#fff', fontWeight: '700' },
});

