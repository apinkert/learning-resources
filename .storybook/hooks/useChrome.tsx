// Mock chrome object for Storybook
export const useChrome = () => ({
  analytics: {
    track: (event: string, properties?: Record<string, unknown>) => {
      console.log('Analytics track:', event, properties);
    },
  },
  auth: {
    getUser: () =>
      Promise.resolve({
        identity: {
          account_number: '123456',
          type: 'User',
          user: {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_active: true,
            is_org_admin: false,
            username: 'testuser',
          },
        },
      }),
  },
  helpTopics: {
    setActiveTopic: (topic: string) => {
      console.log('Setting active help topic:', topic);
    },
    enableTopics: (topics: string[]) => {
      console.log('Enabling help topics:', topics);
    },
    disableTopics: (topics: string[]) => {
      console.log('Disabling help topics:', topics);
    },
  },
  quickStarts: {
    set: (quickStarts: unknown[]) => {
      console.log('Setting quick starts:', quickStarts);
    },
  },
  updateDocumentTitle: (title: string) => {
    document.title = title;
  },
  getUserPermissions: (_app?: string) => Promise.resolve([]),
  getEnvironment: () => 'stage',
  getBundle: () => 'insights',
  getApp: () => 'learning-resources',
  isBeta: () => false,
});

export default useChrome;
