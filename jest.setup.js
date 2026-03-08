import '@testing-library/jest-native/extend-expect';

jest.mock('./hooks/useSubscription', () => ({
  useSubscription: jest.fn(() => ({
    subscription: null,
    isExpired: false,
    isLifetime: false,
    hasFullAccess: true,
  })),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
}));

jest.mock('./components/icon-symbol.ios', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    IconSymbol: (props) => React.createElement(Text, { testID: props.testID }, 'Icon'),
  };
});

try {
  jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }) => children,
    usePaymentSheet: () => ({
      initPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
      presentPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
    }),
  }));
} catch {
  // stripe-react-native not installed
}
