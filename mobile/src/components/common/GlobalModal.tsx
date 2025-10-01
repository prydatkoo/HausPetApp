import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { hideModal } from '../../store/slices/uiSlice';

const GlobalModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);

  if (!modal) {
    return null;
  }

  const handleClose = () => {
    dispatch(hideModal());
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    handleClose();
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{modal.title}</Text>
          {modal.message && <Text style={styles.message}>{modal.message}</Text>}
          <View style={styles.buttonContainer}>
            {modal.type === 'confirm' && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>{modal.cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>{modal.confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GlobalModal;
