import React, { ReactNode } from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { CheckIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useIntl } from 'react-intl';
import messages from '../../../../Messages';

type ResultType = 'success' | 'error';

export type FeedbackResultProps = {
  type: ResultType;
  title: string;
  description: string | ReactNode;
  onBack: () => void;
  onShareGeneralFeedback?: () => void;
  onReportBug?: () => void;
  onInformDirection?: () => void;
};

const SUPPORT_CASE_URL =
  'https://access.redhat.com/support/cases/#/case/new/get-support?caseCreate=true&source=console';

const FeedbackResult: React.FC<FeedbackResultProps> = ({
  type,
  title,
  description,
  onBack,
  onShareGeneralFeedback,
  onReportBug,
  onInformDirection,
}) => {
  const intl = useIntl();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const isSuccess = type === 'success';
  const IconComponent = isSuccess ? CheckIcon : ExclamationTriangleIcon;
  const iconColor = isSuccess
    ? 'var(--pf-t--global--icon--color--status--success--default)'
    : 'var(--pf-t--global--icon--color--status--danger--default)';
  const buttonText = isSuccess
    ? intl.formatMessage(messages.close)
    : intl.formatMessage(messages.back);

  const renderDescription = () => {
    if (type === 'error') {
      return (
        <Content component="p" className="pf-v6-u-mb-lg">
          {description}{' '}
          <Content
            component="a"
            href={SUPPORT_CASE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {intl.formatMessage(messages.redHatSupport)}
          </Content>
        </Content>
      );
    }

    return (
      <Content component="p" className="pf-v6-u-mb-lg">
        {description}
      </Content>
    );
  };

  const dropdownItems = [
    <DropdownItem
      key="shareGeneral"
      onClick={() => {
        setIsDropdownOpen(false);
        onShareGeneralFeedback?.();
      }}
    >
      {intl.formatMessage(messages.shareFeedback)}
    </DropdownItem>,
    <DropdownItem
      key="reportBug"
      onClick={() => {
        setIsDropdownOpen(false);
        onReportBug?.();
      }}
    >
      {intl.formatMessage(messages.reportABug)}
    </DropdownItem>,
    <DropdownItem
      key="informDirection"
      onClick={() => {
        setIsDropdownOpen(false);
        onInformDirection?.();
      }}
    >
      {intl.formatMessage(messages.informRedhatDirection)}
    </DropdownItem>,
  ];

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      isExpanded={isDropdownOpen}
      variant="secondary"
    >
      {intl.formatMessage(messages.shareMoreFeedback)}
    </MenuToggle>
  );

  return (
    <div className="pf-v6-u-text-align-center pf-v6-u-mt-lg">
      <Icon size="lg" className="pf-v6-u-mb-md">
        <IconComponent color={iconColor} />
      </Icon>
      <Content>
        <Content component={ContentVariants.h2}>{title}</Content>
        {renderDescription()}
      </Content>
      {isSuccess && (
        <div className="pf-v6-u-mb-md">
          <Dropdown
            isOpen={isDropdownOpen}
            onSelect={() => setIsDropdownOpen(false)}
            onOpenChange={setIsDropdownOpen}
            toggle={toggle}
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
        </div>
      )}
      <Button variant="primary" onClick={onBack}>
        {buttonText}
      </Button>
    </div>
  );
};

export default FeedbackResult;
