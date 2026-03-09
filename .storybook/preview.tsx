import type { Preview } from '@storybook/react-webpack5';
import '@patternfly/react-core/dist/styles/base.css';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';

// Set up global chrome mock immediately
if (typeof window !== 'undefined') {
  const defaultMockChrome = {
    auth: {
      getUser: async () => ({
        identity: {
          account_number: '12345',
          org_id: '67890',
          user: {
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_active: true,
            is_org_admin: false,
          },
          internal: {
            account_id: '12345',
          },
        },
      }),
    },
    getBundleData: () => ({ bundleId: 'insights' }),
    getAvailableBundles: () => [
      { id: 'insights', title: 'Red Hat Insights' },
      { id: 'ansible', title: 'Ansible Automation Platform' },
      { id: 'openshift', title: 'OpenShift' },
      { id: 'settings', title: 'Settings' },
    ],
    updateDocumentTitle: (title: string) => {
      document.title = title;
    },
    hideGlobalFilter: () => {},
    isBeta: () => false,
    isProd: () => false,
    getEnvironment: () => 'stage',
  };

  // @ts-ignore
  window.insights = { chrome: defaultMockChrome };
}

const preview: Preview = {
  beforeAll: async () => {
    // Initialize MSW with error on unhandled requests to catch missing mocks
    initialize({ onUnhandledRequest: 'warn' });
  },
  loaders: [mswLoader],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Documentation', 'User Journeys', 'Components', '*'],
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
  },
};

export default preview;
