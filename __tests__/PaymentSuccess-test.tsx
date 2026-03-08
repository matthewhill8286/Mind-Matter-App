import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PaymentSuccess from '../app/(auth)/payment-success';
import { router } from 'expo-router';

jest.mock('../constants/theme', () => ({
  UI: {
    radius: { xl: 24, md: 12, lg: 18, sm: 8, pill: 999 },
    spacing: { xl: 20 },
  },
  Colors: {
    light: {
      background: '#fff',
      card: '#f5f5f5',
      text: '#000',
      mutedText: '#888',
      primary: '#828a6a',
      onPrimary: '#fff',
    },
  },
}));

describe('PaymentSuccess Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders success title and message', () => {
    const { getByText } = render(<PaymentSuccess />);
    expect(getByText('Payment Successful!')).toBeTruthy();
    expect(getByText(/Thank you for subscribing/)).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('navigates to home when Get Started is pressed', () => {
    const { getByText } = render(<PaymentSuccess />);
    fireEvent.press(getByText('Get Started'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });
});
