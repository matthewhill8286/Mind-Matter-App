import React from 'react';
import { render } from '@testing-library/react-native';
import ScoreCard from '../components/ScoreCard';

describe('ScoreCard', () => {
  it('renders correctly with given props', () => {
    const { getByText } = render(
      <ScoreCard score={85} title="Test Title" subtitle="Test Subtitle" bg="#6bbf8e" />,
    );

    expect(getByText('85')).toBeTruthy();
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Subtitle')).toBeTruthy();
  });

  it('renders string score correctly', () => {
    const { getByText } = render(
      <ScoreCard score="N/A" title="Test Title" subtitle="Test Subtitle" bg="#6bbf8e" />,
    );

    expect(getByText('N/A')).toBeTruthy();
  });
});
