import React, { ReactNode, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Label,
  Panel,
  PanelMain,
  PanelMainBody,
  Stack,
  StackItem,
  TextArea,
} from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import messages from '../../../../Messages';

export type FeedbackFormProps = {
  onBack: () => void;
  onSubmit: () => void;
  onError: () => void;
  modalTitle: string;
  modalDescription?: string | ReactNode;
  feedbackType: 'Feedback' | 'Bug' | '[Research Opportunities]';
  checkboxDescription: string;
  textAreaHidden?: boolean;
  submitTitle: string;
  onBreadcrumbClick?: () => void;
};

const isSubmissionAvailable = () => {
  const hostname = window.location.hostname;
  return hostname.includes('prod') || hostname.includes('stage');
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onBack,
  onSubmit,
  onError,
  modalTitle,
  modalDescription,
  feedbackType,
  checkboxDescription,
  textAreaHidden = false,
  submitTitle,
  onBreadcrumbClick,
}) => {
  const intl = useIntl();
  const chrome = useChrome();
  const [textAreaValue, setTextAreaValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const isAvailable = isSubmissionAvailable();

  useEffect(() => {
    if (checked && chrome?.auth?.getUser) {
      chrome.auth
        .getUser()
        .then((user) =>
          setUserEmail(user?.identity?.user?.email || 'Unable to load email')
        )
        .catch(() => setUserEmail('Unable to load email'));
    } else if (checked) {
      setUserEmail('Unable to load email');
    }
  }, [checked, chrome.auth]);

  const handleModalSubmission = async () => {
    setIsSubmitting(true);

    try {
      if (!isAvailable) {
        console.log('Submitting feedback only works in prod and stage');
        onSubmit();
        return;
      }

      if (!chrome?.auth?.getUser || !chrome?.auth?.getToken) {
        throw new Error('Chrome auth not available');
      }

      const [user, token] = await Promise.all([
        chrome.auth.getUser(),
        chrome.auth.getToken(),
      ]);

      if (!user) throw new Error('User not logged in');

      const response = await fetch(
        `${window.origin}/api/platform-feedback/v1/issues`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `${feedbackType} ${textAreaValue}, Username: ${
              user.identity?.user?.username || 'unknown'
            }, Account ID: ${
              user.identity?.account_number ||
              user.identity?.internal?.account_id ||
              'unknown'
            }, Email: ${
              checked ? user.identity?.user?.email || 'unknown' : ''
            }, URL: ${window.location.href}`,
            summary: `[learning-resources] App Feedback`,
            labels: ['learning-resources', 'help-panel-feedback'],
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit feedback');
      onSubmit();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      onError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack hasGutter>
      {onBreadcrumbClick && (
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem
              onClick={onBreadcrumbClick}
              className="feedback-breadcrumb-link"
            >
              {intl.formatMessage(messages.breadcrumbShareFeedback)}
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{modalTitle}</BreadcrumbItem>
          </Breadcrumb>
        </StackItem>
      )}
      {modalDescription && (
        <StackItem>
          <Content component="p">{modalDescription}</Content>
        </StackItem>
      )}

      <StackItem>
        <Form>
          {!textAreaHidden && (
            <FormGroup fieldId="feedback-description-text">
              <TextArea
                value={textAreaValue}
                onChange={(_event, value) => setTextAreaValue(value)}
                name="feedback-description-text"
                id="feedback-description-text"
                autoResize
                aria-label="Feedback text"
                placeholder={intl.formatMessage(messages.feedbackPlaceholder)}
              />
            </FormGroup>
          )}

          <FormGroup className="pf-v6-u-mt-md">
            <Checkbox
              id="feedback-checkbox"
              isChecked={checked}
              onChange={() => setChecked(!checked)}
              label={intl.formatMessage(messages.researchOpportunities)}
              description={checkboxDescription}
            />
          </FormGroup>
        </Form>
      </StackItem>

      {checked && (
        <StackItem>
          <div className="pf-v6-u-font-family-heading-sans-serif pf-v6-u-font-weight-bold pf-v6-u-mb-sm">
            {intl.formatMessage(messages.email)}
          </div>
          <Panel variant="raised">
            <PanelMain>
              <PanelMainBody className="pf-v6-u-py-sm">
                {userEmail || 'Loading...'}
              </PanelMainBody>
            </PanelMain>
          </Panel>
        </StackItem>
      )}

      {!isAvailable && (
        <StackItem>
          <Label color="red">
            {intl.formatMessage(messages.submitOnlyInStageProd)}
          </Label>
        </StackItem>
      )}

      <StackItem className="pf-v6-u-mt-md">
        <Flex spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Button
              variant="secondary"
              onClick={onBack}
              isDisabled={isSubmitting}
            >
              {intl.formatMessage(messages.back)}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant="primary"
              isDisabled={
                feedbackType !== '[Research Opportunities]'
                  ? textAreaValue.length <= 1
                  : !checked
              }
              isLoading={isSubmitting}
              onClick={handleModalSubmission}
            >
              {submitTitle}
            </Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default FeedbackForm;
