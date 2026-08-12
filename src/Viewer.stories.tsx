import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { Suspense } from 'react';
import { IntlProvider } from 'react-intl';
import { HttpResponse, http } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Viewer } from './Viewer';
import { UnwrappedLoader } from '@redhat-cloud-services/frontend-components-utilities/useSuspenseLoader/useSuspenseLoader';
import fetchAllData from './utils/fetchAllData';

/**
 * Mock data for learning resources
 */
const mockFilters = {
  data: {
    categories: [
      {
        categoryId: 'product-families',
        categoryName: 'Product families',
        categoryData: [
          {
            group: 'Product families',
            data: [
              {
                id: 'insights',
                filterLabel: 'RHEL',
                cardLabel: 'RHEL',
              },
            ],
          },
        ],
      },
    ],
  },
};

const mockQuickstarts = {
  data: [
    {
      content: {
        metadata: {
          name: 'doc-1',
          tags: [{ kind: 'bundle', value: 'settings' }],
          externalDocumentation: true,
          favorite: false,
        },
        spec: {
          displayName: 'Getting started with Settings',
          description: 'Overview of console settings',
          type: { text: 'Documentation', color: 'orange' },
          link: { href: 'https://docs.redhat.com/settings' },
        },
      },
    },
    {
      content: {
        metadata: {
          name: 'doc-2',
          tags: [{ kind: 'bundle', value: 'settings' }],
          externalDocumentation: true,
          favorite: true,
        },
        spec: {
          displayName: 'Configuring integrations',
          description: 'How to set up cloud integrations',
          type: { text: 'Documentation', color: 'orange' },
          link: { href: 'https://docs.redhat.com/integrations' },
        },
      },
    },
    {
      content: {
        metadata: {
          name: 'qs-1',
          tags: [{ kind: 'bundle', value: 'settings' }],
          favorite: false,
        },
        spec: {
          displayName: 'Configure console settings',
          description: 'Step-by-step guide to configure console settings',
          type: { text: 'Quick start', color: 'green' },
          link: { href: 'https://console.redhat.com/settings/quick-start' },
        },
      },
    },
  ],
};

const mockMswHandlers = [
  http.get('/api/quickstarts/v1/quickstarts/filters', () => {
    return HttpResponse.json(mockFilters);
  }),
  http.get('/api/quickstarts/v1/quickstarts', () => {
    return HttpResponse.json(mockQuickstarts);
  }),
  http.get('/api/quickstarts/v1/quickstarts/favorites', () => {
    return HttpResponse.json({ data: [] });
  }),
];

/**
 * Wrapper providing Chrome, IntlProvider and data loading.
 */
const ViewerWrapper = ({ bundle = 'settings' }: { bundle?: string }) => {
  /* eslint-disable rulesdir/no-chrome-api-call-from-window */
  const originalRef = React.useRef<{
    getBundleData: typeof window.insights.chrome.getBundleData;
    auth: typeof window.insights.chrome.auth;
    hideGlobalFilter: typeof window.insights.chrome.hideGlobalFilter;
    updateDocumentTitle: typeof window.insights.chrome.updateDocumentTitle;
  } | null>(null);

  if (typeof window !== 'undefined' && window.insights?.chrome) {
    if (!originalRef.current) {
      originalRef.current = {
        getBundleData: window.insights.chrome.getBundleData,
        auth: window.insights.chrome.auth,
        hideGlobalFilter: window.insights.chrome.hideGlobalFilter,
        updateDocumentTitle: window.insights.chrome.updateDocumentTitle,
      };
    }
    window.insights.chrome.getBundleData = () => ({
      bundleId: bundle,
      bundleTitle: bundle.charAt(0).toUpperCase() + bundle.slice(1),
    });
    window.insights.chrome.auth = {
      getUser: async () => ({
        identity: {
          internal: { account_id: '12345' },
          user: { username: 'test-user' },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    window.insights.chrome.hideGlobalFilter = fn();
    window.insights.chrome.updateDocumentTitle = fn();
  }

  React.useEffect(() => {
    return () => {
      if (originalRef.current && window.insights?.chrome) {
        window.insights.chrome.getBundleData =
          originalRef.current.getBundleData;
        window.insights.chrome.auth = originalRef.current.auth;
        window.insights.chrome.hideGlobalFilter =
          originalRef.current.hideGlobalFilter;
        window.insights.chrome.updateDocumentTitle =
          originalRef.current.updateDocumentTitle;
      }
    };
  }, [bundle]);
  /* eslint-enable rulesdir/no-chrome-api-call-from-window */

  // Create a mock loader
  const mockLoader = (() => {
    return [mockFilters, mockQuickstarts.data.map((item) => item.content)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any as UnwrappedLoader<typeof fetchAllData>;

  return (
    <IntlProvider locale="en" defaultLocale="en">
      <Suspense fallback={<div>Loading...</div>}>
        <div style={{ height: '800px' }}>
          <Viewer bundle={bundle} loader={mockLoader} purgeCache={fn()} />
        </div>
      </Suspense>
    </IntlProvider>
  );
};

const meta: Meta<typeof ViewerWrapper> = {
  title: 'Pages/Learning Resources Viewer',
  component: ViewerWrapper,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: mockMswHandlers,
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Full Learning Resources page with all sections.
 * Shows header, filter bar, expandable sections, and sidebar.
 */
export const Default: Story = {
  args: { bundle: 'settings' },
};

/**
 * Test that the page header link opens correctly.
 */
export const HeaderLinkWorks: Story = {
  args: { bundle: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the page to load by finding the h1
    const title = await canvas.findByRole(
      'heading',
      {
        name: /Learning resources/i,
        level: 1,
      },
      { timeout: 5000 }
    );
    expect(title).toBeInTheDocument();

    // Find and verify the header link
    const link = await canvas.findByRole('link', {
      name: /All Learning catalog/i,
    });
    expect(link).toHaveAttribute('href', '/learning-resources');
    expect(link).toHaveAttribute('target', '_blank');
  },
};

/**
 * Test that sections can be expanded and collapsed.
 */
export const SectionsExpandCollapse: Story = {
  args: { bundle: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to load - find the Documentation section toggle
    const docToggle = await canvas.findByRole(
      'button',
      {
        name: /Documentation/i,
      },
      { timeout: 5000 }
    );
    expect(docToggle).toBeInTheDocument();

    // Should be expanded by default
    expect(docToggle).toHaveAttribute('aria-expanded', 'true');

    // Collapse it
    await userEvent.click(docToggle);

    await waitFor(() => {
      expect(docToggle).toHaveAttribute('aria-expanded', 'false');
    });

    // Expand it again
    await userEvent.click(docToggle);

    await waitFor(() => {
      expect(docToggle).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

/**
 * Test that the filter search works.
 */
export const FilterSearch: Story = {
  args: { bundle: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to load
    await waitFor(
      async () => {
        const searchInput = await canvas.findByPlaceholderText(
          /Filter by keywords/i
        );
        expect(searchInput).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const searchInput = canvas.getByPlaceholderText(/Filter by keywords/i);

    // Type in the search
    await userEvent.type(searchInput, 'integrations');

    // Verify the input value
    expect(searchInput).toHaveValue('integrations');
  },
};

/**
 * Test that the "Jump to section" sidebar works.
 */
export const JumpToSectionWorks: Story = {
  args: { bundle: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for sidebar to load and find the Jump to section heading
    const jumpText = await canvas.findByText(
      /Jump to section/i,
      {},
      { timeout: 5000 }
    );
    expect(jumpText).toBeInTheDocument();

    // Verify sidebar navigation links are present (with counts in parentheses)
    const bookmarksLink = canvas.getByRole('link', { name: /Bookmarks/i });
    const docsLink = canvas.getByRole('link', {
      name: /Documentation \(\d+\)/i,
    });

    expect(bookmarksLink).toBeInTheDocument();
    expect(docsLink).toBeInTheDocument();
  },
};

/**
 * Viewer with different bundle.
 */
export const WithDifferentBundle: Story = {
  args: { bundle: 'ansible' },
};
