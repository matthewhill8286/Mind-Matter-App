import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Welcome from '../app/(onboarding)/welcome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// We need to mock WelcomeComp or ensure it's mockable
jest.mock('../components/Welcome', () => {
  const { View, Text, Pressable } = require('react-native');
  return (props: any) => (
    <View>
      <Text>{props.slides[props.slideIndex].title}</Text>
      <Pressable onPress={props.onNext} testID="next-button">
        <Text>Next</Text>
      </Pressable>
      {props.onBack && (
        <Pressable onPress={props.onBack} testID="back-button">
          <Text>Back</Text>
        </Pressable>
      )}
    </View>
  );
});

describe('Welcome Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates through slides and completes onboarding', async () => {
    const { getByText, getByTestId, queryByTestId } = render(<Welcome />);
    const mockRouter = require('expo-router').useRouter();

    // First slide
    expect(getByText('Welcome to MindMate!')).toBeTruthy();
    expect(queryByTestId('back-button')).toBeNull();

    // Next to second slide
    fireEvent.press(getByTestId('next-button'));
    expect(getByText('Gently personalised support, just for you')).toBeTruthy();
    expect(getByTestId('back-button')).toBeTruthy();

    // Go back
    fireEvent.press(getByTestId('back-button'));
    expect(getByText('Welcome to MindMate!')).toBeTruthy();

    // Go to end (6 slides total)
    fireEvent.press(getByTestId('next-button')); // slide 1
    fireEvent.press(getByTestId('next-button')); // slide 2
    fireEvent.press(getByTestId('next-button')); // slide 3
    fireEvent.press(getByTestId('next-button')); // slide 4
    fireEvent.press(getByTestId('next-button')); // slide 5

    expect(getByText("You're Not Alone Here")).toBeTruthy();

    // Final next
    fireEvent.press(getByTestId('next-button'));

    // Wait for the async effect in handleNext and AsyncStorage
    await waitFor(
      () => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('onboarding:seen:v1', 'true');
      },
      { timeout: 3000 },
    );
  });
});
