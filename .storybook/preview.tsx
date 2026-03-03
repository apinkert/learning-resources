import type { Preview } from '@storybook/react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { initialize, mswLoader } from 'msw-storybook-addon';
import messages from '../src/Messages';

// Create a simple messages object for IntlProvider
const flatMessages = Object.fromEntries(
  Object.entries(messages).map(([, value]) => [value.id, value.defaultMessage])
);

// Basic mock provider for component stories
const ComponentProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <IntlProvider locale="en" messages={flatMessages}>
      {children}
    </IntlProvider>
  );
};

const preview: Preview = {
  beforeAll: async () => {
    initialize({ onUnhandledRequest: 'warn' });
  },
  loaders: [mswLoader],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Documentation',
          'User Journeys',
          'Help Panel',
          'Components',
          '*',
        ],
      },
    },
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chrome: {
      environment: 'prod',
    },
  },
  decorators: [
    (Story, { parameters }) => {
      // Journey stories set noWrapping: true and provide their own providers
      if (parameters.noWrapping) {
        return <Story />;
      }

      // Component stories get basic provider wrapping
      return (
        <ComponentProviders>
          <Story />
        </ComponentProviders>
      );
    },
  ],
};

export default preview;
