import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TrialUpgrade from '../app/(auth)/trial-upgrade';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGraphQLMutation } from '../lib/graphql';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('../lib/graphql', () => ({
  useGraphQLMutation: jest.fn(),
}));

describe('TrialUpgrade Screen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    (useGraphQLMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
    mockMutateAsync.mockResolvedValue({
      setSubscription: {
        type: 'trial',
        expiryDate: '2026-01-23T16:48:00.000Z',
        __typename: 'Subscription',
      },
    });
    jest.clearAllMocks();
  });

  it('renders correctly with all plans', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TrialUpgrade />
      </QueryClientProvider>,
    );

    expect(getByText('MindMate Premium')).toBeTruthy();
    expect(getByText('7-Day Free Trial')).toBeTruthy();
    expect(getByText('Monthly Access')).toBeTruthy();
    expect(getByText('10€/mo')).toBeTruthy();
    expect(getByText('Lifetime Access')).toBeTruthy();
  });

  it('selects 7-day trial and navigates to assessment', async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TrialUpgrade />
      </QueryClientProvider>,
    );

    fireEvent.press(getByText('Start Free Trial'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        input: expect.objectContaining({
          type: 'trial',
        }),
      });
      expect(router.push).toHaveBeenCalledWith('/(auth)/payment-success');
    });
  });

  it('selects monthly plan and calls mutation', async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TrialUpgrade />
      </QueryClientProvider>,
    );

    fireEvent.press(getByText('Pay with Card or Mobile'));

    await waitFor(
      () => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          input: expect.objectContaining({
            type: 'monthly',
          }),
        });
      },
      { timeout: 3000 },
    );
  });

  it('selects lifetime plan and calls mutation', async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TrialUpgrade />
      </QueryClientProvider>,
    );

    fireEvent.press(getByText('Lifetime Access'));

    await waitFor(
      () => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          input: expect.objectContaining({
            type: 'lifetime',
          }),
        });
      },
      { timeout: 3000 },
    );
  });
});
