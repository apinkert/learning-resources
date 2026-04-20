import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import APIPanel from './APIPanel';
import {
  fetchBundleInfo,
  fetchBundles,
} from '../../../utils/fetchBundleInfoAPI';

// Mock the fetch functions
jest.mock('../../../utils/fetchBundleInfoAPI');

// Mock useChrome hook
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    getBundleData: () => ({ bundleId: 'insights' }),
    getAvailableBundles: () => [{ id: 'insights', title: 'RHEL' }],
  }),
}));

const mockFetchBundleInfo = fetchBundleInfo as jest.MockedFunction<
  typeof fetchBundleInfo
>;
const mockFetchBundles = fetchBundles as jest.MockedFunction<
  typeof fetchBundles
>;

describe('APIPanel', () => {
  const mockSetNewActionTitle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockFetchBundleInfo.mockResolvedValue([]);
    mockFetchBundles.mockResolvedValue([]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    // Wait for the empty state message
    await waitFor(() => {
      expect(
        screen.getByText(/No API documentation found matching your criteria/i)
      ).toBeInTheDocument();
    });
  });

  it('capitalizes API names correctly and strips API suffix', async () => {
    mockFetchBundleInfo.mockResolvedValue([
      {
        bundleLabels: ['insights'],
        frontendName: 'advisor api',
        url: 'https://developers.redhat.com/api-catalog/api/advisor',
      },
      {
        bundleLabels: ['insights'],
        frontendName: 'notifications',
        url: 'https://developers.redhat.com/api-catalog/api/notifications/v1',
      },
    ]);

    mockFetchBundles.mockResolvedValue([
      { id: 'insights', title: 'RHEL', navItems: [] },
    ]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Advisor')).toBeInTheDocument();
    });

    expect(screen.getByText('Notifications v1')).toBeInTheDocument();
  });

  it('shows different versions separately', async () => {
    mockFetchBundleInfo.mockResolvedValue([
      {
        bundleLabels: ['insights'],
        frontendName: 'notifications',
        url: 'https://developers.redhat.com/api-catalog/api/notifications/v1',
      },
      {
        bundleLabels: ['insights'],
        frontendName: 'notifications',
        url: 'https://developers.redhat.com/api-catalog/api/notifications/v2.0',
      },
    ]);

    mockFetchBundles.mockResolvedValue([
      { id: 'insights', title: 'RHEL', navItems: [] },
    ]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Notifications v1')).toBeInTheDocument();
    });

    expect(screen.getByText('Notifications v2.0')).toBeInTheDocument();
    expect(screen.getByText(/API Documentation \(2\)/i)).toBeInTheDocument();
  });

  it('handles APIs without version numbers', async () => {
    mockFetchBundleInfo.mockResolvedValue([
      {
        bundleLabels: ['insights'],
        frontendName: 'advisor api',
        url: 'https://developers.redhat.com/api-catalog/api/advisor',
      },
    ]);

    mockFetchBundles.mockResolvedValue([
      { id: 'insights', title: 'RHEL', navItems: [] },
    ]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Advisor')).toBeInTheDocument();
    });

    // Should not have a version suffix
    expect(screen.queryByText(/Advisor v/)).not.toBeInTheDocument();
  });

  it('handles acronyms correctly', async () => {
    mockFetchBundleInfo.mockResolvedValue([
      {
        bundleLabels: ['iam'],
        frontendName: 'rbac',
        url: 'https://developers.redhat.com/api-catalog/api/rbac/v1',
      },
    ]);

    mockFetchBundles.mockResolvedValue([
      { id: 'iam', title: 'Identity & Access Management', navItems: [] },
    ]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('RBAC v1')).toBeInTheDocument();
    });
  });

  it('strips various API suffix formats', async () => {
    mockFetchBundleInfo.mockResolvedValue([
      {
        bundleLabels: ['insights'],
        frontendName: 'notifications api',
        url: 'https://developers.redhat.com/api-catalog/api/notifications/v1',
      },
      {
        bundleLabels: ['insights'],
        frontendName: 'sources APIs',
        url: 'https://developers.redhat.com/api-catalog/api/sources/v2',
      },
      {
        bundleLabels: ['insights'],
        frontendName: 'advisor API  ',
        url: 'https://developers.redhat.com/api-catalog/api/advisor/v3',
      },
    ]);

    mockFetchBundles.mockResolvedValue([
      { id: 'insights', title: 'RHEL', navItems: [] },
    ]);

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <APIPanel setNewActionTitle={mockSetNewActionTitle} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Notifications v1')).toBeInTheDocument();
    });

    // Verify "APIs" (plural) is also stripped
    expect(screen.getByText('Sources v2')).toBeInTheDocument();

    // Verify trailing whitespace is handled
    expect(screen.getByText('Advisor v3')).toBeInTheDocument();
  });
});
