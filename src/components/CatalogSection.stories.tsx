import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BookmarkedIcon } from './common/BookmarkIcon';
import CatalogSection from './CatalogSection';
import { ExtendedQuickstart } from '../utils/fetchQuickstarts';
import { FilterMap } from '../utils/filtersInterface';
import { TagsEnum } from '../utils/tagsEnum';

const emptyFilterMap: FilterMap = {
  [TagsEnum.ProductFamilies]: {},
  [TagsEnum.UseCase]: {},
};

const mockQuickstarts: ExtendedQuickstart[] = [
  {
    apiVersion: 'console.openshift.io/v1',
    kind: 'QuickStarts',
    metadata: {
      name: 'doc-sample-1',
      tags: [],
      favorite: false,
    },
    spec: {
      version: 0.1,
      displayName: 'Getting started with Red Hat Hybrid Cloud Console',
      icon: <span aria-hidden />,
      description: 'Overview and basic instructions for using the console.',
      type: { text: 'Documentation', color: 'orange' },
      link: { href: 'https://docs.redhat.com/example' },
    },
  },
  {
    apiVersion: 'console.openshift.io/v1',
    kind: 'QuickStarts',
    metadata: {
      name: 'doc-sample-2',
      tags: [],
      favorite: false,
    },
    spec: {
      version: 0.1,
      displayName: 'Configuring notifications and integrations',
      icon: <span aria-hidden />,
      description: 'Configuring settings for event-triggered notifications.',
      type: { text: 'Documentation', color: 'orange' },
      link: { href: 'https://docs.redhat.com/notifications' },
    },
  },
];

const mockBookmarkedQuickstarts: ExtendedQuickstart[] = [
  {
    apiVersion: 'console.openshift.io/v1',
    kind: 'QuickStarts',
    metadata: {
      name: 'bookmarked-sample-1',
      tags: [],
      favorite: true,
    },
    spec: {
      version: 0.1,
      displayName: 'Configuring cloud integrations for Red Hat services',
      icon: <span aria-hidden />,
      description: 'How to link your Red Hat account to a public cloud.',
      type: { text: 'Documentation', color: 'orange' },
      link: { href: 'https://docs.redhat.com/cloud-integration' },
    },
  },
];

const CatalogSectionWrapper = ({
  sectionCount,
  sectionQuickStarts,
  sectionName,
  sectionTitle,
  sectionDescription,
  isExpandable = true,
  emptyBody,
  purgeCache = fn(),
}: {
  sectionCount: number;
  sectionQuickStarts: ExtendedQuickstart[];
  sectionName: string;
  sectionTitle: React.ReactNode;
  sectionDescription?: string;
  isExpandable?: boolean;
  emptyBody?: React.ReactNode;
  purgeCache?: () => void;
}) => {
  return (
    <IntlProvider locale="en" defaultLocale="en">
      <div style={{ maxWidth: 1200, backgroundColor: '#f0f0f0', padding: 16 }}>
        <CatalogSection
          sectionName={sectionName}
          sectionCount={sectionCount}
          sectionQuickStarts={sectionQuickStarts}
          sectionTitle={sectionTitle}
          sectionDescription={sectionDescription}
          isExpandable={isExpandable}
          emptyBody={emptyBody}
          filterMap={emptyFilterMap}
          purgeCache={purgeCache}
        />
      </div>
    </IntlProvider>
  );
};

const meta: Meta<typeof CatalogSectionWrapper> = {
  title: 'Components/Catalog/CatalogSection',
  component: CatalogSectionWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default expandable section with documentation items.
 */
export const DocumentationSection: Story = {
  args: {
    sectionName: 'documentation',
    sectionTitle: 'Documentation',
    sectionDescription: 'Technical information for using the service',
    sectionCount: mockQuickstarts.length,
    sectionQuickStarts: mockQuickstarts,
  },
};

/**
 * Bookmarks section with bookmarked icon.
 */
export const BookmarksSection: Story = {
  args: {
    sectionName: 'bookmarks',
    sectionTitle: (
      <span>
        <BookmarkedIcon className="pf-v6-u-mr-sm" />
        Bookmarks
      </span>
    ),
    sectionCount: mockBookmarkedQuickstarts.length,
    sectionQuickStarts: mockBookmarkedQuickstarts,
  },
};

/**
 * Empty section with no items.
 */
export const EmptySection: Story = {
  args: {
    sectionName: 'learning-paths',
    sectionTitle: 'Learning paths',
    sectionDescription: 'Collections of learning materials',
    sectionCount: 0,
    sectionQuickStarts: [],
  },
};

/**
 * Disabled section (empty and expandable).
 * When a section has 0 items and isExpandable=true, it renders as disabled.
 */
export const DisabledSection: Story = {
  args: {
    sectionName: 'other-content-types',
    sectionTitle: 'Other content types',
    sectionDescription: 'Tutorials, videos, e-books',
    sectionCount: 0,
    sectionQuickStarts: [],
    isExpandable: true,
  },
};

/**
 * Test that clicking the expandable section toggle collapses/expands the content.
 */
export const ExpandCollapseInteraction: Story = {
  args: {
    sectionName: 'quick-starts',
    sectionTitle: 'Quick starts',
    sectionDescription: 'Step-by-step instructions and tasks',
    sectionCount: mockQuickstarts.length,
    sectionQuickStarts: mockQuickstarts,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the expandable section toggle button
    const toggleButton = await canvas.findByRole('button', {
      name: /Quick starts/i,
    });

    // Section should be expanded by default
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    // Click to expand again
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

/**
 * Test that the arrow icon rotates correctly.
 */
export const ArrowRotation: Story = {
  args: {
    sectionName: 'documentation',
    sectionTitle: 'Documentation',
    sectionCount: mockQuickstarts.length,
    sectionQuickStarts: mockQuickstarts,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggleButton = await canvas.findByRole('button', {
      name: /Documentation/i,
    });

    // Expanded state - arrow should point down (90deg rotation)
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Collapse the section
    await userEvent.click(toggleButton);

    await waitFor(() => {
      // Collapsed state - arrow should point right (0deg rotation)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/**
 * Section with many items to test scrolling behavior.
 */
export const SectionWithManyItems: Story = {
  args: {
    sectionName: 'documentation',
    sectionTitle: 'Documentation',
    sectionDescription: 'Technical information for using the service',
    sectionCount: 10,
    sectionQuickStarts: Array.from({ length: 10 }, (_, i) => ({
      ...mockQuickstarts[0],
      metadata: {
        ...mockQuickstarts[0].metadata,
        name: `doc-sample-${i}`,
      },
      spec: {
        ...mockQuickstarts[0].spec,
        displayName: `Documentation Item ${i + 1}`,
        description: `Sample documentation description ${i + 1}`,
      },
    })),
  },
};

/**
 * Verify that the badge displays the correct count.
 */
export const BadgeDisplaysCount: Story = {
  args: {
    sectionName: 'documentation',
    sectionTitle: 'Documentation',
    sectionCount: 42,
    sectionQuickStarts: mockQuickstarts,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the badge with the count
    const badge = await canvas.findByText('42');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('pf-v6-c-badge');
  },
};
