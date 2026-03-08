import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StressHub from '../app/(tabs)/stress/index';
import { useStressStore } from '../store/useStressStore';
import { useStressHistoryStore } from '../store/useStressHistoryStore';
import { useSubscription } from '../hooks/useSubscription';
import { useRouter } from 'expo-router';

jest.mock('../store/useStressStore');
jest.mock('../store/useStressHistoryStore');
jest.mock('../hooks/useSubscription');
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
    ActionCard: ({ children }: any) => <View>{children}</View>,
  };
});
jest.mock('../components/GridCard', () => {
  const { Pressable, Text } = require('react-native');
  return {
    GridCard: ({ title, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});
jest.mock('../components/HorizontalVideoList', () => {
  const { View, Text } = require('react-native');
  return {
    HorizontalVideoList: ({ title }: any) => (
      <View>
        <Text>{title}</Text>
      </View>
    ),
  };
});
jest.mock('../components/SummaryCard', () => {
  const { View, Text } = require('react-native');
  return {
    SummaryCard: ({ children, title, onPress }: any) => (
      <View>
        <Text onPress={onPress}>{title}</Text>
        {children}
      </View>
    ),
    SummaryRow: ({ label, value }: any) => (
      <View>
        <Text>{label}</Text>
        <Text>{value}</Text>
      </View>
    ),
  };
});
jest.mock('../components/Skeleton', () => ({
  SkeletonRect: () => null,
}));
jest.mock('../lib/state', () => ({
  showAlert: jest.fn(),
}));
jest.mock('../data/stressVideos', () => ({
  STRESS_VIDEOS: [{ id: 'body-1', category: 'body', title: 'Body Exercise' }],
}));

describe('StressHub Screen', () => {
  const mockFetchKit = jest.fn();
  const mockFetchHistory = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStressStore as unknown as jest.Mock).mockReturnValue({
      stressKit: null,
      fetchStressKit: mockFetchKit,
      isLoading: false,
    });
    (useStressHistoryStore as unknown as jest.Mock).mockReturnValue({
      stressHistory: [],
      fetchStressHistory: mockFetchHistory,
      isLoading: false,
    });
    (useSubscription as jest.Mock).mockReturnValue({ hasFullAccess: true });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders Stress header and subtitle', () => {
    const { getByText } = render(<StressHub />);
    expect(getByText('Stress')).toBeTruthy();
    expect(getByText('Quick tools for calming your body and clearing your mind.')).toBeTruthy();
  });

  it('fetches stress kit and history on mount', () => {
    render(<StressHub />);
    expect(mockFetchKit).toHaveBeenCalled();
    expect(mockFetchHistory).toHaveBeenCalled();
  });

  it('renders grid cards for Grounding, Breathing, Relatable Video, Watch Latest', () => {
    const { getByText } = render(<StressHub />);
    expect(getByText('Grounding')).toBeTruthy();
    expect(getByText('Breathing')).toBeTruthy();
    expect(getByText('Relatable Video')).toBeTruthy();
    expect(getByText('Watch Latest')).toBeTruthy();
  });

  it('renders Body Relaxation and Mind Relaxation video lists', () => {
    const { getByText } = render(<StressHub />);
    expect(getByText('Body Relaxation')).toBeTruthy();
    expect(getByText('Mind Relaxation')).toBeTruthy();
  });

  it('navigates to breathing when Breathing is pressed', () => {
    const { getByText } = render(<StressHub />);
    fireEvent.press(getByText('Breathing'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/stress/breathing');
  });

  it('navigates to stress plan when manage stress plan button is pressed with full access', () => {
    const { getByText } = render(<StressHub />);
    fireEvent.press(getByText('Manage Stress Plan'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/stress/plan');
  });

  it('shows upgrade alert for Grounding when user lacks access', () => {
    const { showAlert } = require('../lib/state');
    (useSubscription as jest.Mock).mockReturnValue({ hasFullAccess: false });
    const { getByText } = render(<StressHub />);
    fireEvent.press(getByText('Grounding'));
    expect(showAlert).toHaveBeenCalledWith(
      'Premium Feature',
      'Upgrade to lifetime access to unlock the grounding tool.',
      expect.any(Array),
    );
  });

  it('shows upgrade alert for stress plan when user lacks access', () => {
    const { showAlert } = require('../lib/state');
    (useSubscription as jest.Mock).mockReturnValue({ hasFullAccess: false });
    const { getByText } = render(<StressHub />);
    fireEvent.press(getByText('Manage Stress Plan'));
    expect(showAlert).toHaveBeenCalledWith(
      'Premium Feature',
      'Upgrade to lifetime access to unlock your stress plan.',
      expect.any(Array),
    );
  });

  it('shows Recent Activity when stress history exists', () => {
    (useStressHistoryStore as unknown as jest.Mock).mockReturnValue({
      stressHistory: [{ id: 'body-1', title: 'Body Exercise', date: new Date().toISOString() }],
      fetchStressHistory: mockFetchHistory,
      isLoading: false,
    });
    const { getByText } = render(<StressHub />);
    expect(getByText('Recent Activity')).toBeTruthy();
  });
});
