import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PaymentFailure from '../app/(auth)/payment-failure';
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

describe('PaymentFailure Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders failure title, message and action buttons', () => {
    const { getByText } = render(<PaymentFailure />);
    expect(getByText('Payment Failed')).toBeTruthy();
    expect(getByText(/couldn't process your payment/)).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls router.back when Try Again is pressed', () => {
    const { getByText } = render(<PaymentFailure />);
    fireEvent.press(getByText('Try Again'));
    expect(router.back).toHaveBeenCalled();
  });

  it('navigates to home when Cancel is pressed', () => {
    const { getByText } = render(<PaymentFailure />);
    fireEvent.press(getByText('Cancel'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });
});
