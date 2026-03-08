import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../components/icon-symbol';

describe('IconSymbol', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <IconSymbol name="house.fill" size={24} color="blue" testID="test-icon" />,
    );
    expect(getByTestId('test-icon')).toBeTruthy();
  });
});
