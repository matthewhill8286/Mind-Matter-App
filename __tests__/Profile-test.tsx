import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../app/(tabs)/profile';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscription } from '../hooks/useSubscription';
import { useMoodStore } from '../store/useMoodStore';
import { useJournalStore } from '../store/useJournalStore';
import { useSleepStore } from '../store/useSleepStore';
import { useMindfulnessStore } from '../store/useMindfulnessStore';
import { useStressHistoryStore } from '../store/useStressHistoryStore';
import { useStressStore } from '../store/useStressStore';
import { useChatStore } from '../store/useChatStore';
import { router } from 'expo-router';

jest.mock('../store/useProfileStore');
jest.mock('../store/useAuthStore');
jest.mock('../hooks/useSubscription');
jest.mock('../store/useMoodStore');
jest.mock('../store/useJournalStore');
jest.mock('../store/useSleepStore');
jest.mock('../store/useMindfulnessStore');
jest.mock('../store/useStressHistoryStore');
jest.mock('../store/useStressStore');
jest.mock('../store/useChatStore');

jest.mock('../components/ScreenHeader', () => {
  const { View, Text } = require('react-native');
  return (props: any) => (
    <View>
      <Text>{props.title}</Text>
      {props.subtitle ? <Text>{props.subtitle}</Text> : null}
    </View>
  );
});
jest.mock('../components/ActionCard', () => {
  const { View } = require('react-native');
  return {
    ActionCard: ({ children, title }: any) => (
      <View>
        {children}
      </View>
    ),
  };
});
jest.mock('../components/Skeleton', () => ({
  SkeletonRect: () => null,
}));
jest.mock('../components/icon-symbol', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    IconSymbol: () => React.createElement(Text, null, 'Icon'),
  };
});

const mockClearProfile = jest.fn();
const mockClearMood = jest.fn();
const mockClearJournal = jest.fn();
const mockClearSleep = jest.fn();
const mockClearMindfulness = jest.fn();
const mockClearStressHistory = jest.fn();
const mockClearStress = jest.fn();
const mockClearAllChat = jest.fn();
const mockSignOut = jest.fn();

function setupStoreMocks(overrides: { isLifetime?: boolean; isExpired?: boolean } = {}) {
  const mockFetchProfile = jest.fn().mockResolvedValue(undefined);

  (useProfileStore as unknown as jest.Mock).mockReturnValue({
    profile: { name: 'John', intention: 'Reduce stress', routine: 'Morning' },
    fetchProfile: mockFetchProfile,
  });
  (useProfileStore as any).getState = jest.fn().mockReturnValue({ clearProfile: mockClearProfile });

  (useAuthStore as unknown as jest.Mock).mockReturnValue({
    user: { email: 'john@example.com' },
    signOut: mockSignOut,
  });

  (useSubscription as jest.Mock).mockReturnValue({
    subscription: null,
    isExpired: overrides.isExpired ?? false,
    isLifetime: overrides.isLifetime ?? false,
  });

  (useMoodStore as any).getState = jest.fn().mockReturnValue({ clearMood: mockClearMood });
  (useJournalStore as any).getState = jest.fn().mockReturnValue({ clearJournal: mockClearJournal });
  (useSleepStore as any).getState = jest.fn().mockReturnValue({ clearSleep: mockClearSleep });
  (useMindfulnessStore as any).getState = jest
    .fn()
    .mockReturnValue({ clearMindfulness: mockClearMindfulness });
  (useStressHistoryStore as any).getState = jest
    .fn()
    .mockReturnValue({ clearStressHistory: mockClearStressHistory });
  (useStressStore as any).getState = jest.fn().mockReturnValue({ clearStress: mockClearStress });
  (useChatStore as any).getState = jest
    .fn()
    .mockReturnValue({ clearAllChat: mockClearAllChat });
}

describe('Profile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('renders Profile header with signed-in email', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('Signed in as john@example.com')).toBeTruthy();
    });
  });

  it('shows subscription section and app settings', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Subscription')).toBeTruthy();
      expect(getByText('App Settings')).toBeTruthy();
    });
  });

  it('shows Free Trial subscription label by default', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Free Trial')).toBeTruthy();
    });
  });

  it('shows Lifetime Access label when user has lifetime', async () => {
    setupStoreMocks({ isLifetime: true });
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Lifetime Access')).toBeTruthy();
    });
  });

  it('shows Trial Expired label when trial is expired', async () => {
    setupStoreMocks({ isExpired: true });
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Trial Expired')).toBeTruthy();
    });
  });

  it('navigates to notifications', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => getByText('Notifications'));
    fireEvent.press(getByText('Notifications'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/notifications');
  });

  it('navigates to settings', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => getByText('Manage Categories'));
    fireEvent.press(getByText('Manage Categories'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/settings');
  });

  it('navigates to help center', async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => getByText('Help Center'));
    fireEvent.press(getByText('Help Center'));
    expect(router.push).toHaveBeenCalledWith('/(utils)/help-center');
  });

  it('calls signOut and clears all stores on sign out', async () => {
    mockSignOut.mockResolvedValue(undefined);
    const { getByText } = render(<Profile />);
    await waitFor(() => getByText('Sign Out'));
    fireEvent.press(getByText('Sign Out'));
    await waitFor(() => {
      expect(mockClearProfile).toHaveBeenCalled();
      expect(mockClearMood).toHaveBeenCalled();
      expect(mockClearJournal).toHaveBeenCalled();
      expect(mockClearSleep).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
