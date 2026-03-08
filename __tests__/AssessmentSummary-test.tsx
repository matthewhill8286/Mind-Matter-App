import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AssessmentSummary from '../app/(onboarding)/assessment-summary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Mock ScoreCard to avoid potential issues
jest.mock('@/components/ScoreCard', () => {
  const { View, Text } = require('react-native');
  return (props: any) => (
    <View testID="score-card">
      <Text>{props.title}</Text>
      <Text>{props.score}</Text>
    </View>
  );
});

describe('AssessmentSummary Screen', () => {
  it('renders assessment data from AsyncStorage', async () => {
    const assessmentData = {
      goal: 'Better sleep',
      mood: 'Tired',
      sleepQuality: 2,
      stressLevel: 7,
      soundCheck: {
        metrics: { wpm: 140 },
      },
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(assessmentData));

    const { getByText, getAllByTestId } = render(<AssessmentSummary />);

    await waitFor(() => {
      expect(getByText('Better sleep')).toBeTruthy();
      expect(getByText('Tired')).toBeTruthy();
      expect(getByText('140 words per minute detected.')).toBeTruthy();
    });

    const scoreCards = getAllByTestId('score-card');
    expect(scoreCards.length).toBe(2);
    expect(getByText('Sleep Quality')).toBeTruthy();
    expect(getByText('Stress Level')).toBeTruthy();
  });

  it('navigates to profile setup on continue', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { getByText } = render(<AssessmentSummary />);

    fireEvent.press(getByText('Continue'));
    expect(router.replace).toHaveBeenCalledWith('/(onboarding)/profile-setup');
  });

  it('navigates back on back press', () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { getByText } = render(<AssessmentSummary />);
    fireEvent.press(getByText('←'));
    expect(router.back).toHaveBeenCalled();
  });
});
