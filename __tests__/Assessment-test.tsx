import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Assessment from '../app/(onboarding)/assessment';
import { useGraphQLMutation } from '@/lib/graphql';
import { router } from 'expo-router';
import { useRecorder } from '@/lib/recorder';

jest.mock('@/lib/graphql', () => ({
  useGraphQLMutation: jest.fn(),
}));

jest.mock('@/lib/recorder', () => ({
  useRecorder: jest.fn(),
  usePlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    isPlaying: false,
  })),
  computeVoiceMetrics: jest.fn(() => ({
    words: 10,
    wpm: 120,
    fillerCount: 0,
  })),
}));

// Mock SoundPulse to avoid animation issues
jest.mock('@/components/SoundPulse', () => {
  const { View } = require('react-native');
  return () => <View testID="sound-pulse" />;
});

describe('Assessment Screen', () => {
  const mockMutateAsync = jest.fn();
  const mockStartRecording = jest.fn();
  const mockStopRecording = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGraphQLMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (useRecorder as jest.Mock).mockReturnValue({
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      isRecording: false,
      durationMs: 0,
      uri: null,
    });
  });

  it('completes the assessment flow', async () => {
    const { getByText, getByPlaceholderText, findByText, queryByText } = render(<Assessment />);

    // 1. Goal
    expect(getByText(/What would you like support with/i)).toBeTruthy();
    fireEvent.press(getByText('Reduce daily stress'));
    fireEvent.press(getByText('Continue'));

    // 2. Gender
    expect(await findByText(/What’s your gender/i)).toBeTruthy();
    fireEvent.press(getByText('Woman'));
    fireEvent.press(getByText('Continue'));

    // 3. Age
    expect(await findByText(/What’s your age/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 4. Weight
    expect(await findByText(/What’s your weight/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 5. Mood
    expect(await findByText(/Describe your mood/i)).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText(/e\.g\., anxious, tired, overwhelmed/i), 'Calm');
    fireEvent.press(getByText('Continue'));

    // 6. Help
    expect(await findByText(/Have you sought help before/i)).toBeTruthy();
    fireEvent.press(getByText('No'));
    fireEvent.press(getByText('Continue'));

    // 7. Physical
    expect(await findByText(/Experiencing physical distress/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 8. Sleep
    expect(await findByText(/Rate your sleep quality/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 9. Meds
    expect(await findByText(/Are you taking meds/i)).toBeTruthy();
    fireEvent.press(getByText('No'));
    fireEvent.press(getByText('Continue'));

    // 10. medsSpecify
    expect(await findByText(/Specify meds/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 11. Symptoms
    expect(await findByText(/Other mental health symptoms/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 12. Stress
    expect(await findByText(/Rate your stress level/i)).toBeTruthy();
    fireEvent.press(getByText('Continue'));

    // 13. Sound
    expect(await findByText(/Voice Check-In/i)).toBeTruthy();

    // Simulate recording
    (useRecorder as jest.Mock).mockReturnValue({
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      isRecording: true,
      durationMs: 5000,
      uri: null,
    });

    const recordBtn = getByText(/TAP TO START/i);
    fireEvent.press(recordBtn);
    expect(mockStartRecording).toHaveBeenCalled();

    // The component doesn't show "STOP" text when recording, it just has the SoundPulse.
    // The Pressable itself handles the toggle.
    mockStopRecording.mockResolvedValue({ uri: 'test-uri', durationMs: 5000 });
    (useRecorder as jest.Mock).mockReturnValue({
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      isRecording: false,
      durationMs: 5000,
      uri: 'test-uri',
    });

    fireEvent.press(recordBtn); // Stop recording

    // Explicitly update the mock to simulate state change in next render
    (useRecorder as jest.Mock).mockReturnValue({
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      isRecording: false,
      durationMs: 5000,
      uri: 'test-uri',
    });

    // We might need to trigger a re-render or wait
    await act(async () => {
      // This is a bit of a hack but ensures the component sees the update
    });

    // In actual code, "Continue" button is ALWAYS present at the bottom
    const continueBtn = getByText(/Continue|Finish/);
    fireEvent.press(continueBtn);

    // 14. Expression (last step)
    await waitFor(
      () => {
        // At this point the primary action should switch to "Finish"
        expect(getByText('Finish')).toBeTruthy();
      },
      { timeout: 5000 },
    );

    // Finish the flow
    const finishBtn = getByText('Finish');
    fireEvent.press(finishBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(onboarding)/assessment-summary');
    });
  }, 20000);
});
