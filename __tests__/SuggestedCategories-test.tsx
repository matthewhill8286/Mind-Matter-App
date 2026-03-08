import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SuggestedCategories from '../app/(onboarding)/suggested-categories';
import { useGraphQLQuery, useGraphQLMutation } from '@/lib/graphql';
import { router } from 'expo-router';

jest.mock('@/lib/graphql', () => ({
  useGraphQLQuery: jest.fn(),
  useGraphQLMutation: jest.fn(),
}));

describe('SuggestedCategories Screen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGraphQLMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (useGraphQLQuery as jest.Mock).mockReturnValue({
      data: {
        assessment: {
          mood: 'anxious',
          stress: 8,
          sleep: 2,
        },
      },
    });
  });

  it('renders suggested categories and allows selection', async () => {
    const { getByText } = render(<SuggestedCategories />);

    // Based on suggestWithReasons, stress and sleep and anxiety should be suggested
    expect(getByText('Stress')).toBeTruthy();
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Anxiety')).toBeTruthy();

    // Toggle a category (e.g., Anxiety)
    fireEvent.press(getByText('Anxiety'));

    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
    });
  });
});
