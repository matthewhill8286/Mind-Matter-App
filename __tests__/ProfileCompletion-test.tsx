import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileCompletion from '../app/(onboarding)/profile-completion';
import { useGraphQLQuery } from '@/lib/graphql';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

jest.mock('@/lib/graphql', () => ({
  useGraphQLQuery: jest.fn(),
}));

describe('ProfileCompletion Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useGraphQLQuery as jest.Mock).mockReturnValue({
      data: {
        moodCheckIns: [{ mood: 'happy' }],
      },
    });
  });

  it('renders wellness scores and user name', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'Jane' }));

    const { getByText } = render(<ProfileCompletion />);

    await waitFor(() => {
      expect(getByText('Nice to meet you, Jane')).toBeTruthy();
      expect(getByText('MindMate Wellness Score')).toBeTruthy();
    });
  });

  it('navigates to suggested categories on continue', () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { getByText } = render(<ProfileCompletion />);

    fireEvent.press(getByText('Continue'));
    expect(router.replace).toHaveBeenCalledWith('/(onboarding)/suggested-categories');
  });
});
