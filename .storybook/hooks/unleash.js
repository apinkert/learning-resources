/**
 * Mock @unleash/proxy-client-react for Storybook
 * Based on insights-rbac-ui pattern
 */

// Mock useFlag hook - always returns false
export const useFlag = () => false;

// Mock other exports
export const FlagProvider = ({ children }) => children;
export const UnleashClient = class {};
export const useUnleashContext = () => ({});
export const useVariant = () => ({ name: 'disabled', enabled: false });
export const useFlags = () => [];
