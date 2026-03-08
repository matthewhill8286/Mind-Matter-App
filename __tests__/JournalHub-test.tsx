import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JournalHub from '../app/(tabs)/journal/index';
import { useJournalStore } from '../store/useJournalStore';
import { useRouter } from 'expo-router';

jest.mock('../store/useJournalStore');
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

describe('JournalHub Screen', () => {
  const mockFetch = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useJournalStore as unknown as jest.Mock).mockReturnValue({
      journalEntries: [],
      fetchJournalEntries: mockFetch,
      isLoading: false,
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders Journal header', () => {
    const { getByText } = render(<JournalHub />);
    expect(getByText('Journal')).toBeTruthy();
  });

  it('shows hub subtitle when no entries', () => {
    const { getByText } = render(<JournalHub />);
    expect(getByText('Reflect on your day and clear your mind.')).toBeTruthy();
  });

  it('shows entries count when entries exist', () => {
    (useJournalStore as unknown as jest.Mock).mockReturnValue({
      journalEntries: [{ id: '1', title: 'Test', mood: 'Happy' }],
      fetchJournalEntries: mockFetch,
      isLoading: false,
    });
    const { getByText } = render(<JournalHub />);
    expect(getByText("You've written 1 entries. Keep it up!")).toBeTruthy();
  });

  it('calls fetchJournalEntries on mount', () => {
    render(<JournalHub />);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('navigates to new entry when Write Reflection is pressed', () => {
    const { getByText } = render(<JournalHub />);
    fireEvent.press(getByText('Write Reflection'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/journal/new');
  });

  it('navigates to prompts when Prompts is pressed', () => {
    const { getByText } = render(<JournalHub />);
    fireEvent.press(getByText('Prompts'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/journal/prompts');
  });

  it('navigates to history when History is pressed', () => {
    const { getByText } = render(<JournalHub />);
    fireEvent.press(getByText('History'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/journal/history');
  });

  it('shows last entry summary card when entries exist', () => {
    (useJournalStore as unknown as jest.Mock).mockReturnValue({
      journalEntries: [{ id: 'abc', title: 'My Day', mood: 'Great' }],
      fetchJournalEntries: mockFetch,
      isLoading: false,
    });
    const { getByText } = render(<JournalHub />);
    expect(getByText('Last Entry')).toBeTruthy();
    expect(getByText('My Day')).toBeTruthy();
  });

  it('navigates to last entry when summary card is pressed', () => {
    (useJournalStore as unknown as jest.Mock).mockReturnValue({
      journalEntries: [{ id: 'abc', title: 'My Day', mood: 'Great' }],
      fetchJournalEntries: mockFetch,
      isLoading: false,
    });
    const { getByText } = render(<JournalHub />);
    fireEvent.press(getByText('Last Entry'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/journal/abc');
  });
});
