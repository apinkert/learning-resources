import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppEntryWithLinks } from './_shared/components/AppEntryWithLinks';
import {
  helpPanelMswHandlers,
  waitForPageLoad,
} from './_shared/helpPanelJourneyHelpers';
import { TEST_TIMEOUTS, delay } from './_shared/testConstants';

/**
 * User Journey: Help Panel - In-Page Links
 *
 * Tests the complete user workflow for clicking in-page HelpPanelLink components
 * and verifying the help panel opens with the correct tab and content.
 *
 * This verifies that links embedded in console pages correctly trigger the
 * help panel drawer and navigate to the appropriate tab (Learn, APIs, Support,
 * Knowledge Base, Feedback) or display custom content.
 */

const meta: Meta<typeof AppEntryWithLinks> = {
  title: 'User Journeys/Help Panel/In-Page Links',
  component: AppEntryWithLinks,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: helpPanelMswHandlers,
    },
    docs: {
      description: {
        component: `
# Help Panel - In-Page Links User Journey

Tests the in-page link functionality where clicking a HelpPanelLink
in the console opens the help panel with specific content:

- Clicking a Learn link opens the Learn tab
- Clicking an API link opens the APIs tab
- Clicking a Support link opens the Support tab
- Clicking a link with custom content displays that content
- Clicking a Knowledge Base link opens the KB tab
- Clicking a Feedback link opens the Feedback tab
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
 *
 * Use this story to manually test in-page links.
 * Click any of the HelpPanelLink buttons on the page cards
 * and verify the help panel opens with the correct tab.
 */
export const ManualTesting: Story = {};

/**
 * 01 / Page Loads with In-Page Links
 *
 * Verifies the page loads with HelpPanelLink components visible in the cards.
 */
export const Step01_PageLoadsWithLinks: Story = {
  name: '01 / Page Loads with In-Page Links',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Verify HelpPanelLink buttons are present
    await canvas.findByRole('button', { name: /view getting started guide/i });
    await canvas.findByRole('button', { name: /view api documentation/i });
    await canvas.findByRole('button', { name: /get support/i });
    await canvas.findByRole('button', { name: /view feature help/i });
    await canvas.findByRole('button', { name: /browse knowledge base/i });
    await canvas.findByRole('button', { name: /give feedback/i });

    console.log('UJ: \u2705 Page loaded with all in-page link buttons visible');
  },
};

/**
 * 02 / Click Learn Link Opens Help Panel
 *
 * Clicking the "View getting started guide" link should open the help panel
 * with a new tab titled "Getting Started Guide" showing the Learn sub-tab.
 */
export const Step02_ClickLearnLink: Story = {
  name: '02 / Click Learn Link Opens Help Panel',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the Learn link
    const learnLink = await canvas.findByRole('button', {
      name: /view getting started guide/i,
    });
    await userEvent.click(learnLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open by checking for the panel title
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created with the correct title
    await waitFor(
      () => {
        const tabText = canvas.getByText('Getting Started Guide');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log(
      'UJ: \u2705 Learn link opened help panel with "Getting Started Guide" tab'
    );
  },
};

/**
 * 03 / Click API Link Opens API Tab
 *
 * Clicking the "View API documentation" link should open the help panel
 * with a new tab showing the APIs sub-tab content.
 */
export const Step03_ClickAPILink: Story = {
  name: '03 / Click API Link Opens API Tab',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the API link
    const apiLink = await canvas.findByRole('button', {
      name: /view api documentation/i,
    });
    await userEvent.click(apiLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created with the correct title
    await waitFor(
      () => {
        const tabText = canvas.getByText('API Documentation');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the APIs sub-tab is active by checking for API content
    await waitFor(
      () => {
        const apiSubTab = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-subtab-api"]'
        );
        expect(apiSubTab).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log(
      'UJ: \u2705 API link opened help panel with "API Documentation" tab'
    );
  },
};

/**
 * 04 / Click Support Link Opens Support Tab
 *
 * Clicking the "Get support" link should open the help panel
 * with a new tab showing the Support sub-tab content.
 */
export const Step04_ClickSupportLink: Story = {
  name: '04 / Click Support Link Opens Support Tab',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the Support link
    const supportLink = await canvas.findByRole('button', {
      name: /get support/i,
    });
    await userEvent.click(supportLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created with the correct title
    await waitFor(
      () => {
        const tabText = canvas.getByText('Support');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the Support sub-tab is active
    await waitFor(
      () => {
        const supportSubTab = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-subtab-support"]'
        );
        expect(supportSubTab).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log('UJ: \u2705 Support link opened help panel with "Support" tab');
  },
};

/**
 * 05 / Click Custom Content Link Shows Custom Content
 *
 * Clicking the "View feature help" link should open the help panel
 * with a new tab containing custom content passed via HelpPanelLink.
 */
export const Step05_ClickCustomContentLink: Story = {
  name: '05 / Click Custom Content Link Shows Custom Content',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the custom content link
    const customLink = await canvas.findByRole('button', {
      name: /view feature help/i,
    });
    await userEvent.click(customLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created with the correct title
    await waitFor(
      () => {
        const tabText = canvas.getByText('Feature Help');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify custom content is rendered in the help panel
    await waitFor(
      () => {
        const customContent = canvasElement.querySelector(
          '[data-ouia-component-id="custom-help-content"]'
        );
        expect(customContent).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the custom content text
    await canvas.findByText(
      'This is custom help content passed via HelpPanelLink.'
    );

    console.log(
      'UJ: \u2705 Custom content link opened help panel with custom content displayed'
    );
  },
};

/**
 * 06 / Click Knowledge Base Link Opens KB Tab
 *
 * Clicking the "Browse knowledge base" link should open the help panel
 * with a new tab showing the Knowledge Base sub-tab content.
 */
export const Step06_ClickKBLink: Story = {
  name: '06 / Click Knowledge Base Link Opens KB Tab',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the KB link
    const kbLink = await canvas.findByRole('button', {
      name: /browse knowledge base/i,
    });
    await userEvent.click(kbLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created
    await waitFor(
      () => {
        const tabText = canvas.getByText('Knowledge Base');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the KB sub-tab is active
    await waitFor(
      () => {
        const kbSubTab = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-subtab-kb"]'
        );
        expect(kbSubTab).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log(
      'UJ: \u2705 Knowledge Base link opened help panel with "Knowledge Base" tab'
    );
  },
};

/**
 * 07 / Click Feedback Link Opens Feedback Tab
 *
 * Clicking the "Give feedback" link should open the help panel
 * with a new tab showing the Feedback sub-tab content.
 */
export const Step07_ClickFeedbackLink: Story = {
  name: '07 / Click Feedback Link Opens Feedback Tab',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the Feedback link
    const feedbackLink = await canvas.findByRole('button', {
      name: /give feedback/i,
    });
    await userEvent.click(feedbackLink);

    // Wait for the help panel to open
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify the help panel is open
    await waitFor(
      () => {
        const helpTitle = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-title"]'
        );
        expect(helpTitle).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the new tab was created
    await waitFor(
      () => {
        const tabText = canvas.getByText('Share feedback');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the Feedback sub-tab is active
    await waitFor(
      () => {
        const feedbackSubTab = canvasElement.querySelector(
          '[data-ouia-component-id="help-panel-subtab-feedback"]'
        );
        expect(feedbackSubTab).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log(
      'UJ: \u2705 Feedback link opened help panel with "Share feedback" tab'
    );
  },
};

/**
 * 08 / Multiple Links Create Separate Tabs
 *
 * Clicking two different in-page links creates separate tabs in the help panel.
 * After clicking Learn and then API links, both tabs should be visible.
 */
export const Step08_MultipleLinksCreateTabs: Story = {
  name: '08 / Multiple Links Create Separate Tabs',
  play: async ({ canvasElement }) => {
    await waitForPageLoad(canvasElement);

    const canvas = within(canvasElement);

    // Click the Learn link first
    const learnLink = await canvas.findByRole('button', {
      name: /view getting started guide/i,
    });
    await userEvent.click(learnLink);
    await delay(TEST_TIMEOUTS.AFTER_DRAWER_OPEN);

    // Verify first tab created
    await waitFor(
      () => {
        const tabText = canvas.getByText('Getting Started Guide');
        expect(tabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Click the API link (panel is already open)
    const apiLink = await canvas.findByRole('button', {
      name: /view api documentation/i,
    });
    await userEvent.click(apiLink);
    await delay(TEST_TIMEOUTS.AFTER_TAB_CHANGE);

    // Verify second tab created
    await waitFor(
      () => {
        const apiTabText = canvas.getByText('API Documentation');
        expect(apiTabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    // Verify the first tab still exists
    await waitFor(
      () => {
        const learnTabText = canvas.getByText('Getting Started Guide');
        expect(learnTabText).toBeInTheDocument();
      },
      { timeout: TEST_TIMEOUTS.ELEMENT_WAIT }
    );

    console.log(
      'UJ: \u2705 Multiple in-page links created separate tabs in help panel'
    );
  },
};
