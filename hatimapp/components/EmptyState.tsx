import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmptyState: React.FC<{ title?: string; subtitle?: string }> = ({ title = 'Henüz kayıt yok', subtitle = 'Bugün bir şey ekle' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666' },
});

