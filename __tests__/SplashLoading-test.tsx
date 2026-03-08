import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SplashLoading from '../app/(onboarding)/splash-loading';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Animated to speed up tests or just let it run
// jest.useFakeTimers();

jest.mock('react-native/Libraries/Animated/Animated', () => {
  const Animated = jest.requireActual('react-native/Libraries/Animated/Animated');
  Animated.timing = (value: any, config: any) => ({
    start: (callback: any) => {
      value.setValue(config.toValue);
      if (callback) callback({ finished: true });
    },
    stop: () => {},
  });
  return Animated;
});

describe('SplashLoading Screen', () => {
  it('sequences through stages and navigates to welcome if not seen', async () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<SplashLoading />);

    // Fast forward to loading stage
    await waitFor(
      () => {
        expect(getByText(/%/)).toBeTruthy();
      },
      { timeout: 20000 },
    );

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/welcome');
      },
      { timeout: 20000 },
    );
  }, 30000);

  it('navigates to index if onboarding seen', async () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

    render(<SplashLoading />);

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/index');
      },
      { timeout: 20000 },
    );
  }, 30000);
});
