import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../app/(auth)/sign-in';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

describe('SignIn Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);
    expect(getByPlaceholderText('you@email.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('signs in successfully with email and password', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText('you@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth:session:v1',
        expect.stringContaining('test@example.com'),
      );
      expect(router.replace).toHaveBeenCalledWith('/index');
    });
  });

  it('does not sign in if email or password is empty', async () => {
    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText('Continue'));

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
