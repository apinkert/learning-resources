import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import CatalogHeader from './CatalogHeader';

/**
 * Wrapper providing IntlProvider and chrome bundle overrides.
 */
const CatalogHeaderWrapper = ({ bundle = 'settings' }: { bundle?: string }) => {
  /* eslint-disable rulesdir/no-chrome-api-call-from-window */
  const originalRef = React.useRef<{
    getBundleData: typeof window.insights.chrome.getBundleData;
  } | null>(null);

  if (typeof window !== 'undefined' && window.insights?.chrome) {
    if (!originalRef.current) {
      originalRef.current = {
        getBundleData: window.insights.chrome.getBundleData,
      };
    }
    window.insights.chrome.getBundleData = () => ({
      bundleId: bundle,
      bundleTitle: bundle.charAt(0).toUpperCase() + bundle.slice(1),
    });
  }

  React.useEffect(() => {
    return () => {
      if (originalRef.current && window.insights?.chrome) {
        window.insights.chrome.getBundleData =
          originalRef.current.getBundleData;
      }
    };
  }, [bundle]);
  /* eslint-enable rulesdir/no-chrome-api-call-from-window */

  return (
    <IntlProvider locale="en" defaultLocale="en">
      <div style={{ maxWidth: 1200 }}>
        <CatalogHeader />
      </div>
    </IntlProvider>
  );
};

const meta: Meta<typeof CatalogHeaderWrapper> = {
  title: 'Components/Catalog/CatalogHeader',
  component: CatalogHeaderWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default catalog header with Settings bundle.
 * Shows icon, title, description, and link to All Learning catalog.
 */
export const Default: Story = {
  args: { bundle: 'settings' },
};

/**
 * Test that the "All Learning catalog" link opens in a new tab.
 */
export const LinkOpensInNewTab: Story = {
  args: { bundle: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openSpy = spyOn(window, 'open').mockImplementation(() => null);

    try {
      const link = await canvas.findByRole('link', {
        name: /All Learning catalog/i,
      });

      // Verify link attributes
      expect(link).toHaveAttribute('href', '/learning-resources');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');

      // Click the link
      await userEvent.click(link);

      // Note: The link won't actually call window.open since it's a regular <a> tag,
      // but we verify the attributes are correct for accessibility and security
    } finally {
      openSpy.mockRestore();
    }
  },
};

/**
 * Catalog header with different bundle (e.g., Ansible).
 */
export const WithDifferentBundle: Story = {
  args: { bundle: 'ansible' },
};

/**
 * Verify the header displays the correct bundle title in the description.
 */
export const DisplaysBundleTitle: Story = {
  args: { bundle: 'openshift' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the description to appear with the bundle name
    await waitFor(() => {
      const description = canvas.getByText(/related to Openshift/i);
      expect(description).toBeInTheDocument();
    });
  },
};
