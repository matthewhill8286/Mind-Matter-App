import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../app/(auth)/sign-up';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../supabase/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('../store/useAuthStore');

describe('SignUp Screen', () => {
  const mockSignUpWithEmail = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      signUpWithEmail: mockSignUpWithEmail,
      submitting: false,
      error: null,
      clearError: mockClearError,
    });
    // mock getState for session check
    (useAuthStore as any).getState = jest.fn().mockReturnValue({ session: null });
  });

  it('renders email, password fields and create account button', () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);
    expect(getByPlaceholderText('you@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Create a password')).toBeTruthy();
    expect(getByText('Create account')).toBeTruthy();
  });

  it('shows error when email or password is empty', async () => {
    const { getByText } = render(<SignUp />);
    fireEvent.press(getByText('Create account'));
    await waitFor(() => {
      expect(getByText('Email and password are required')).toBeTruthy();
    });
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('calls signUpWithEmail with entered credentials', async () => {
    mockSignUpWithEmail.mockResolvedValue(null);
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('you@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.press(getByText('Create account'));

    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows auth error when sign up fails', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      signUpWithEmail: mockSignUpWithEmail,
      submitting: false,
      error: 'Email already in use',
      clearError: mockClearError,
    });

    const { getByText } = render(<SignUp />);
    expect(getByText('Email already in use')).toBeTruthy();
  });

  it('navigates to sign-in when back link is pressed', () => {
    const { getByText } = render(<SignUp />);
    fireEvent.press(getByText('Back to sign in'));
    expect(router.navigate).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('disables button while submitting', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      signUpWithEmail: mockSignUpWithEmail,
      submitting: true,
      error: null,
      clearError: mockClearError,
    });

    const { getByText } = render(<SignUp />);
    expect(getByText('Creating account...')).toBeTruthy();
  });
});
