import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, hideAlert } from '@/store';

export const AlertModal = () => {
  const alert = useSelector((state: RootState) => state.app.alert);
  const dispatch = useDispatch();

  if (!alert.visible) return null;

  return (
    <Modal
      transparent
      visible={alert.visible}
      animationType="fade"
      onRequestClose={() => dispatch(hideAlert())}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.message}>{alert.message}</Text>
          <View style={styles.buttonContainer}>
            {alert.actions.map((action, index) => (
              <Pressable
                key={action.text}
                style={[
                    styles.button,
                    index > 0 && styles.buttonMargin,
                    action.style === 'destructive' && styles.destructiveButton,
                    action.style === 'cancel' && styles.cancelButton
                ]}
                onPress={() => {
                  dispatch(hideAlert());
                  action.onPress?.();
                }}
              >
                <Text style={[
                    styles.buttonText,
                    action.style === 'destructive' && styles.destructiveButtonText,
                    action.style === 'cancel' && styles.cancelButtonText
                ]}>
                    {action.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#a07b55',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonMargin: {
    // marginLeft: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  destructiveButton: {
    backgroundColor: '#ff4444',
  },
  destructiveButtonText: {
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelButtonText: {
    color: '#333',
  },
});
