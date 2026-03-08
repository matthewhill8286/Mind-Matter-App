import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileSetup from '../app/(onboarding)/profile-setup';
import { useGraphQLMutation } from '@/lib/graphql';
import { router } from 'expo-router';

jest.mock('@/lib/graphql', () => ({
  useGraphQLMutation: jest.fn(),
}));

describe('ProfileSetup Screen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGraphQLMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  it('navigates through steps and saves profile', async () => {
    const { getByText, getByPlaceholderText } = render(<ProfileSetup />);

    // Step 0: Intro
    expect(getByText('Let’s set up your profile')).toBeTruthy();
    fireEvent.press(getByText('Next'));

    // Step 1: Name
    expect(getByText('What should we call you?')).toBeTruthy();
    const nameInput = getByPlaceholderText('Your name or nickname');
    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.press(getByText('Next'));

    // Step 2: Intention
    expect(getByText('What do you want help with most?')).toBeTruthy();
    fireEvent.press(getByText('Calm'));
    fireEvent.press(getByText('Next'));

    // Step 3: Routine
    expect(getByText('When do you prefer check-ins?')).toBeTruthy();
    fireEvent.press(getByText('Morning'));
    fireEvent.press(getByText('Next'));

    // Step 4: Finish
    expect(getByText('You’re all set')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Calm')).toBeTruthy();
    expect(getByText('Morning')).toBeTruthy();

    fireEvent.press(getByText('Complete'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        input: expect.objectContaining({
          name: 'John Doe',
          intention: 'Calm',
          routine: 'Morning',
        }),
      });
      expect(router.replace).toHaveBeenCalledWith('/(onboarding)/profile-completion');
    });
  });

  it('can go back between steps', () => {
    const { getByText } = render(<ProfileSetup />);

    expect(getByText('Let’s set up your profile')).toBeTruthy();
    fireEvent.press(getByText('Next'));
    expect(getByText('What should we call you?')).toBeTruthy();

    fireEvent.press(getByText('←'));
    expect(getByText('Let’s set up your profile')).toBeTruthy();
  });

  it('can skip setup', () => {
    const { getByText } = render(<ProfileSetup />);
    fireEvent.press(getByText('Skip setup'));
    expect(router.replace).toHaveBeenCalledWith('/(onboarding)/suggested-categories');
  });
});
