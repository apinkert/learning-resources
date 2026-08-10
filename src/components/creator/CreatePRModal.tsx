import React from 'react';
import {
  Alert,
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@patternfly/react-core';
import CodeBranchIcon from '@patternfly/react-icons/dist/dynamic/icons/code-branch-icon';
import { PRResponse } from '../../utils/createQuickstartPR';

type CreatePRModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quickstartName: string;
  prLoading: boolean;
  prResult: PRResponse | null;
  prError: string | null;
};

const CreatePRModal: React.FC<CreatePRModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quickstartName,
  prLoading,
  prResult,
  prError,
}) => {
  const showConfirm = !prLoading && !prResult && !prError;

  return (
    <Modal
      isOpen={isOpen}
      onClose={prLoading ? undefined : onClose}
      aria-label="Create Pull Request"
      variant="small"
    >
      <ModalHeader
        title={
          prResult
            ? 'Pull Request Created'
            : prError
            ? 'Pull Request Failed'
            : 'Create Pull Request'
        }
      />
      <ModalBody>
        {showConfirm && (
          <Content component="p">
            This will submit a pull request for{' '}
            <strong>{quickstartName}</strong> to the quickstarts repository. The
            PR will be checked against existing quickstarts to determine if this
            is a new submission or an update.
          </Content>
        )}
        {prLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spinner size="lg" />
            <Content component="p" className="pf-v6-u-mt-md">
              Submitting pull request...
            </Content>
          </div>
        )}
        {prResult && (
          <Alert variant="success" title="PR created successfully" isInline>
            <a href={prResult.prUrl} target="_blank" rel="noopener noreferrer">
              {prResult.prUrl}
            </a>
          </Alert>
        )}
        {prError && (
          <Alert variant="danger" title="Failed to create PR" isInline>
            {prError}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        {showConfirm && (
          <Button
            variant="primary"
            onClick={onConfirm}
            icon={<CodeBranchIcon />}
          >
            Confirm
          </Button>
        )}
        {prError && (
          <Button variant="primary" onClick={onConfirm}>
            Retry
          </Button>
        )}
        <Button variant="link" onClick={onClose} isDisabled={prLoading}>
          {prResult ? 'Close' : 'Cancel'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreatePRModal;
