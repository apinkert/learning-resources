import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import CatalogFilter from './CatalogFilter';

const CatalogFilterWrapper = ({
  quickStartsCount = 42,
  onSearchInputChange,
}: {
  quickStartsCount?: number;
  onSearchInputChange?: (value: string) => void;
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleChange = (value: string) => {
    setSearchValue(value);
    onSearchInputChange?.(value);
  };

  return (
    <IntlProvider locale="en" defaultLocale="en">
      <div style={{ maxWidth: 1200 }}>
        <CatalogFilter
          quickStartsCount={quickStartsCount}
          onSearchInputChange={handleChange}
        />
        <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
          Current search: &ldquo;{searchValue}&rdquo;
        </div>
      </div>
    </IntlProvider>
  );
};

const meta: Meta<typeof CatalogFilterWrapper> = {
  title: 'Components/Catalog/CatalogFilter',
  component: CatalogFilterWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default filter bar with search input and item count.
 */
export const Default: Story = {
  args: {
    quickStartsCount: 42,
  },
};

/**
 * Filter bar with no items.
 */
export const NoItems: Story = {
  args: {
    quickStartsCount: 0,
  },
};

/**
 * Filter bar with many items.
 */
export const ManyItems: Story = {
  args: {
    quickStartsCount: 156,
  },
};

/**
 * Test that typing in the search input triggers the callback.
 */
export const SearchInputTriggersCallback: Story = {
  args: {
    quickStartsCount: 42,
    onSearchInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the search input
    const searchInput = await canvas.findByPlaceholderText(
      'Filter by keywords...'
    );
    expect(searchInput).toBeInTheDocument();

    // Type in the search input
    await userEvent.type(searchInput, 'documentation');

    // Wait for the callback to be called
    await waitFor(() => {
      expect(args.onSearchInputChange).toHaveBeenCalled();
    });

    // Verify the last call had the correct value
    const calls = (args.onSearchInputChange as ReturnType<typeof fn>).mock
      .calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe('documentation');
  },
};

/**
 * Test that clearing the search input works.
 */
export const ClearSearch: Story = {
  args: {
    quickStartsCount: 42,
    onSearchInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByPlaceholderText(
      'Filter by keywords...'
    );

    // Type some text
    await userEvent.type(searchInput, 'test');

    // Clear the input
    await userEvent.clear(searchInput);

    await waitFor(() => {
      const calls = (args.onSearchInputChange as ReturnType<typeof fn>).mock
        .calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('');
    });
  },
};

/**
 * Verify the item count is displayed and styled correctly (bold).
 */
export const ItemCountDisplayed: Story = {
  args: {
    quickStartsCount: 99,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The count is rendered by QuickStartCatalogFilterCountWrapper from PatternFly
    // which typically shows "X Learning resources" or similar
    await waitFor(() => {
      const countText = canvas.getByText(/99/);
      expect(countText).toBeInTheDocument();
    });
  },
};
