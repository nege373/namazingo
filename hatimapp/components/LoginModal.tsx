import React, { useState, useEffect } from 'react';
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
import { UserProfile, getUser, saveUser } from '@/storage/userStorage';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function LoginModal({ visible, onClose }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) {
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setCountry(u.country ?? '');
      }
    })();
  }, [visible]);

  const handleSave = async () => {
    const user: UserProfile = { firstName: firstName.trim(), lastName: lastName.trim(), country: country.trim() || undefined };
    await saveUser(user);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Profil Bilgileri</Text>
            <TextInput placeholder="İsim" value={firstName} onChangeText={setFirstName} style={styles.input} />
            <TextInput placeholder="Soyisim" value={lastName} onChangeText={setLastName} style={styles.input} />
            <TextInput placeholder="Ülke (örn: Türkiye veya 🇹🇷)" value={country} onChangeText={setCountry} style={styles.input} />
            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
                <Text style={styles.saveText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 420 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  save: { backgroundColor: '#0a7ea4' },
  saveText: { color: '#fff', fontWeight: '700' },
  cancel: { borderWidth: 1, borderColor: '#ccc', marginLeft: 8 },
  cancelText: { color: '#333', fontWeight: '700' },
});

