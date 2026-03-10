import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Home from '../app/(tabs)/home';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGraphQLQuery } from '../lib/graphql';
import { router } from 'expo-router';

import { useSubscription } from '../hooks/useSubscription';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('../lib/graphql', () => ({
  useGraphQLQuery: jest.fn(),
}));

jest.mock('../hooks/useSubscription');

// Mock ScreenHeader to avoid deeper complexity
jest.mock('../components/ScreenHeader', () => {
  const { View, Text } = require('react-native');
  return (props: any) => (
    <View>
      <Text>{props.title}</Text>
    </View>
  );
});

describe('Home Screen', () => {
  beforeEach(() => {
    (useSubscription as jest.Mock).mockReturnValue({ isExpired: false, hasFullAccess: true });
    (useGraphQLQuery as jest.Mock).mockReturnValue({
      data: {
        moodCheckIns: [],
        journalEntries: [],
        assessment: {},
        mindfulnessHistory: [],
        stressHistory: [],
      },
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  it('renders wellness scores and quick actions', async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Wellness Snapshot')).toBeTruthy();

    // The wellness score will be 28 based on current lib/wellness.ts calculation for empty data
    // (0 + 70 + 40 + 0 + 0) / 5 = 22. Wait, let's check lib/wellness.ts again.
    // moodScore=0, sleepScore=70, stressScore=40, mindfulnessScore=0, consistencyScore=0
    // (0+70+40+0+0)/5 = 22.
    // ScoreCard with 22 should exist.
    expect(getByText('22')).toBeTruthy();

    expect(getByText('Quick actions')).toBeTruthy();
    expect(getByText('Stress toolkit')).toBeTruthy();
    expect(getByText('Mood check-in')).toBeTruthy();
  });

  it('navigates to stress toolkit when pressed', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );

    fireEvent.press(getByText('Stress toolkit'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/stress');
  });

  it('shows trial expired banner when expired', () => {
    (useSubscription as jest.Mock).mockReturnValue({ isExpired: true, hasFullAccess: false });

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );

    expect(getByText('Trial Expired')).toBeTruthy();
    fireEvent.press(getByText('Upgrade to lifetime access to unlock all features.'));
    expect(router.push).toHaveBeenCalledWith('/(auth)/trial-upgrade');
  });
});
