import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QuickStartContextProvider } from '@patternfly/quickstarts';
import { IntlProvider } from 'react-intl';
import { MockConsolePage } from './MockConsolePage';

interface AppEntryWithRouterProps {
  initialRoute?: string;
  bundle?: string;
}

const locale = 'en';

/**
 * Wrapper component for user journey tests.
 * Provides a mock console environment with Help Panel for testing.
 *
 * NOTE: useChrome and Unleash are mocked at the webpack level via .storybook/main.ts
 */
export const AppEntryWithRouter: React.FC<AppEntryWithRouterProps> = ({
  initialRoute = '/',
  bundle = 'insights',
}) => {
  return (
    <IntlProvider locale={locale} defaultLocale="en">
      <QuickStartContextProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <MockConsolePage bundle={bundle} />
        </MemoryRouter>
      </QuickStartContextProvider>
    </IntlProvider>
  );
};
