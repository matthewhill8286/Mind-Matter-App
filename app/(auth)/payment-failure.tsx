import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { UI } from '@/constants/theme';

export default function PaymentFailure() {
  const handleRetry = () => {
    router.back();
  };

  const handleCancel = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✕</Text>
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.message}>
          We couldn&#39;t process your payment. Please check your card details and try again.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6f6660',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: UI.radius.xl,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c66b6b', // Reddish color for failure
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#6a5e55',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6a5e55',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#828a6a',
    paddingVertical: 16,
    borderRadius: UI.radius.md,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6a5e55',
    fontWeight: '700',
    fontSize: 16,
    opacity: 0.8,
  },
});
