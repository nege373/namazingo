import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { Card, IconButton, ProgressBar as PaperProgress } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

type Props = {
  label: string;
  subtitle?: string;
  progress: number; // 0-100
  checked: boolean;
  onToggle: () => void;
  onUndo?: () => void;
  onAddQadha?: () => void;
};

export const PrayerCard: React.FC<Props> = ({ label, subtitle, progress, checked, onToggle, onUndo, onAddQadha }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 });
  }, [checked]);

  const handleToggle = () => {
    // small tap animation + haptic
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
    Haptics.selectionAsync();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: checked ? 0.6 : 1 }}>
      <Card style={[styles.card, checked ? styles.cardChecked : null]} onPress={checked ? undefined : handleToggle}>
        <Card.Content style={styles.content}>
          <View style={styles.left}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🕋</Text>
            </View>
            <View style={styles.texts}>
              <Text style={styles.title}>{label}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
          <View style={styles.right}>
            <PaperProgress progress={Math.min(1, progress / 100)} color={progress >= 100 ? '#6FCF97' : '#CFEFE0'} style={{ width: 120 }} />
            {checked && onUndo ? (
              <IconButton icon="undo" size={20} onPress={onUndo} accessibilityLabel="Geri Al" />
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginVertical: 8,
    elevation: 2,
  },
  cardChecked: {
    backgroundColor: '#F6FFF7',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  texts: {},
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 6 },
});

