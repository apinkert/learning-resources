// Mock Unleash hooks for feature flags

// Default flag configuration - can be overridden via window.__UNLEASH_FLAGS__
const defaultFlags = {
  'help.helppanel.quickstarts': true,
  'help.helppanel.learn': true,
  'help.helppanel.search': true,
  'help.helppanel.api': true,
  'help.helppanel.support': false,
  'help.helppanel.feedback': false,
};

export const useFlags = () => {
  // Allow override via window global for individual stories or QA testing
  const overrides =
    (globalThis as { __UNLEASH_FLAGS__?: Record<string, boolean> })
      .__UNLEASH_FLAGS__ || {};
  return { ...defaultFlags, ...overrides };
};

export const useFlag = (flag: string) => {
  const flags = useFlags();
  return flags[flag as keyof typeof flags] ?? false;
};

export const useFlagsStatus = () => ({ flagsReady: true, flagsError: null });

export const FlagProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
