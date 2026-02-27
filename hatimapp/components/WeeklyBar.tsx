import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  values: number[]; // 7 values 0-100
};

export const WeeklyBar: React.FC<Props> = ({ values }) => {
  return (
    <View style={styles.container}>
      {values.map((v, i) => (
        <View key={i} style={styles.colWrap}>
          <View style={[styles.bar, { height: `${Math.max(8, v / 100 * 100)}%`, backgroundColor: v >= 100 ? '#6FCF97' : '#CFEFE0' }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingHorizontal: 8, height: 48, alignItems: 'flex-end' as any },
  colWrap: { flex: 1, alignItems: 'center' as any },
  bar: { width: '60%', borderRadius: 4 },
});

