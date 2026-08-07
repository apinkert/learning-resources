import { useContext, useEffect, useState } from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PRResponse,
  createQuickstartPR,
  quickstartExists,
} from '../../utils/createQuickstartPR';
import { CreatorWizardContext } from './context';

export function useCreatePR(quickstartName: string | null) {
  const { files } = useContext(CreatorWizardContext);
  const chrome = useChrome();

  const [prLoading, setPrLoading] = useState(false);
  const [prResult, setPrResult] = useState<PRResponse | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (quickstartName && quickstartName !== 'untitled-quickstart') {
      quickstartExists(quickstartName).then(setIsUpdate);
    } else {
      setIsUpdate(false);
    }
  }, [quickstartName]);

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
        branchName: `qs-${prefix}-${quickstartName}-${timestamp}`,
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
    isUpdate,
    canCreatePR,
    handleCreatePR,
    setPrResult,
    setPrError,
  };
}
