import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SleepScreen from '../app/(tabs)/sleep/index';
import { useSleepStore } from '../store/useSleepStore';
import { useRouter } from 'expo-router';

jest.mock('../store/useSleepStore');
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
jest.mock('../components/GridItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    GridItem: ({ title, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
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
jest.mock('../lib/sleep-utils', () => ({
  getQualityLabel: jest.fn((q: number) => `Quality ${q}`),
}));

describe('SleepScreen', () => {
  const mockFetch = jest.fn();
  const mockSetSleepMode = jest.fn();
  const mockRouter = { push: jest.fn() };
  const defaultSleepMode = { sleepModeStartISO: null, autoDetectionEnabled: false };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSleepStore as unknown as jest.Mock).mockReturnValue({
      sleepMode: defaultSleepMode,
      setSleepMode: mockSetSleepMode,
      sleepEntries: [],
      fetchSleepEntries: mockFetch,
      isLoading: false,
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders Sleep header and hub subtitle', () => {
    const { getByText } = render(<SleepScreen />);
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Track your rest and optimize your recovery.')).toBeTruthy();
  });

  it('calls fetchSleepEntries on mount', () => {
    render(<SleepScreen />);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('shows Start Sleep Mode button when sleep mode is off', () => {
    const { getByText } = render(<SleepScreen />);
    expect(getByText('Start Sleep Mode')).toBeTruthy();
  });

  it('shows Stop Sleep Mode button when sleep mode is active', () => {
    (useSleepStore as unknown as jest.Mock).mockReturnValue({
      sleepMode: { sleepModeStartISO: new Date().toISOString(), autoDetectionEnabled: false },
      setSleepMode: mockSetSleepMode,
      sleepEntries: [],
      fetchSleepEntries: mockFetch,
      isLoading: false,
    });
    const { getByText } = render(<SleepScreen />);
    expect(getByText('Stop Sleep Mode')).toBeTruthy();
  });

  it('navigates to log sleep when Log Sleep is pressed', () => {
    const { getByText } = render(<SleepScreen />);
    fireEvent.press(getByText('Log Sleep'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/sleep/log');
  });

  it('navigates to history when History is pressed', () => {
    const { getByText } = render(<SleepScreen />);
    fireEvent.press(getByText('History'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/sleep/history');
  });

  it('starts sleep mode when Start Sleep Mode is pressed', () => {
    render(<SleepScreen />);
    const { getByText } = render(<SleepScreen />);
    fireEvent.press(getByText('Start Sleep Mode'));
    expect(mockSetSleepMode).toHaveBeenCalledWith(
      expect.objectContaining({ sleepModeStartISO: expect.any(String) }),
    );
  });

  it('shows Last Night card when sleep entries exist', () => {
    (useSleepStore as unknown as jest.Mock).mockReturnValue({
      sleepMode: defaultSleepMode,
      setSleepMode: mockSetSleepMode,
      sleepEntries: [{ id: 'e1', duration: 7.5, quality: 4 }],
      fetchSleepEntries: mockFetch,
      isLoading: false,
    });
    const { getByText } = render(<SleepScreen />);
    expect(getByText('Last Night')).toBeTruthy();
  });

  it('navigates to mindful hours when link is pressed', () => {
    const { getByText } = render(<SleepScreen />);
    fireEvent.press(getByText('View Mindful Hours'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/mindful-hours');
  });
});
