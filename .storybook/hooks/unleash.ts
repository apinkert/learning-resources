// Mock Unleash hooks for feature flags
export const useFlag = (_flag: string) => false;

export const useFlags = () => ({
  'help.helppanel.quickstarts': false,
  'help.helppanel.learn': false,
  'help.helppanel.search': false,
  'help.helppanel.api': false,
  'help.helppanel.support': false,
  'help.helppanel.feedback': false,
});

export const useFlagsStatus = () => ({ flagsReady: true, flagsError: null });

export const FlagProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
