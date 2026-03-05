/**
 * Unit tests for HelpPanel styling work (semantic tokens, layout hooks)
 * and UI interactions (sub-tabs, add/close tabs).
 */
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import HelpPanelCustomTabs from './HelpPanelCustomTabs';

jest.mock('../../store/openQuickstartInHelpPanelStore', () => {
  const mockStore = {
    getState: () => ({ pendingOpen: null }),
    updateState: jest.fn(),
    subscribe: jest.fn(() => () => {}),
    subscribeAll: jest.fn(() => () => {}),
  };
  return {
    getOpenQuickstartInHelpPanelStore: () => mockStore,
  };
});

jest.mock('@scalprum/react-core', () => ({
  useGetState: (store: { getState: () => { pendingOpen: unknown } }) =>
    store.getState(),
}));

// Create a mock function that we can spy on
const mockUseFlag = jest.fn((flagName: string) => {
  // Enable VA flag for most tests to maintain existing behavior
  if (flagName === 'platform.chrome.help-panel_chatbot') return true;
  return true;
});

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: (flagName: string) => mockUseFlag(flagName),
  useFlags: () => [
    { name: 'platform.chrome.help-panel_search', enabled: true },
    { name: 'platform.chrome.help-panel_knowledge-base', enabled: true },
    { name: 'platform.chrome.help-panel_chatbot', enabled: true },
  ],
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: { getUser: () => Promise.resolve(null) },
  }),
}));

jest.mock('../../utils/fetchQuickstarts', () => ({
  __esModule: true,
  default: () => Promise.resolve([]),
}));

jest.mock('@patternfly/quickstarts', () => ({
  QuickStartContainer: ({ children }: { children?: React.ReactNode }) =>
    children ?? null,
  QuickStartDrawerContent: () => null,
  QuickStartCloseModal: () => null,
  QuickStartStatus: { IN_PROGRESS: 1, NOT_STARTED: 0, COMPLETE: 2 },
}));

// Avoid loading real panel modules (Learn, API, Search, etc.) which depend on chrome and other globals.
jest.mock('./HelpPanelTabs/helpPanelTabsMapper', () => ({
  __esModule: true,
  TabType: {
    search: 'search',
    learn: 'learn',
    kb: 'kb',
    api: 'api',
    support: 'support',
    va: 'va',
    quickstart: 'quickstart',
  },
  default: {},
}));

jest.mock('./HelpPanelTabs/HelpPanelTabContainer', () => {
  return function MockHelpPanelTabContainer() {
    return (
      <div data-ouia-component-id="help-panel-content-container">
        Panel content
      </div>
    );
  };
});

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      {ui}
    </IntlProvider>
  );
};

describe('HelpPanelCustomTabs styling hooks', () => {
  it('renders root with class lr-c-help-panel-custom-tabs used by SCSS', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const root = document.querySelector('.lr-c-help-panel-custom-tabs');
    expect(root).toBeInTheDocument();
  });

  it('renders subtabs container with data-ouia-component-id for styling and a11y', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const subtabs = document.querySelector(
      '[data-ouia-component-id="help-panel-subtabs"]'
    );
    expect(subtabs).toBeInTheDocument();
  });

  it('renders content container with data-ouia-component-id used by SCSS', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const contentContainers = screen.getAllByText('Panel content');
    expect(contentContainers.length).toBeGreaterThan(0);
    expect(
      contentContainers[0].closest(
        '[data-ouia-component-id="help-panel-content-container"]'
      )
    ).toBeInTheDocument();
  });

  it('renders main tabs with data-ouia-component-id help-panel-tabs', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const tabs = document.querySelector(
      '[data-ouia-component-id="help-panel-tabs"]'
    );
    expect(tabs).toBeInTheDocument();
  });

  it('shows Virtual Assistant and Find help tabs with Find help as default active', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    // VA tab should have an icon instead of text
    const vaTab = screen.getByRole('tab', { name: /virtual assistant/i });
    expect(vaTab).toBeInTheDocument();
    expect(screen.getByText('Find help')).toBeInTheDocument();

    // Find help should be the active tab (aria-selected="true")
    const findHelpTab = screen.getByRole('tab', { name: /find help/i });
    expect(findHelpTab).toHaveAttribute('aria-selected', 'true');
  });

  it('hides Virtual Assistant tab when feature flag is disabled', () => {
    // Override the mock to return false for VA flag
    mockUseFlag.mockImplementation((flagName: string) => {
      if (flagName === 'platform.chrome.help-panel_chatbot') return false;
      return true;
    });

    renderWithIntl(<HelpPanelCustomTabs />);

    // VA tab should not exist when feature flag is disabled
    const vaTab = screen.queryByRole('tab', { name: /virtual assistant/i });
    expect(vaTab).not.toBeInTheDocument();

    // Should still have Find help tab
    expect(screen.getByText('Find help')).toBeInTheDocument();

    // Restore original mock behavior
    mockUseFlag.mockImplementation((flagName: string) => {
      if (flagName === 'platform.chrome.help-panel_chatbot') return true;
      return true;
    });
  });
});

describe('HelpPanelCustomTabs UI interactions', () => {
  it('switches sub-tab when clicking Learn', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const subtabsContainer = document.querySelector(
      '[data-ouia-component-id="help-panel-subtabs"]'
    ) as HTMLElement;
    expect(subtabsContainer).toBeInTheDocument();

    const learnTab = within(subtabsContainer).getByRole('tab', {
      name: /learn/i,
    });
    fireEvent.click(learnTab);

    // Content container still shows (mock always renders "Panel content")
    const contentContainers = screen.getAllByText('Panel content');
    expect(contentContainers.length).toBeGreaterThan(0);
    // Learn tab is selected (PatternFly sets aria-selected on the tab)
    expect(learnTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches sub-tab when clicking APIs', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const subtabsContainer = document.querySelector(
      '[data-ouia-component-id="help-panel-subtabs"]'
    ) as HTMLElement;
    const apisTab = within(subtabsContainer).getByRole('tab', {
      name: /apis/i,
    });
    fireEvent.click(apisTab);

    expect(apisTab).toHaveAttribute('aria-selected', 'true');
    const contentContainers = screen.getAllByText('Panel content');
    expect(contentContainers.length).toBeGreaterThan(0);
  });

  it('adds a new tab when clicking Add tab button', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    const addTabButton = screen.getByRole('button', { name: /add tab/i });
    fireEvent.click(addTabButton);

    // New tab placeholder appears; main tabs now include "New tab"
    expect(screen.getByText('New tab')).toBeInTheDocument();
    // Three main tabs: "Virtual Assistant", "Find help", and "New tab"
    const mainTabs = document.querySelector(
      '[data-ouia-component-id="help-panel-tabs"]'
    ) as HTMLElement;
    const tabs = within(mainTabs).getAllByRole('tab');
    expect(tabs.length).toBe(3);
    // First tab is VA tab with icon (no specific text content)
    expect(tabs[1]).toHaveTextContent('Find help');
    expect(tabs[2]).toHaveTextContent('New tab');
  });

  it('closes an added tab when clicking its close button', () => {
    renderWithIntl(<HelpPanelCustomTabs />);
    fireEvent.click(screen.getByRole('button', { name: /add tab/i }));

    expect(screen.getByText('New tab')).toBeInTheDocument();

    // Close tab buttons exist (Virtual Assistant and Find help have disabled, New tab has enabled); click the enabled one
    const closeButtons = screen.getAllByRole('button', { name: /close tab/i });
    const closeNewTab = closeButtons.find(
      (btn) => !(btn as HTMLButtonElement).disabled
    );
    expect(closeNewTab).toBeDefined();
    fireEvent.click(closeNewTab!);

    // "New tab" is removed; only permanent tabs remain
    expect(screen.queryByText('New tab')).not.toBeInTheDocument();
    const mainTabs = document.querySelector(
      '[data-ouia-component-id="help-panel-tabs"]'
    ) as HTMLElement;
    const tabs = within(mainTabs).getAllByRole('tab');

    // Should have VA and Find help tabs (since VA flag is enabled in tests)
    expect(tabs.length).toBe(2);
    // First tab is VA tab with icon (no specific text content)
    expect(tabs[1]).toHaveTextContent('Find help');
  });
});
