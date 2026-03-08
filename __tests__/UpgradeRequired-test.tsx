import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UpgradeRequired from '../app/(auth)/upgrade-required';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

describe('UpgradeRequired Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and key buttons', () => {
    const { getByText } = render(<UpgradeRequired />);
    expect(getByText('Trial Expired')).toBeTruthy();
    expect(getByText('Upgrade Now')).toBeTruthy();
    expect(getByText('Continue with limited features')).toBeTruthy();
    expect(getByText('Sign out')).toBeTruthy();
  });

  it('navigates to trial-upgrade when Upgrade Now is pressed', () => {
    const { getByText } = render(<UpgradeRequired />);
    fireEvent.press(getByText('Upgrade Now'));
    expect(router.replace).toHaveBeenCalledWith('/(auth)/trial-upgrade');
  });

  it('navigates to home when Continue with limited features is pressed', () => {
    const { getByText } = render(<UpgradeRequired />);
    fireEvent.press(getByText('Continue with limited features'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('removes session and navigates to sign-in on sign out', async () => {
    const { getByText } = render(<UpgradeRequired />);
    fireEvent.press(getByText('Sign out'));
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth:session:v1');
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-in');
    });
  });
});
