import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, waitFor, within } from 'storybook/test';
import { AppEntryWithRouter } from './_shared/components/AppEntryWithRouter';
import {
  helpPanelMswHandlers,
  navigateToTab,
  openHelpPanel,
  supportPanelMswHandlers,
  supportPanelMswHandlersWithCases,
  waitForPageLoad,
} from './_shared/helpPanelJourneyHelpers';
import { TEST_TIMEOUTS, delay } from './_shared/testConstants';

/**
 * User Journey: Help Panel - Support Panel
 *
 * Tests the user workflow for viewing support cases and opening a new case from the Help Panel.
 */

const meta: Meta<typeof AppEntryWithRouter> = {
  title: 'User Journeys/Help Panel/Support Panel',
  component: AppEntryWithRouter,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [...helpPanelMswHandlers, ...supportPanelMswHandlers],
    },
    docs: {
      description: {
        component: `
# Help Panel - Support Panel User Journey

Tests the support cases workflow including:
- Opening the Help Panel
- Navigating to the My support cases tab
- Empty state and Open support case button
- Table and pagination when cases exist
        `,
      },
    },
  },
  args: {
    initialRoute: '/',
    bundle: 'insights',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Manual Testing Entry Point
 */
export const ManualTesting: Story = {};

/**
 * 01 / Page Loads
 */
export const Step01_PageLoads: Story = {
  name: '01 / Page Loads',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);
  },
};

/**
 * 02 / Open Help Panel
 */
export const Step02_OpenHelpPanel: Story = {
  name: '02 / Open Help Panel',
  play: async ({ canvasElement }) => {
    await openHelpPanel(canvasElement);
  },
};

/**
 * 03 / Navigate to Support Tab
 */
export const Step03_NavigateToSupportTab: Story = {
  name: '03 / Navigate to Support Tab',
  play: async ({ canvasElement }) => {
    await navigateToTab(canvasElement, 'My support cases');

    // Wait for Support content to load (empty state or table)
    await waitFor(
      () => {
        const emptyState = document.querySelector(
          '[data-ouia-component-id="help-panel-support-empty-state"]'
        );
        const table = document.querySelector(
          '[data-ouia-component-id="help-panel-support-cases-table"]'
        );
        expect(emptyState ?? table).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    await delay(TEST_TIMEOUTS.QUICK_SETTLE);
    console.log('UJ: ✅ Support tab opened and content loaded');
  },
};

/**
 * 04 / Empty State and Open Support Case
 */
export const Step04_EmptyStateAndOpenSupportCase: Story = {
  name: '04 / Empty State and Open Support Case',
  play: async ({ canvasElement }) => {
    await navigateToTab(canvasElement, 'My support cases');

    // Wait for loading to finish: empty state appears (skeleton disappears)
    await waitFor(
      () => {
        const emptyState = document.querySelector(
          '[data-ouia-component-id="help-panel-support-empty-state"]'
        );
        expect(emptyState).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    await delay(TEST_TIMEOUTS.AFTER_CLICK);

    const openSupportCaseButton = document.querySelector(
      '[data-ouia-component-id="help-panel-open-support-case-button"]'
    );
    expect(openSupportCaseButton).toBeInTheDocument();

    console.log('UJ: ✅ Empty state and Open support case button verified');
  },
};

/**
 * 05 / With Cases: Table and Pagination
 */
export const Step05_WithCasesTableAndPagination: Story = {
  name: '05 / With Cases: Table and Pagination',
  parameters: {
    msw: {
      handlers: [...helpPanelMswHandlers, ...supportPanelMswHandlersWithCases],
    },
  },
  play: async ({ canvasElement }) => {
    await navigateToTab(canvasElement, 'My support cases');
    waitForPageLoad(canvasElement);

    // Wait for table to appear (API returns mock cases)
    await waitFor(
      () => {
        const table = document.querySelector(
          '[data-ouia-component-id="help-panel-support-cases-table"]'
        );
        expect(table).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    await delay(TEST_TIMEOUTS.AFTER_CLICK);

    const canvas = within(canvasElement);
    // Verify table has case content (mock case summary)
    await waitFor(
      () => {
        const caseSummary = canvas.queryByText(
          /Insights subscription activation/i
        );
        expect(caseSummary).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    const pagination = document.querySelector(
      '[data-ouia-component-id="help-panel-support-pagination"]'
    );
    expect(pagination).toBeInTheDocument();

    console.log('UJ: ✅ Support cases table and pagination verified');
  },
};
