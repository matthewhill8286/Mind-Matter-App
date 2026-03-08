import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useIsLoading } from '@/lib/state';

export const LoadingOverlay = () => {
  const isLoading = useIsLoading();

  if (!isLoading) return null;

  return (
    <Modal transparent visible={isLoading} animationType="fade">
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <ActivityIndicator size="large" color="#a07b55" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
