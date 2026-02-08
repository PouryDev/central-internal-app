import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { useData } from '../context/DataContext';

export const FacilitatorsScreen: React.FC = () => {
  const { facilitators, addFacilitator } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  const onAddFacilitator = () => {
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('خطا', 'نام گرداننده را وارد کنید.');
      return;
    }
    await addFacilitator({
      id: Date.now().toString(),
      name: trimmed,
    });
    setName('');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button
          title="+ افزودن گرداننده"
          onPress={onAddFacilitator}
          style={styles.addButton}
        />
      </View>

      <View style={styles.list}>
        {facilitators.map((facilitator) => (
          <Card key={facilitator.id} style={styles.facilitatorCard}>
            <Text style={styles.facilitatorName}>{facilitator.name}</Text>
          </Card>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>افزودن گرداننده</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="نام گرداننده"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="لغو"
                onPress={() => {
                  setName('');
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              />
              <Button title="ذخیره" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  addButton: {
    width: '100%',
  },
  list: {
    gap: theme.spacing.md,
  },
  facilitatorCard: {
    padding: theme.spacing.lg,
  },
  facilitatorName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Bold',
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Vazirmatn-Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.textSecondary,
  },
});

