import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface NamePromptModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function NamePromptModal({
  visible,
  title,
  placeholder = 'Adınız',
  onConfirm,
  onCancel,
}: NamePromptModalProps) {
  const [name, setName] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'icon');

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onConfirm(trimmed);
      setName('');
    }
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={[styles.content, { backgroundColor }]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: secondaryColor + '50',
                },
              ]}
              placeholder={placeholder}
              placeholderTextColor={secondaryColor}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
            />
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: secondaryColor }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelBtnText, { color: secondaryColor }]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.confirmBtn, { backgroundColor: tintColor }]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmBtnText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {},
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
