import { useContext, useState } from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PRResponse,
  createQuickstartPR,
  listRepoQuickstarts,
} from '../../utils/createQuickstartPR';
import { CreatorWizardContext } from './context';

export function useCreatePR(quickstartName: string | null) {
  const { files } = useContext(CreatorWizardContext);
  const chrome = useChrome();

  const [prLoading, setPrLoading] = useState(false);
  const [prResult, setPrResult] = useState<PRResponse | null>(null);
  const [prError, setPrError] = useState<string | null>(null);

  const canCreatePR =
    files.length > 0 &&
    !!quickstartName &&
    quickstartName !== 'untitled-quickstart';

  const handleCreatePR = async () => {
    if (!quickstartName || prLoading) return;
    setPrLoading(true);
    setPrResult(null);
    setPrError(null);
    try {
      const timestamp = Date.now();
      const safeName = quickstartName
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '');
      if (!safeName) {
        setPrError('Quickstart name is not valid for a branch name.');
        setPrLoading(false);
        return;
      }

      let isUpdate = false;
      try {
        const repoEntries = await listRepoQuickstarts();
        isUpdate = repoEntries.some((e) => e.name === quickstartName);
      } catch {
        // If repo check fails, default to create
      }

      const prefix = isUpdate ? 'update' : 'create';
      let commitMessage = `feat(quickstarts): ${prefix} ${quickstartName}`;
      const user = await chrome.auth.getUser();
      const identity = user?.identity?.user;
      if (identity?.email) {
        const name =
          [identity.first_name, identity.last_name].filter(Boolean).join(' ') ||
          identity.email;
        commitMessage += `\n\nCo-authored-by: ${name} <${identity.email}>`;
      }
      const result = await createQuickstartPR(files, {
        branchName: `qs-${prefix}-${safeName}-${timestamp}`,
        commitMessage,
        prTitle: `feat(quickstarts): ${prefix} ${quickstartName}`,
        prBody: `${
          isUpdate ? 'Updating' : 'Adding new'
        } quickstart via the Quickstarts Creator tool.\n\nDirectory: docs/quickstarts/${quickstartName}/`,
        isUpdate,
        directoryName: quickstartName,
        ...(isUpdate
          ? { existingPath: `docs/quickstarts/${quickstartName}/` }
          : {}),
      });
      setPrResult(result);
    } catch (err) {
      setPrError(err instanceof Error ? err.message : 'Failed to create PR');
    } finally {
      setPrLoading(false);
    }
  };

  return {
    prLoading,
    prResult,
    prError,
    canCreatePR,
    handleCreatePR,
    setPrResult,
    setPrError,
  };
}
