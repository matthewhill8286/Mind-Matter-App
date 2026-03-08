import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Settings from '../app/(tabs)/settings';
import { useProfileStore } from '../store/useProfileStore';
import { router } from 'expo-router';

jest.mock('../store/useProfileStore');
jest.mock('../components/ScreenHeader', () => {
  const { View, Text } = require('react-native');
  return (props: any) => (
    <View>
      <Text>{props.title}</Text>
      {props.subtitle ? <Text>{props.subtitle}</Text> : null}
    </View>
  );
});
jest.mock('../components/Skeleton', () => ({
  SkeletonRect: () => null,
}));
jest.mock('../lib/state', () => ({
  showAlert: jest.fn(),
  withLoading: jest.fn((_key: string, fn: () => Promise<void>) => fn()),
}));
jest.mock('../data/issues', () => ({
  ISSUES: [
    { key: 'stress', title: 'Stress Management' },
    { key: 'sleep', title: 'Sleep Tracking' },
    { key: 'mood', title: 'Mood Tracking' },
  ],
}));

describe('Settings Screen', () => {
  const mockFetchProfile = jest.fn();
  const mockUpdateProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      profile: { selectedIssues: ['stress'] },
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    });
  });

  it('renders Settings header', async () => {
    const { getByText } = render(<Settings />);
    await waitFor(() => {
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  it('renders all issue options', async () => {
    const { getByText } = render(<Settings />);
    await waitFor(() => {
      expect(getByText('Stress Management')).toBeTruthy();
      expect(getByText('Sleep Tracking')).toBeTruthy();
      expect(getByText('Mood Tracking')).toBeTruthy();
    });
  });

  it('shows Selected for pre-selected issues', async () => {
    const { getAllByText } = render(<Settings />);
    await waitFor(() => {
      expect(getAllByText('Selected').length).toBeGreaterThan(0);
    });
  });

  it('toggles selection when an issue is pressed', async () => {
    const { getByText } = render(<Settings />);
    await waitFor(() => getByText('Sleep Tracking'));
    fireEvent.press(getByText('Sleep Tracking'));
    await waitFor(() => {
      expect(getByText('Selected')).toBeTruthy(); // stress is still selected
    });
  });

  it('calls updateProfile with selected issues on save', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    const { getByText } = render(<Settings />);
    await waitFor(() => getByText('Save'));
    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        selectedIssues: expect.arrayContaining(['stress']),
      });
    });
  });

  it('shows alert when saving with no issues selected', async () => {
    const { showAlert } = require('../lib/state');
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      profile: { selectedIssues: [] },
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    });
    const { getByText } = render(<Settings />);
    await waitFor(() => getByText('Stress Management'));
    // Deselect Stress (was pre-selected via profile, but profile.selectedIssues is [])
    // With empty selectedIssues, pressing Save should show alert
    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith(
        'Select at least one section',
        'Choose one or more sections to continue.',
      );
    });
  });

  it('navigates back after successful save', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    const { getByText } = render(<Settings />);
    await waitFor(() => getByText('Save'));
    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    });
  });
});
