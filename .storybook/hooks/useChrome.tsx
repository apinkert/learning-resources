/**
 * Mock useChrome for Storybook
 * Based on insights-rbac-ui pattern
 */

export default function useChrome() {
  // Return the mock chrome from window if available
  if (typeof window !== 'undefined' && window.insights?.chrome) {
    // @ts-ignore
    return window.insights.chrome;
  }

  // Fallback mock
  return {
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
      if (typeof document !== 'undefined') {
        document.title = title;
      }
    },
    hideGlobalFilter: () => {},
    isBeta: () => false,
    isProd: () => false,
    getEnvironment: () => 'stage',
  };
}

// Named export for compatibility
export { useChrome };
