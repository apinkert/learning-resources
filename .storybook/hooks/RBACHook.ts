// Mock RBAC hook for permissions
export const usePermissions = () => ({
  hasAccess: true,
  isLoading: false,
  permissions: [],
});

export default usePermissions;
